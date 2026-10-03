import React from "react";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinatorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Coordinator Settings
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Update your coordinator profile details and authentication credentials.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md max-w-3xl shadow-sm">
        <SettingsProfileForm initialData={{ full_name: user.user_metadata?.full_name, email: user.email }} userId={user.id} />
      </div>
    </div>
  );
}
