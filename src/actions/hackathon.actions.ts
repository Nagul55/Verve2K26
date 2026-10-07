"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from "next/cache";
import { randomUUID } from 'crypto';
import { getMimeType } from '@/lib/mimeUtils';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function createHackathon(formData: FormData) {
  const adminClient = getAdminClient();
  const data = JSON.parse(formData.get('data') as string);

  // 1. Create the parent event in `fests`
  const initialStatus = data.coordinator_id ? 'PENDING_APPROVAL' : 'DRAFT';
  const { data: festData, error: festError } = await adminClient.from('fests').insert({
    name: data.name,
    description: data.tagline || data.description || '',
    min_technical: 0,
    min_non_technical: 0,
    event_type: 'hackathon',
    logo_url: data.logo_url || null,
    registration_closes_at: data.registration_closes_date && data.registration_closes_time ? `${data.registration_closes_date}T${data.registration_closes_time}:00Z` : null,
    status: initialStatus
  }).select('id').single();

  if (festError || !festData) {
    return { success: false, error: festError?.message || "Failed to create parent event." };
  }

  // 2. Create the hackathon details record
  const hackPayload: any = {
    event_id: festData.id,
    tagline: data.tagline || null,
    description: data.description || null,
    theme: data.theme || null,
    domain: data.domain || null,
    organizing_department: data.organizing_department || null,
    venue: data.venue || null,
    mode: data.mode || 'Offline',
    external_link: data.external_link || null,
    registration_opens_at: data.registration_opens_date && data.registration_opens_time ? `${data.registration_opens_date}T${data.registration_opens_time}:00Z` : null,
    registration_closes_at: data.registration_closes_date && data.registration_closes_time ? `${data.registration_closes_date}T${data.registration_closes_time}:00Z` : null,
    hackathon_starts_at: data.hackathon_starts_date && data.hackathon_starts_time ? `${data.hackathon_starts_date}T${data.hackathon_starts_time}:00Z` : `${data.hackathon_starts_date || new Date().toISOString().split('T')[0]}T09:00:00Z`,
    hackathon_ends_at: data.hackathon_ends_date && data.hackathon_ends_time ? `${data.hackathon_ends_date}T${data.hackathon_ends_time}:00Z` : `${data.hackathon_ends_date || new Date().toISOString().split('T')[0]}T17:00:00Z`,
    abstract_submission_deadline: data.abstract_submission_date ? `${data.abstract_submission_date}T00:00:00Z` : null,
    project_submission_deadline: data.project_submission_date ? `${data.project_submission_date}T00:00:00Z` : null,
    demo_pitch_date: data.demo_pitch_date ? `${data.demo_pitch_date}T00:00:00Z` : null,
    maximum_teams: parseInt(data.maximum_teams || '50', 10),
    minimum_team_size: parseInt(data.minimum_team_size || '1', 10),
    maximum_team_size: parseInt(data.maximum_team_size || '4', 10),
    maximum_participants: data.maximum_participants ? parseInt(data.maximum_participants, 10) : null,
    eligibility_type: data.eligibility_type || 'College Students',
    allowed_departments: data.allowed_departments || null,
    allowed_years: data.allowed_years || null,
    allowed_colleges: data.allowed_colleges || null,
    rules: data.rules || null,
    participation_guidelines: data.participation_guidelines || null,
    submission_guidelines: data.submission_guidelines || null,
    judging_criteria: data.judging_criteria || null,
    code_of_conduct: data.code_of_conduct || null,
    problem_statement_description: data.problem_statement_description || null,
    required_tech_stack: data.required_tech_stack || null,
    github_url_required: !!data.github_url_required,
    demo_video_required: !!data.demo_video_required,
    ppt_required: !!data.ppt_required,
    report_required: !!data.report_required,
    live_demo_required: !!data.live_demo_required,
    prize_1st: data.prize_1st || null,
    prize_2nd: data.prize_2nd || null,
    prize_3rd: data.prize_3rd || null,
    special_prizes: data.special_prizes || null,
    coordinator_id: data.coordinator_id || null
  };

  const { data: hackathonData, error: hackathonError } = await adminClient
    .from('hackathons')
    .insert(hackPayload)
    .select('id')
    .single();

  if (hackathonError || !hackathonData) {
    await adminClient.from('fests').delete().eq('id', festData.id);
    return { success: false, error: hackathonError?.message || "Failed to create hackathon details." };
  }

  // 3. Create sub_events record for team registration & coordinator flow
  const maxTeams = parseInt(data.maximum_teams || '50', 10);
  const maxTeamSize = parseInt(data.maximum_team_size || '4', 10);
  const totalCap = maxTeams * maxTeamSize;

  const { data: createdSubEvent } = await adminClient.from('sub_events').insert({
    fest_id: festData.id,
    title: data.name,
    description: data.tagline || data.description || 'Hackathon Challenge',
    category: 'Technical',
    participation_type: 'Team',
    min_candidates: parseInt(data.minimum_team_size || '1', 10),
    max_candidates: maxTeamSize,
    capacity: totalCap,
    date: data.hackathon_starts_date || '',
    time: data.hackathon_starts_time || '09:00',
    location: data.venue || 'Main Venue',
    status: initialStatus
  }).select('id').single();

  // 4. Upload PDFs and create problem statements
  let displayOrder = 1;
  const failedUploads = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('pdf_') && value instanceof File) {
      const fileId = randomUUID();
      const ext = value.name.includes('.') ? value.name.substring(value.name.lastIndexOf('.')) : '';
      const storagePath = `${hackathonData.id}/${fileId}${ext}`;
      
      const buffer = Buffer.from(await value.arrayBuffer());
      const mimeType = getMimeType(value.name, value.type);

      const { error: uploadError } = await adminClient.storage
        .from('hackathon-problem-statements')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        console.error("File upload failed:", uploadError);
        failedUploads.push(value.name);
        continue;
      }

      const { data: publicUrlData } = adminClient.storage
        .from('hackathon-problem-statements')
        .getPublicUrl(storagePath);

      const { error: psError } = await adminClient.from('hackathon_problem_statements').insert({
        hackathon_id: hackathonData.id,
        file_name: value.name,
        file_url: publicUrlData.publicUrl,
        storage_path: storagePath,
        display_order: displayOrder++
      });

      if (psError) {
        console.error("Error inserting problem statement record:", psError);
        await adminClient.storage.from('hackathon-problem-statements').remove([storagePath]);
        failedUploads.push(value.name);
      }
    }
  }

  // 5. Assign coordinator to fest & sub_event
  if (data.coordinator_id) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const targetSubId = createdSubEvent?.id;
    const targetIds = [festData.id, ...(targetSubId ? [targetSubId] : [])];

    const { data: userData } = await adminClient.auth.admin.getUserById(data.coordinator_id);
    if (userData?.user) {
      const existingIds: string[] = Array.isArray(userData.user.app_metadata?.coordinating_event_ids)
        ? userData.user.app_metadata.coordinating_event_ids
        : userData.user.app_metadata?.coordinating_event_id ? [userData.user.app_metadata.coordinating_event_id] : [];
      
      const newIds = Array.from(new Set([...existingIds, ...targetIds]));
      await updateCoordinatorAssignments(data.coordinator_id, newIds);
    }
  }

  try {
    (revalidateTag as any)('fests');
    (revalidateTag as any)('fests-list');
    (revalidateTag as any)('coordinators');
    revalidatePath('/admin');
    revalidatePath('/admin/events');
    revalidatePath('/admin/coordinators');
    revalidatePath('/admin/sub-events');
    revalidatePath('/events');
  } catch (e) {}

  if (failedUploads.length > 0) {
    return { success: true, warning: `Hackathon created, but some PDFs failed to upload: ${failedUploads.join(', ')}` };
  }

  return { success: true, festId: festData.id };
}

