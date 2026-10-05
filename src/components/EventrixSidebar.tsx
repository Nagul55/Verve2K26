"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Ticket, FileText, Settings, BellRing } from "lucide-react";
import { EventrixLogo } from "@/components/EventrixLogo";
import { LogoutButton } from "@/components/LogoutButton";

export function EventrixSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Registrations", href: "/registrations", icon: Users },
    { name: "Invitations", href: "/invitations", icon: BellRing },
    { name: "Tickets", href: "/tickets", icon: Ticket },
    { name: "Certificates", href: "/certificates", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-[230px] h-full bg-eventrix-purple text-eventrix-white flex flex-col hidden md:flex shrink-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex-1 shrink-0">
        <div className="p-8 pb-4 cursor-default">
          <EventrixLogo fill="currentColor" className="w-[140px] h-auto text-eventrix-white" />
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
        <div className="border border-eventrix-white/20 p-6 relative">
          <div className="text-eventrix-lavender mb-6">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1l14.2-14.2"/></svg>
          </div>
          <h4 className="text-eventrix-white font-anton text-3xl leading-[1.1] tracking-wide mb-6">MORE<br/>THAN<br/>EVENTS</h4>
          
          <div className="w-8 h-[1px] bg-eventrix-white/30 mb-6"></div>
          
          <div className="text-[9px] text-eventrix-lavender space-y-1.5 font-bold editorial-label opacity-90 mb-6">
            <p>DISCOVER</p>
            <p>PARTICIPATE</p>
            <p>CREATE MEMORIES</p>
          </div>
          
          <div className="w-8 h-[1px] bg-eventrix-white/30"></div>
        </div>
      </div>
    </aside>
  );
}
