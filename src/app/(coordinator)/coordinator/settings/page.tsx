import React from "react";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinatorSettingsPage() {
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

  const initialData = profile || {
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    email: user.email || '',
    mobile: '',
    college: '',
    department: '',
    year_of_study: ''
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