export async function getHackathon(festId: string) {
  const adminClient = getAdminClient();
  const { getCoordinators } = await import('./event.actions');
  
  const { data: fest } = await adminClient.from('fests').select('*').eq('id', festId).single();
  if (!fest) return null;

  const { data: hackathon } = await adminClient.from('hackathons').select('*').eq('event_id', festId).single();
  const { data: subEvents } = await adminClient.from('sub_events').select('*').eq('fest_id', festId);

  let statements: any[] = [];
  if (hackathon) {
    const { data: ps } = await adminClient
      .from('hackathon_problem_statements')
      .select('*')
      .eq('hackathon_id', hackathon.id)
      .order('display_order', { ascending: true });
    statements = ps || [];
  }

  // Fetch coordinator details for this hackathon / fest
  const allCoords = await getCoordinators();
  const assignedCoords = allCoords.filter(c => c.event_ids.includes(festId) || (subEvents || []).some(se => c.event_ids.includes(se.id)));

  return {
    ...fest,
    subEvents: subEvents || [],
    hackathonDetails: hackathon || null,
    problem_statements: statements,
    coordinatorDetails: assignedCoords.map(c => ({ name: c.name, phone: c.phone, email: c.email }))
  };
}

export async function updateHackathon(festId: string, data: any) {
  const adminClient = getAdminClient();

  const { error: festError } = await adminClient.from('fests').update({
    name: data.name,
    description: data.tagline || data.description || '',
    logo_url: data.logo_url || null,
    registration_closes_at: data.registration_closes_date && data.registration_closes_time ? `${data.registration_closes_date}T${data.registration_closes_time}:00Z` : null
  }).eq('id', festId);

  if (festError) {
    return { success: false, error: festError.message };
  }

  const { data: existingHackathon } = await adminClient.from('hackathons').select('id').eq('event_id', festId).single();

  const hackPayload: any = {
    tagline: data.tagline || null,
    description: data.description || null,
    theme: data.theme || null,
    domain: data.domain || null,
    organizing_department: data.organizing_department || null,
    venue: data.venue || null,
    mode: data.mode || 'Offline',
    external_link: data.external_link || null,
    registration_opens_at: data.registration_opens_date && data.registration_opens_time ? `${data.registration_opens_date}T${data.registration_opens_time}:00Z` : null,
    registration_closes_at: data.registration_closes_date && data.registration_closes_time ? `${data.registration_closes_date}T${data.registration_closes_time}:00Z` : null,
    hackathon_starts_at: data.hackathon_starts_date && data.hackathon_starts_time ? `${data.hackathon_starts_date}T${data.hackathon_starts_time}:00Z` : `${data.hackathon_starts_date || new Date().toISOString().split('T')[0]}T09:00:00Z`,
    hackathon_ends_at: data.hackathon_ends_date && data.hackathon_ends_time ? `${data.hackathon_ends_date}T${data.hackathon_ends_time}:00Z` : `${data.hackathon_ends_date || new Date().toISOString().split('T')[0]}T17:00:00Z`,
    abstract_submission_deadline: data.abstract_submission_date ? `${data.abstract_submission_date}T00:00:00Z` : null,
    project_submission_deadline: data.project_submission_date ? `${data.project_submission_date}T00:00:00Z` : null,
    demo_pitch_date: data.demo_pitch_date ? `${data.demo_pitch_date}T00:00:00Z` : null,
    maximum_teams: parseInt(data.maximum_teams || '50', 10),
    minimum_team_size: parseInt(data.minimum_team_size || '1', 10),
    maximum_team_size: parseInt(data.maximum_team_size || '4', 10),
    maximum_participants: data.maximum_participants ? parseInt(data.maximum_participants, 10) : null,
    eligibility_type: data.eligibility_type || 'College Students',
    allowed_departments: data.allowed_departments || null,
    allowed_years: data.allowed_years || null,
    allowed_colleges: data.allowed_colleges || null,
    rules: data.rules || null,
    participation_guidelines: data.participation_guidelines || null,
    submission_guidelines: data.submission_guidelines || null,
    judging_criteria: data.judging_criteria || null,
    code_of_conduct: data.code_of_conduct || null,
    problem_statement_description: data.problem_statement_description || null,
    required_tech_stack: data.required_tech_stack || null,
    github_url_required: !!data.github_url_required,
    demo_video_required: !!data.demo_video_required,
    ppt_required: !!data.ppt_required,
    report_required: !!data.report_required,
    live_demo_required: !!data.live_demo_required,
    prize_1st: data.prize_1st || null,
    prize_2nd: data.prize_2nd || null,
    prize_3rd: data.prize_3rd || null,
    special_prizes: data.special_prizes || null,
    coordinator_id: data.coordinator_id || null
  };

  if (existingHackathon) {
    const { error: hackathonError } = await adminClient
      .from('hackathons')
      .update(hackPayload)
      .eq('id', existingHackathon.id);

    if (hackathonError) {
      return { success: false, error: hackathonError.message };
    }
  } else {
    await adminClient.from('hackathons').insert({
      event_id: festId,
      ...hackPayload
    });
  }

  // Update sub_events entry
  const maxTeams = parseInt(data.maximum_teams || '50', 10);
  const maxTeamSize = parseInt(data.maximum_team_size || '4', 10);
  const totalCap = maxTeams * maxTeamSize;

  const { data: subEvent } = await adminClient.from('sub_events').select('id').eq('fest_id', festId).maybeSingle();
  let targetSubId = subEvent?.id;

  if (subEvent) {
    await adminClient.from('sub_events').update({
      title: data.name,
      description: data.tagline || data.description || 'Hackathon Challenge',
      min_candidates: parseInt(data.minimum_team_size || '1', 10),
      max_candidates: maxTeamSize,
      capacity: totalCap,
      date: data.hackathon_starts_date || '',
      time: data.hackathon_starts_time || '09:00',
      location: data.venue || 'Main Venue'
    }).eq('id', subEvent.id);
  } else {
    const { data: newSub } = await adminClient.from('sub_events').insert({
      fest_id: festId,
      title: data.name,
      description: data.tagline || data.description || 'Hackathon Challenge',
      category: 'Technical',
      participation_type: 'Team',
      min_candidates: parseInt(data.minimum_team_size || '1', 10),
      max_candidates: maxTeamSize,
      capacity: totalCap,
      date: data.hackathon_starts_date || '',
      time: data.hackathon_starts_time || '09:00',
      location: data.venue || 'Main Venue',
      status: 'LIVE'
    }).select('id').single();
    targetSubId = newSub?.id;
  }

  if (data.coordinator_id) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const targetIds = [festId, ...(targetSubId ? [targetSubId] : [])];

    const { data: userData } = await adminClient.auth.admin.getUserById(data.coordinator_id);
    if (userData?.user) {
      const existingIds: string[] = Array.isArray(userData.user.app_metadata?.coordinating_event_ids)
        ? userData.user.app_metadata.coordinating_event_ids
        : userData.user.app_metadata?.coordinating_event_id ? [userData.user.app_metadata.coordinating_event_id] : [];
      
      const newIds = Array.from(new Set([...existingIds, ...targetIds]));
      await updateCoordinatorAssignments(data.coordinator_id, newIds);
    }
  }

  try {
    (revalidateTag as any)('fests');
    (revalidateTag as any)('fests-list');
    revalidatePath('/admin/events');
    revalidatePath('/events');
  } catch (e) {}

  return { success: true };
}

