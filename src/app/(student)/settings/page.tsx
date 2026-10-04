import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";

import { getProfileForUser } from "@/actions/profile.actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    profile = await getProfileForUser(user.id, user.email);
  }

  const initialData = {
    role: user?.app_metadata?.role || 'student',
    gender: profile?.gender || user?.user_metadata?.gender || '',
    full_name: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    email: profile?.email || user?.email || '',
    mobile: profile?.mobile || '',
    college: profile?.college || '',
    register_number: profile?.register_number || '',
    department: profile?.department || '',
    year_of_study: profile?.year_of_study || '',
  };

  if (!user) {
    return (
      <div className="space-y-10">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Profile Settings
          </h1>
        </div>
        <div className="bg-white border border-[#D9D9DF] p-10 rounded-md max-w-xl text-center space-y-4">
          <p className="font-bold text-eventrix-black text-lg">Please Sign In</p>
          <p className="text-eventrix-muted text-sm font-medium">You need to be logged in to view and update your profile settings.</p>
          <a href="/" className="inline-block bg-eventrix-black text-white px-6 py-3 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Profile Settings
        </h1>
      </div>

      <SettingsProfileForm initialData={initialData} userId={user.id} showAcademic={true} />
    </div>
  );
}


