import React from "react";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Admin Settings
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Update your administrator profile details.
        </p>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md max-w-3xl">
        <SettingsProfileForm initialData={{ full_name: user.user_metadata?.full_name, email: user.email }} userId={user.id} />
      </div>
    </div>
  );
}
