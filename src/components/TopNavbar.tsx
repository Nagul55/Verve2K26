import React from "react";
import { Search, Bell, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/actions/auth.actions";
import Link from "next/link";
import { MobileNav } from "./MobileNav";

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

  const initials = profile.full_name.substring(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-5 bg-eventrix-bg sticky top-0 z-50 border-b border-[#D9D9DF]/50 transition-all">
      <div className="flex items-center gap-4 w-full md:max-w-[400px]">
        <MobileNav />
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
        <button className="relative text-eventrix-black hover:text-eventrix-lavender transition-colors">
          <Bell className="w-5 h-5 stroke-[1.5]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-eventrix-lavender rounded-full border-[2px] border-eventrix-bg"></span>
        </button>
        
        <div className="flex items-center gap-3 md:gap-4 border-l border-[#D9D9DF] pl-4 md:pl-6 h-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-eventrix-lavender/20 text-eventrix-lavender font-bold text-xs shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block mr-2 max-w-[120px] lg:max-w-[200px] truncate">
            <p className="font-bold text-eventrix-black text-xs uppercase tracking-wide truncate">{profile.full_name}</p>
            {(profile.department || profile.year_of_study) && (
              <p className="text-[10px] text-eventrix-muted mt-0.5 truncate">{profile.year_of_study} {profile.department}</p>
            )}
          </div>
          
          <Link href="/settings" title="Settings" className="text-eventrix-muted hover:text-eventrix-black transition-colors hidden sm:block">
            <Settings className="w-4 h-4" />
          </Link>
          
          <form action={signout}>
            <button type="submit" title="Logout" className="text-eventrix-muted hover:text-red-500 transition-colors ml-1">
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
