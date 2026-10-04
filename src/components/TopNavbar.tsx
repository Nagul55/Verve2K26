import React from "react";
import { Search, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { LogoutButton } from "./LogoutButton";

export async function TopNavbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = {
    full_name: "STUDENT",
    department: "",
    year_of_study: ""
  };

  if (user) {
    const { data } = await supabase.from('participants').select('*').eq('participant_id', user.id).single();
    if (data) {
      profile = data;
    } else {
      profile.full_name = user.user_metadata?.full_name || "STUDENT";
    }
  }

  const role = user?.app_metadata?.role || 'student';
  const initials = profile.full_name.substring(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-5 bg-eventrix-bg sticky top-0 z-50 border-b border-[#D9D9DF]/50 transition-all">
      <div className="flex items-center gap-4 w-full md:max-w-[400px]">
        <MobileNav role={role} />
        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-eventrix-muted" />
          <input 
            type="text" 
            placeholder="Search events, teams, or anything..."
            className="w-full bg-[#F3F3F6] border border-transparent rounded-md py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:bg-eventrix-white focus:border-eventrix-lavender transition-colors placeholder:text-eventrix-muted"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6 ml-auto shrink-0">
        <div className="flex items-center shrink-0">
          <img
            src="/images/sona-logo.png"
            alt="Sona College of Technology"
            className="h-7 md:h-9 w-auto object-contain"
          />
        </div>
        
        <div className="flex items-center gap-2 border-l border-[#D9D9DF] pl-3 sm:pl-4 h-9 sm:h-10">
          <img
            src="/images/user-avatar.png"
            alt="User Profile"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border border-[#D9D9DF]"
          />
          <div className="hidden sm:block ml-0.5 max-w-[120px] lg:max-w-[200px] truncate">
            <p className="font-bold text-eventrix-black text-xs uppercase tracking-wide truncate">{profile.full_name}</p>
            {(profile.department || profile.year_of_study) && (
              <p className="text-[10px] text-eventrix-muted mt-0.5 truncate">{profile.year_of_study} {profile.department}</p>
            )}
          </div>
          
          <Link 
            href={role === 'admin' ? '/admin/settings' : role === 'coordinator' ? '/coordinator/settings' : '/settings'} 
            title="Settings" 
            className="text-eventrix-muted hover:text-eventrix-black transition-colors hidden sm:block"
          >
            <Settings className="w-4 h-4" />
          </Link>
          
          <LogoutButton variant="icon" />
        </div>
      </div>
    </header>
  );
}
