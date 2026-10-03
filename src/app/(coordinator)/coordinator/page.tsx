import React from "react";
import { Users, Calendar, Ticket, ShieldCheck, QrCode, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinatorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Retrieve assigned event for coordinator from user metadata
  const assignedEventId = user?.app_metadata?.coordinating_event_id;

  let assignedEvent: any = null;
  let eventRegistrationsCount = 0;
  let attendanceCount = 0;

  if (assignedEventId) {
    const { data: event } = await supabase.from('sub_events').select('*').eq('id', assignedEventId).single();
    assignedEvent = event;

    const { count: regCount } = await supabase
      .from('registration_sub_events')
      .select('*', { count: 'exact', head: true })
      .eq('sub_event_id', assignedEventId);
    eventRegistrationsCount = regCount || 0;

    const { count: attCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', assignedEventId);
    attendanceCount = attCount || 0;
  } else {
    // If unassigned to specific event, fetch total overall sub-event count
    const { count: regCount } = await supabase.from('registration_sub_events').select('*', { count: 'exact', head: true });
    eventRegistrationsCount = regCount || 0;
    const { count: attCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true });
    attendanceCount = attCount || 0;
  }

  const checkInRate = eventRegistrationsCount > 0 
    ? Math.round((attendanceCount / eventRegistrationsCount) * 100) 
    : 0;

  const stats = [
    { 
      label: "ASSIGNED EVENT", 
      value: assignedEvent ? assignedEvent.title : "GENERAL", 
      icon: Calendar,
      subtext: assignedEvent ? assignedEvent.category : "All Sub-Events Access"
    },
    { 
      label: "TOTAL ENROLLED", 
      value: eventRegistrationsCount, 
      icon: Ticket,
      subtext: "Registered Participants"
    },
    { 
      label: "CHECKED-IN", 
      value: attendanceCount, 
      icon: CheckCircle2,
      subtext: "Verified Ticket Scans"
    },
    { 
      label: "ATTENDANCE RATE", 
      value: `${checkInRate}%`, 
      icon: ShieldCheck,
      subtext: "Turnout Ratio"
    },
  ];

  return (
    <>
      {/* Coordinator Hero Banner */}
      <div className="relative w-full h-[250px] bg-eventrix-black text-eventrix-white overflow-hidden rounded-md flex flex-col justify-end p-10 group">
        <div className="absolute top-0 right-0 w-[50%] h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-eventrix-lavender" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
        </div>
        
        <div className="relative z-10">
          <span className="text-xs font-bold text-eventrix-lavender uppercase tracking-widest mb-2 block">
            Welcome back, {user?.user_metadata?.full_name || 'Coordinator'}
          </span>
          <h1 className="font-anton text-5xl md:text-[70px] leading-[0.85] tracking-wide mb-2 uppercase text-eventrix-lavender">
            COORDINATOR PORTAL
          </h1>
          <p className="text-eventrix-white/70 font-medium max-w-xl text-sm md:text-base">
            Live attendance tracking, QR ticket scanning, and roster management for event coordinators.
          </p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 mt-10">
        
        {/* Main Column */}
        <div className="flex-1 min-w-0 space-y-12">
          
          {/* Stats Overview */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">Event Metrics <span className="font-normal text-eventrix-black">→</span></h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="border border-[#D9D9DF] bg-eventrix-white p-5 rounded-md flex flex-col items-center text-center">
                  <stat.icon className="w-6 h-6 text-eventrix-lavender mb-3 stroke-[2]" />
                  <span className="text-2xl md:text-3xl font-bold text-eventrix-black font-anton truncate max-w-full">{stat.value}</span>
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest mt-1">{stat.label}</span>
                  <span className="text-[11px] text-eventrix-lavender font-medium mt-0.5">{stat.subtext}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="flex justify-between items-end mb-6 mt-12">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">Coordinator Tools <span className="font-normal text-eventrix-black">→</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/coordinator/scanner" className="group border border-[#D9D9DF] bg-eventrix-white p-6 rounded-md transition-all hover:border-eventrix-black flex items-center justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender mb-4 group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">Launch Scanner</h4>
                  <p className="text-xs text-eventrix-muted">Scan QR tickets or manually check in participants.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-black group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link href="/coordinator/participants" className="group border border-[#D9D9DF] bg-eventrix-white p-6 rounded-md transition-all hover:border-eventrix-black flex items-center justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender mb-4 group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">Event Roster</h4>
                  <p className="text-xs text-eventrix-muted">View participant list and mark manual attendance.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-black group-hover:translate-x-1 transition-all" />
              </Link>

              <Link href="/coordinator/attendance" className="group border border-[#D9D9DF] bg-eventrix-white p-6 rounded-md transition-all hover:border-eventrix-black flex items-center justify-between shadow-sm">
                <div>
                  <div className="w-10 h-10 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender mb-4 group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">Attendance Log</h4>
                  <p className="text-xs text-eventrix-muted">Review verified check-in logs and timestamps.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-black group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </section>

        </div>

      </div>
    </>
  );
}
