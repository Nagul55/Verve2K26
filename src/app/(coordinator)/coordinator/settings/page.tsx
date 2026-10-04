import React from "react";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";
import { createClient } from "@/lib/supabase/server";

import { getProfileForUser } from "@/actions/profile.actions";

export default async function CoordinatorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const profile = await getProfileForUser(user.id, user.email);

  const initialData = {
    full_name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    email: profile?.email || user.email || '',
    mobile: profile?.mobile || '',
    college: profile?.college || '',
    register_number: profile?.register_number || '',
    department: profile?.department || '',
    year_of_study: profile?.year_of_study || '',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Coordinator Settings
        </h1>
      </div>

      <SettingsProfileForm initialData={initialData} userId={user.id} showAcademic={true} />
    </div>
  );
}
