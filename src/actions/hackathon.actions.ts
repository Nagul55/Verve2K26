"use server";

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from "next/cache";
import { randomUUID } from 'crypto';

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
  const { data: festData, error: festError } = await adminClient.from('fests').insert({
    name: data.name,
    description: data.tagline,
    min_technical: 0,
    min_non_technical: 0,
    event_type: 'hackathon',
    logo_url: data.logo_url
  }).select('id').single();

  if (festError || !festData) {
    return { success: false, error: festError?.message || "Failed to create parent event." };
  }

  // 2. Create the hackathon details record
  const { data: hackathonData, error: hackathonError } = await adminClient.from('hackathons').insert({
    event_id: festData.id,
    tagline: data.tagline,
    description: data.description,
    registration_opens_at: data.registration_opens_date + 'T' + data.registration_opens_time + ':00Z',
    registration_closes_at: data.registration_closes_date + 'T' + data.registration_closes_time + ':00Z',
    hackathon_starts_at: data.hackathon_starts_date + 'T' + data.hackathon_starts_time + ':00Z',
    hackathon_ends_at: data.hackathon_ends_date + 'T' + data.hackathon_ends_time + ':00Z',
    maximum_teams: parseInt(data.maximum_teams),
    minimum_team_size: parseInt(data.minimum_team_size),
    maximum_team_size: parseInt(data.maximum_team_size),
    venue: data.venue,
    coordinator_id: data.coordinator_id || null
  }).select('id').single();

  if (hackathonError || !hackathonData) {
    await adminClient.from('fests').delete().eq('id', festData.id);
    return { success: false, error: hackathonError?.message || "Failed to create hackathon details." };
  }

  // 3. Upload PDFs and create problem statements
  let displayOrder = 1;
  const failedUploads = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('pdf_') && value instanceof File) {
      const fileId = randomUUID();
      const storagePath = `${hackathonData.id}/${fileId}.pdf`;
      
      const buffer = Buffer.from(await value.arrayBuffer());

      const { error: uploadError } = await adminClient.storage
        .from('hackathon-problem-statements')
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        console.error("PDF upload failed:", uploadError);
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
        // Attempt to clean up orphaned storage file
        await adminClient.storage.from('hackathon-problem-statements').remove([storagePath]);
        failedUploads.push(value.name);
      }
    }
  }

  // Assign coordinator
  if (data.coordinator_id) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const { data: userData } = await adminClient.auth.admin.getUserById(data.coordinator_id);
    if (userData?.user) {
      const existingIds: string[] = Array.isArray(userData.user.app_metadata?.coordinating_event_ids)
        ? userData.user.app_metadata.coordinating_event_ids
        : userData.user.app_metadata?.coordinating_event_id ? [userData.user.app_metadata.coordinating_event_id] : [];
      if (!existingIds.includes(festData.id)) {
        await updateCoordinatorAssignments(data.coordinator_id, [...existingIds, festData.id]);
      }
    }
  }

  try {
    (revalidateTag as any)('fests');
    (revalidateTag as any)('fests-list');
    revalidatePath('/admin/events');
  } catch (e) {}

  if (failedUploads.length > 0) {
    return { success: true, warning: `Hackathon created, but some PDFs failed to upload: ${failedUploads.join(', ')}` };
  }

  return { success: true, festId: festData.id };
}

export async function getHackathon(festId: string) {
  const adminClient = getAdminClient();
  
  const { data: fest } = await adminClient.from('fests').select('*').eq('id', festId).single();
  if (!fest) return null;

  const { data: hackathon } = await adminClient.from('hackathons').select('*').eq('event_id', festId).single();
  if (!hackathon) return { ...fest, problem_statements: [] }; 

  const { data: statements } = await adminClient
    .from('hackathon_problem_statements')
    .select('*')
    .eq('hackathon_id', hackathon.id)
    .order('display_order', { ascending: true });

  return {
    ...fest,
    hackathonDetails: hackathon,
    problem_statements: statements || []
  };
}

export async function updateHackathon(festId: string, data: any) {
  const adminClient = getAdminClient();

  const { error: festError } = await adminClient.from('fests').update({
    name: data.name,
    description: data.tagline,
    logo_url: data.logo_url
  }).eq('id', festId);

  if (festError) {
    return { success: false, error: festError.message };
  }

  const { data: existingHackathon } = await adminClient.from('hackathons').select('id').eq('event_id', festId).single();

  if (existingHackathon) {
    const { error: hackathonError } = await adminClient.from('hackathons').update({
      tagline: data.tagline,
      description: data.description,
      registration_opens_at: data.registration_opens_date + 'T' + data.registration_opens_time + ':00Z',
      registration_closes_at: data.registration_closes_date + 'T' + data.registration_closes_time + ':00Z',
      hackathon_starts_at: data.hackathon_starts_date + 'T' + data.hackathon_starts_time + ':00Z',
      hackathon_ends_at: data.hackathon_ends_date + 'T' + data.hackathon_ends_time + ':00Z',
      maximum_teams: parseInt(data.maximum_teams),
      minimum_team_size: parseInt(data.minimum_team_size),
      maximum_team_size: parseInt(data.maximum_team_size),
      venue: data.venue,
      coordinator_id: data.coordinator_id || null
    }).eq('id', existingHackathon.id);

    if (hackathonError) {
      return { success: false, error: hackathonError.message };
    }
  }

  if (data.coordinator_id) {
    const { updateCoordinatorAssignments } = await import("./auth.actions");
    const { data: userData } = await adminClient.auth.admin.getUserById(data.coordinator_id);
    if (userData?.user) {
      const existingIds: string[] = Array.isArray(userData.user.app_metadata?.coordinating_event_ids)
        ? userData.user.app_metadata.coordinating_event_ids
        : userData.user.app_metadata?.coordinating_event_id ? [userData.user.app_metadata.coordinating_event_id] : [];
      if (!existingIds.includes(festId)) {
        await updateCoordinatorAssignments(data.coordinator_id, [...existingIds, festId]);
      }
    }
  }

  try {
    (revalidateTag as any)('fests');
    (revalidateTag as any)('fests-list');
    revalidatePath('/admin/events');
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

  const { data: existingPs } = await adminClient.from('hackathon_problem_statements')
    .select('display_order')
    .eq('hackathon_id', hackathonId)
    .order('display_order', { ascending: false })
    .limit(1);
    
  const nextOrder = existingPs && existingPs.length > 0 ? existingPs[0].display_order + 1 : 1;

  const fileId = randomUUID();
  const storagePath = `${hackathonId}/${fileId}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from('hackathon-problem-statements')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false });

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

export async function replaceHackathonPDF(problemStatementId: string, formData: FormData) {
  const adminClient = getAdminClient();
  const file = formData.get('file') as File;
  
  if (!file) return { success: false, error: "No file provided" };

  const { data: existingPs } = await adminClient.from('hackathon_problem_statements').select('*').eq('id', problemStatementId).single();
  if (!existingPs) return { success: false, error: "Problem statement not found" };

  const fileId = randomUUID();
  const newStoragePath = `${existingPs.hackathon_id}/${fileId}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await adminClient.storage
    .from('hackathon-problem-statements')
    .upload(newStoragePath, buffer, { contentType: 'application/pdf', upsert: false });

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
