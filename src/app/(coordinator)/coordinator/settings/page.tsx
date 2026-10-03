import React from "react";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinatorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Coordinator Settings
        </h1>
      </div>

      <SettingsProfileForm initialData={{ full_name: user.user_metadata?.full_name, email: user.email }} userId={user.id} showAcademic={false} />
    </div>
  );
}
