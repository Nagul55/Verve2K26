import React from "react";
import { Users, Calendar, Ticket, ShieldCheck, ArrowRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getSubEvents } from "@/actions/event.actions";
import { createClient } from "@/lib/supabase/server";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import Link from "next/link";
import { ApproveButton } from "@/components/ApproveButton";

export default async function AdminDashboard() {
  const events = await getSubEvents(undefined, true) || [];
  const supabase = await createClient();
  
  // Fetch high-level admin stats
  const { count: participantsCount } = await supabase.from('participants').select('*', { count: 'exact', head: true });
  const { count: registrationsCount } = await supabase.from('event_registrations').select('*', { count: 'exact', head: true });
  
  // Fetch pending events for the table
  const pendingEvents = events.filter(e => e.status === 'Pending').slice(0, 5);
  
  // Fetch recent participants
  const { data: recentParticipants } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { label: "TOTAL PARTICIPANTS", value: participantsCount || 0, icon: Users },
    { label: "TOTAL REGISTRATIONS", value: registrationsCount || 0, icon: Ticket },
    { label: "PENDING APPROVALS", value: events.filter(e => e.status === 'Pending').length, icon: AlertCircle, alert: true },
    { label: "ACTIVE EVENTS", value: events.filter(e => e.status === 'Approved').length, icon: Calendar },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Hero Banner */}
      <div className="relative w-full h-[220px] bg-eventrix-black text-eventrix-white overflow-hidden rounded-xl flex flex-col justify-end p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-eventrix-lavender to-blue-500" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-eventrix-lavender font-bold text-xs tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" /> System Health: Excellent
          </div>
          <h1 className="font-anton text-5xl md:text-[60px] leading-[0.85] tracking-wide mb-2 uppercase text-white">
            ADMIN PORTAL
          </h1>
          <p className="text-eventrix-white/70 font-medium max-w-xl text-sm">
            Overview of Verve26 event operations, participant registrations, and pending approvals.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`border border-[#D9D9DF] p-6 rounded-xl flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-eventrix-lavender ${stat.alert && stat.value > 0 ? 'bg-red-50/50' : 'bg-white'}`}>
            {stat.alert && stat.value > 0 && (
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            )}
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={`w-5 h-5 ${stat.alert && stat.value > 0 ? 'text-red-500' : 'text-eventrix-lavender'}`} />
            </div>
            <span className="text-3xl font-bold text-eventrix-black font-anton tracking-wide">{stat.value}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${stat.alert && stat.value > 0 ? 'text-red-500' : 'text-eventrix-muted'}`}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts />

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Approvals */}
        <div className="border border-[#D9D9DF] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#D9D9DF] flex justify-between items-center bg-[#F8F8FC]">
            <h3 className="font-bold text-eventrix-black text-sm uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Event Approvals
            </h3>
            <Link href="/admin/sub-events" className="text-xs font-bold text-eventrix-lavender hover:text-eventrix-black transition-colors uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="p-0 flex-1">
            {pendingEvents.length > 0 ? (
              <div className="divide-y divide-[#D9D9DF]">
                {pendingEvents.map(event => (
                  <div key={event.id} className="p-5 flex justify-between items-center hover:bg-[#F8F8FC] transition-colors">
                    <div>
                      <h4 className="font-bold text-eventrix-black text-sm">{event.title}</h4>
                      <p className="text-xs text-eventrix-muted mt-1">{event.category} • {event.participation_type}</p>
                    </div>
                    <div className="flex gap-2">
                       <ApproveButton id={event.id} isApproved={event.status === 'Approved'} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center h-full opacity-60">
                <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                <p className="font-bold text-eventrix-black text-sm">All caught up!</p>
                <p className="text-xs text-eventrix-muted mt-1">No pending events to approve.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Participants */}
        <div className="border border-[#D9D9DF] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#D9D9DF] flex justify-between items-center bg-[#F8F8FC]">
            <h3 className="font-bold text-eventrix-black text-sm uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Recent Signups
            </h3>
            <Link href="/admin/participants" className="text-xs font-bold text-eventrix-lavender hover:text-eventrix-black transition-colors uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="p-0 flex-1">
            {recentParticipants && recentParticipants.length > 0 ? (
              <div className="divide-y divide-[#D9D9DF]">
                {recentParticipants.map(participant => (
                  <div key={participant.participant_id} className="p-5 flex justify-between items-center hover:bg-[#F8F8FC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-eventrix-light-lavender flex items-center justify-center text-eventrix-lavender font-bold text-xs">
                        {participant.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-eventrix-black text-sm">{participant.full_name}</h4>
                        <p className="text-[10px] font-medium text-eventrix-muted mt-0.5">{participant.college || 'No college specified'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-eventrix-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(participant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center h-full">
                <p className="font-bold text-eventrix-muted text-sm">No recent signups</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