// ==============================
// PDF MANAGEMENT FOR EDIT FLOW
// ==============================

export async function addHackathonPDF(hackathonId: string, formData: FormData) {
  const adminClient = getAdminClient();
  const file = formData.get('file') as File;
  
  if (!file) return { success: false, error: "No file provided" };

  // Max 100MB size limit
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File exceeds 100MB size limit." };
  }

  const { data: existingPs } = await adminClient.from('hackathon_problem_statements')
    .select('display_order')
    .eq('hackathon_id', hackathonId)
    .order('display_order', { ascending: false })
    .limit(1);
    
  const nextOrder = existingPs && existingPs.length > 0 ? existingPs[0].display_order + 1 : 1;

  const fileId = randomUUID();
  const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
  const storagePath = `${hackathonId}/${fileId}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = getMimeType(file.name, file.type);

  const { error: uploadError } = await adminClient.storage
    .from('hackathon-problem-statements')
    .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: publicUrlData } = adminClient.storage.from('hackathon-problem-statements').getPublicUrl(storagePath);

  const { data: record, error: psError } = await adminClient.from('hackathon_problem_statements').insert({
    hackathon_id: hackathonId,
    file_name: file.name,
    file_url: publicUrlData.publicUrl,
    storage_path: storagePath,
    display_order: nextOrder
  }).select('*').single();

  if (psError) {
    await adminClient.storage.from('hackathon-problem-statements').remove([storagePath]);
    return { success: false, error: psError.message };
  }

  revalidatePath('/admin/events');
  return { success: true, record };
}

export async function addTextProblemStatement(hackathonId: string) {
  const adminClient = getAdminClient();
  
  const { data: existingPs } = await adminClient.from('hackathon_problem_statements')
    .select('display_order')
    .eq('hackathon_id', hackathonId)
    .order('display_order', { ascending: false })
    .limit(1);
    
  const nextOrder = existingPs && existingPs.length > 0 ? existingPs[0].display_order + 1 : 1;

  const { data: record, error: psError } = await adminClient.from('hackathon_problem_statements').insert({
    hackathon_id: hackathonId,
    title: `Problem Statement ${nextOrder}`,
    description: "",
    display_order: nextOrder
  }).select('*').single();

  if (psError) {
    return { success: false, error: psError.message };
  }

  revalidatePath('/admin/events');
  return { success: true, record };
}

export async function replaceHackathonPDF(problemStatementId: string, formData: FormData) {
  const adminClient = getAdminClient();
  const file = formData.get('file') as File;
  
  if (!file) return { success: false, error: "No file provided" };

  // Max 100MB size limit
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { success: false, error: "File exceeds 100MB size limit." };
  }

  const { data: existingPs } = await adminClient.from('hackathon_problem_statements').select('*').eq('id', problemStatementId).single();
  if (!existingPs) return { success: false, error: "Problem statement not found" };

  const fileId = randomUUID();
  const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
  const newStoragePath = `${existingPs.hackathon_id}/${fileId}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = getMimeType(file.name, file.type);

  const { error: uploadError } = await adminClient.storage
    .from('hackathon-problem-statements')
    .upload(newStoragePath, buffer, { contentType: mimeType, upsert: false });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: publicUrlData } = adminClient.storage.from('hackathon-problem-statements').getPublicUrl(newStoragePath);

  const { data: updatedRecord, error: updateError } = await adminClient.from('hackathon_problem_statements').update({
    file_name: file.name,
    file_url: publicUrlData.publicUrl,
    storage_path: newStoragePath
  }).eq('id', problemStatementId).select('*').single();

  if (updateError) {
    await adminClient.storage.from('hackathon-problem-statements').remove([newStoragePath]);
    return { success: false, error: updateError.message };
  }

  // Delete old file
  if (existingPs.storage_path) {
    await adminClient.storage.from('hackathon-problem-statements').remove([existingPs.storage_path]);
  }

  revalidatePath('/admin/events');
  return { success: true, record: updatedRecord };
}

