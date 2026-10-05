"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Settings, ShieldCheck, UserCheck } from "lucide-react";
import { EventrixLogo } from "@/components/EventrixLogo";
import { LogoutButton } from "@/components/LogoutButton";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Manage Events", href: "/admin/events", icon: Calendar },
    { name: "Coordinators", href: "/admin/coordinators", icon: Users },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Users", href: "/admin/users", icon: UserCheck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-[230px] h-full bg-eventrix-black text-eventrix-white flex flex-col hidden md:flex shrink-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex-1 shrink-0">
        <div className="p-8 pb-4 cursor-default">
          {/* Using a slightly different logo presentation for Admin (maybe purple instead of white?) */}
          <EventrixLogo fill="#A78BFA" className="w-[140px] h-auto" />
          <span className="text-[10px] font-bold tracking-widest text-eventrix-white/50 uppercase mt-2 block">Admin Portal</span>
        </div>
        
        <nav className="mt-6 px-4 space-y-1.5">
          {navItems.map((item) => {
            const isDashboardRoute = item.href === "/admin" || item.href === "/coordinator" || item.href === "/dashboard";
            const isActive = isDashboardRoute 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                  isActive 
                    ? "bg-eventrix-lavender text-eventrix-black font-semibold" 
                    : "text-eventrix-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 stroke-[1.5]" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          </nav>
        
          <div className="px-4 mt-8">
            <LogoutButton variant="sidebar" />
          </div>
        </div>

      <div className="p-8 mb-4 shrink-0">
        <div className="border border-eventrix-lavender/30 p-6 relative">
          <div className="text-eventrix-lavender mb-6">
             <ShieldCheck width="24" height="24" strokeWidth="1.5" />
          </div>
          <h4 className="text-eventrix-white font-anton text-2xl leading-[1.1] tracking-wide mb-6">SYSTEM<br/>CONTROL</h4>
          
          <div className="w-8 h-[1px] bg-eventrix-lavender/30 mb-6"></div>
          
          <div className="text-[9px] text-eventrix-lavender space-y-1.5 font-bold editorial-label opacity-90 mb-6">
            <p>VERVE26</p>
            <p>ELEVATED ACCESS</p>
          </div>
          
          <div className="w-8 h-[1px] bg-eventrix-lavender/30"></div>
        </div>
      </div>
    </aside>
  );
}
