"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export interface EventResourceItem {
  id: string;
  sub_event_id?: string;
  file_name: string;
  original_name: string;
  file_url: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  uploaded_by?: string;
  created_at: string;
}

import { getMimeType } from "@/lib/mimeUtils";

export async function uploadEventResourceAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const subEventId = (formData.get("sub_event_id") as string) || "draft";

    if (!file) {
      return { success: false, error: "No file selected for upload." };
    }

    // Max file size: 100MB limit
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File exceeds the maximum allowed size limit of 100MB." };
    }

    const adminClient = getAdminClient();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10);
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `events/${subEventId}/${uniqueId}-${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = getMimeType(file.name, file.type);

    const { error: uploadError } = await adminClient.storage
      .from('event-resources')
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = adminClient.storage.from('event-resources').getPublicUrl(storagePath);

    const resourceItem: EventResourceItem = {
      id: uniqueId,
      sub_event_id: subEventId,
      file_name: cleanFileName,
      original_name: file.name,
      file_url: urlData.publicUrl,
      storage_path: storagePath,
      file_type: mimeType,
      file_size: file.size,
      uploaded_by: user?.id || 'system',
      created_at: new Date().toISOString()
    };

    return { success: true, resource: resourceItem };
  } catch (err: any) {
    return { success: false, error: err.message || "An error occurred during file upload." };
  }
}

export async function deleteEventResourceAction(storagePath: string) {
  try {
    const adminClient = getAdminClient();
    const { error } = await adminClient.storage.from('event-resources').remove([storagePath]);
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