export async function removeHackathonPDF(problemStatementId: string) {
  const adminClient = getAdminClient();
  
  const { data: existingPs } = await adminClient.from('hackathon_problem_statements').select('*').eq('id', problemStatementId).single();
  if (!existingPs) return { success: false, error: "Problem statement not found" };

  if (existingPs.storage_path) {
    await adminClient.storage.from('hackathon-problem-statements').remove([existingPs.storage_path]);
  }

  const { error: deleteError } = await adminClient.from('hackathon_problem_statements').delete().eq('id', problemStatementId);
  if (deleteError) return { success: false, error: deleteError.message };

  // Recalculate display_order for remaining
  const { data: remaining } = await adminClient.from('hackathon_problem_statements')
    .select('id, display_order')
    .eq('hackathon_id', existingPs.hackathon_id)
    .order('display_order', { ascending: true });

  if (remaining && remaining.length > 0) {
    for (let i = 0; i < remaining.length; i++) {
      await adminClient.from('hackathon_problem_statements').update({ display_order: i + 1 }).eq('id', remaining[i].id);
    }
  }

  revalidatePath('/admin/events');
  return { success: true };
}

export async function updateProblemStatementDetails(problemStatementId: string, title: string, description: string) {
  const adminClient = getAdminClient();
  
  const { data: updatedRecord, error: updateError } = await adminClient.from('hackathon_problem_statements').update({
    title,
    description
  }).eq('id', problemStatementId).select('*').single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/admin/events');
  return { success: true, record: updatedRecord };
}
