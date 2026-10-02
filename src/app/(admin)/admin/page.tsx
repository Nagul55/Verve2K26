import React from "react";
import { Users, Calendar, Ticket, ShieldCheck } from "lucide-react";
import { getSubEvents } from "@/actions/event.actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const events = await getSubEvents();
  const supabase = await createClient();
  
  // Fetch high-level admin stats
  const { count: participantsCount } = await supabase.from('participants').select('*', { count: 'exact', head: true });
  const { count: registrationsCount } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });

  const stats = [
    { label: "TOTAL PARTICIPANTS", value: participantsCount || 0, icon: Users },
    { label: "TOTAL REGISTRATIONS", value: registrationsCount || 0, icon: Ticket },
    { label: "ACTIVE EVENTS", value: events ? events.length : 0, icon: Calendar },
    { label: "SYSTEM STATUS", value: "HEALTHY", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Admin Hero Banner */}
      <div className="relative w-full h-[250px] bg-eventrix-black text-eventrix-white overflow-hidden rounded-md flex flex-col justify-end p-10 group">
        <div className="absolute top-0 right-0 w-[50%] h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-eventrix-lavender" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="font-anton text-6xl md:text-[80px] leading-[0.85] tracking-wide mb-2 uppercase text-eventrix-lavender">
            ADMIN PORTAL
          </h1>
          <p className="text-eventrix-white/70 font-medium max-w-xl text-sm md:text-base">
            System overview and event management dashboard. Access restricted to Super Admins and Coordinators.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 mt-10">
        
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-12">
          
          {/* Stats Overview */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">System Overview <span className="font-normal text-eventrix-black">→</span></h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="border border-[#D9D9DF] bg-eventrix-white p-5 rounded-md flex flex-col items-center text-center">
                  <stat.icon className="w-6 h-6 text-eventrix-lavender mb-3 stroke-[2]" />
                  <span className="text-3xl font-bold text-eventrix-black font-anton">{stat.value}</span>
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex justify-between items-end mb-6 mt-12">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">Quick Actions <span className="font-normal text-eventrix-black">→</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a href="/admin/events" className="group border border-[#D9D9DF] bg-eventrix-white p-8 rounded-md transition-all hover:border-eventrix-black flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">Manage Events</h4>
                  <p className="text-xs text-eventrix-muted">Create, edit, or configure registration rules.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-eventrix-light-lavender flex items-center justify-center text-eventrix-lavender group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
                  →
                </div>
              </a>
              
              <a href="/admin/participants" className="group border border-[#D9D9DF] bg-eventrix-white p-8 rounded-md transition-all hover:border-eventrix-black flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">View Participants</h4>
                  <p className="text-xs text-eventrix-muted">Manage users, teams, and export data.</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-eventrix-light-lavender flex items-center justify-center text-eventrix-lavender group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
                  →
                </div>
              </a>
            </div>
          </section>

        </div>

      </div>
    </>
  );
}
