"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Ticket, FileText, Settings, Menu, X, BellRing } from "lucide-react";
import { EventrixLogo } from "./EventrixLogo";

export function MobileNav({ role = 'student' }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  let navItems = [];
  
  if (role === 'admin' || role === 'Super Admin') {
    navItems = [
      { name: "Dashboard", href: "/admin", icon: Home },
      { name: "Manage Events", href: "/admin/events", icon: Calendar },
      { name: "Coordinators", href: "/admin/coordinators", icon: Users },
      { name: "Participants", href: "/admin/participants", icon: Users },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ];
  } else if (role === 'coordinator') {
    navItems = [
      { name: "Dashboard", href: "/coordinator", icon: Home },
      { name: "Manage Events", href: "/coordinator/events", icon: Calendar },
      { name: "Ticket Scanner", href: "/coordinator/scanner", icon: Ticket },
      { name: "Participants", href: "/coordinator/participants", icon: Users },
      { name: "Attendance Log", href: "/coordinator/attendance", icon: FileText },
      { name: "Settings", href: "/coordinator/settings", icon: Settings },
    ];
  } else {
    navItems = [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Registrations", href: "/registrations", icon: Users },
      { name: "Invitations", href: "/invitations", icon: BellRing },
      { name: "Tickets", href: "/tickets", icon: Ticket },
      { name: "Certificates", href: "/certificates", icon: FileText },
      { name: "Settings", href: "/settings", icon: Settings },
    ];
  }

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-2 -ml-2 text-eventrix-black hover:bg-black/5 rounded-md transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-[260px] bg-eventrix-purple text-eventrix-white z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col shadow-2xl`}
      >
        <div className="flex items-center justify-between p-6">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <EventrixLogo fill="currentColor" className="w-[120px] h-auto text-eventrix-white" />
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-eventrix-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                  isActive 
                    ? "bg-eventrix-lavender text-eventrix-black font-semibold" 
                    : "text-eventrix-white hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5 stroke-[1.5]" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
