import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('participants')
    .select('*')
    .eq('participant_id', user.id)
    .single();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Profile Settings
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Update your personal information and college details. This information will be printed on your tickets and certificates.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md max-w-3xl">
        <SettingsProfileForm initialData={profile || { full_name: user.user_metadata?.full_name, email: user.email }} userId={user.id} />
      </div>
    </div>
  );
}
