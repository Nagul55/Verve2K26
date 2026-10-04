import React from "react";
import { AdminProfileForm } from "@/components/AdminProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  let profile = null;
  const { data } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', user.id)
    .single();
  profile = data;

  const initialData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || "Admin",
    email: profile?.email || user.email || "admin@eventrix.com",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Admin Settings
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Update your administrator profile details.
        </p>
      </div>

      <AdminProfileForm initialData={initialData} userId={user.id} />
    </div>
  );
}
