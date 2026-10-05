import React from "react";
import { Users, Calendar, Ticket, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getSubEvents, getAdminParticipants } from "@/actions/event.actions";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import Link from "next/link";

export default async function AdminDashboard() {
  let events: any[] = [];
  let allParticipants: any[] = [];
  let eventsError = false;

  try {
    events = await getSubEvents(undefined, true) || [];
  } catch (err) {
    console.error("Failed to fetch sub-events for Admin Dashboard:", err);
    eventsError = true;
  }

  try {
    allParticipants = await getAdminParticipants() || [];
  } catch (err) {
    console.error("Failed to fetch participants for Admin Dashboard:", err);
  }

  // Helper to extract flat array of sub-events for a participant
  const getParticipantEvents = (p: any): any[] => {
    if (!p.registrations || !Array.isArray(p.registrations)) return [];
    const subEvs: any[] = [];
    p.registrations.forEach((reg: any) => {
      reg.registration_sub_events?.forEach((rse: any) => {
        if (rse.sub_events) {
          subEvs.push(rse.sub_events);
        }
      });
    });
    return subEvs;
  };

  // Filter participants who have registered for at least 1 sub-event
  const registeredParticipants = allParticipants.filter(p => getParticipantEvents(p).length > 0);
  const registeredParticipantsCount = registeredParticipants.length;

  // Calculate total sub-event registration bookings across all participants
  const totalRegistrationsCount = allParticipants.reduce((acc, p) => acc + getParticipantEvents(p).length, 0);

  // Status Helpers based on database conventions:
  // LIVE / APPROVED -> Approved & Live
  // PENDING_APPROVAL / DRAFT / Pending -> Pending Admin Review
  // REJECTED -> Rejected
  const isPendingEvent = (e: any) => {
    const s = (e.status || '').toUpperCase();
    return s !== 'LIVE' && s !== 'APPROVED' && s !== 'REJECTED';
  };

  const isLiveEvent = (e: any) => {
    const s = (e.status || '').toUpperCase();
    return s === 'LIVE' || s === 'APPROVED';
  };

  // Fetch pending events for the table
  const pendingEvents = events.filter(isPendingEvent);
  const activeEventsCount = events.filter(isLiveEvent).length;
  
  // Fetch recent participants (limit 5)
  const recentParticipants = allParticipants.slice(0, 5);

  // FETCH REAL DATA FOR CHARTS (Last 7 Days)
  const today = new Date();
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      registrations: 0,
    };
  });

  allParticipants.forEach(p => {
    if (p.registrations && Array.isArray(p.registrations)) {
      p.registrations.forEach((reg: any) => {
        if (reg.created_at) {
          const regDate = new Date(reg.created_at).toISOString().split('T')[0];
          const dayData = last7DaysData.find(d => d.dateStr === regDate);
          if (dayData) {
            dayData.registrations += (reg.registration_sub_events?.length || 1);
          }
        }
      });
    }
  });

  // REAL-TIME ANALYTICS: Calculate 7-Day vs Previous 7-Day Registration Growth Rate
  let currentPeriodRegs = 0;
  let previousPeriodRegs = 0;

  allParticipants.forEach(p => {
    if (p.registrations && Array.isArray(p.registrations)) {
      p.registrations.forEach((reg: any) => {
        if (reg.created_at) {
          const regDate = new Date(reg.created_at);
          const diffDays = Math.floor((today.getTime() - regDate.getTime()) / (1000 * 3600 * 24));
          const count = reg.registration_sub_events?.length || 1;
          
          if (diffDays >= 0 && diffDays < 7) {
            currentPeriodRegs += count;
          } else if (diffDays >= 7 && diffDays < 14) {
            previousPeriodRegs += count;
          }
        }
      });
    }
  });

  let growthRate = "+0%";
  if (previousPeriodRegs === 0) {
    if (currentPeriodRegs > 0) {
      growthRate = "+100%";
    } else {
      growthRate = "0%";
    }
  } else {
    const diff = currentPeriodRegs - previousPeriodRegs;
    const pct = Math.round((diff / previousPeriodRegs) * 100);
    growthRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  const trendsData = last7DaysData.map(d => ({ name: d.name, registrations: d.registrations }));

  // DEMOGRAPHICS CALCULATIONS (Year of Study, Department, College) - Computes ONLY from Student accounts
  const studentParticipants = allParticipants.filter(p => (p.role || 'student').toLowerCase() === 'student');
  const totalCountForDemo = studentParticipants.length || 1;

  // 1. Year of Study
  const yearCounts: Record<string, number> = {};
  studentParticipants.forEach(p => {
    const yr = (p.year_of_study || p.yearOfStudy || '').trim();
    const label = yr ? (yr.includes('Yr') || yr.includes('Year') ? yr : `${yr} Year`) : 'Not Specified';
    yearCounts[label] = (yearCounts[label] || 0) + 1;
  });

  const yearData = Object.entries(yearCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalCountForDemo) * 100)
  })).sort((a, b) => b.count - a.count);

  // 2. Department Breakdown
  const deptCounts: Record<string, number> = {};
  studentParticipants.forEach(p => {
    const dept = (p.department || '').trim().toUpperCase();
    const label = dept || 'NOT SPECIFIED';
    deptCounts[label] = (deptCounts[label] || 0) + 1;
  });

  const deptData = Object.entries(deptCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalCountForDemo) * 100)
  })).sort((a, b) => b.count - a.count);

  // 3. College Breakdown
  const collegeCounts: Record<string, number> = {};
  studentParticipants.forEach(p => {
    const col = (p.college || '').trim();
    const label = col || 'Not Specified';
    collegeCounts[label] = (collegeCounts[label] || 0) + 1;
  });

  const collegeData = Object.entries(collegeCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalCountForDemo) * 100)
  })).sort((a, b) => b.count - a.count);

  const stats = [
    { label: "TOTAL PARTICIPANTS", value: registeredParticipantsCount, icon: Users },
    { label: "TOTAL REGISTRATIONS", value: totalRegistrationsCount, icon: Ticket },
    { label: "PENDING APPROVALS", value: pendingEvents.length, icon: AlertCircle, alert: true },
    { label: "ACTIVE EVENTS", value: activeEventsCount, icon: Calendar },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Hero Banner */}
      <div className="relative w-full min-h-[165px] sm:min-h-[190px] md:h-[260px] bg-eventrix-black text-eventrix-white overflow-hidden rounded-xl flex flex-col justify-start md:justify-end p-4 sm:p-6 md:p-10 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-eventrix-lavender to-blue-500" style={{ clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)" }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-start md:justify-end">
          <img 
            src="/assets/Eventrix logo.svg" 
            alt="Eventrix Logo" 
            className="w-[85px] sm:w-[105px] md:w-[130px] h-auto mb-2 md:mb-3.5 object-contain self-start"
          />
          <div className="flex items-center gap-2 mb-1 md:mb-1.5 text-eventrix-lavender font-bold text-[11px] sm:text-xs md:text-sm tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4" /> System Health: Excellent
          </div>
          <h1 className="font-anton text-3xl sm:text-4xl md:text-[64px] leading-[0.9] md:leading-[0.85] tracking-wide mb-1 md:mb-2 uppercase text-white">
            ADMIN PORTAL
          </h1>
          <p className="text-eventrix-white/75 font-medium max-w-xl text-[11px] sm:text-xs md:text-base leading-snug">
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

      {/* Charts & Demographics Section */}
      <DashboardCharts 
        trendsData={trendsData} 
        growthRate={growthRate} 
        yearData={yearData}
        deptData={deptData}
        collegeData={collegeData}
      />

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Approvals */}
        <div className="border border-[#D9D9DF] bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#D9D9DF] flex justify-between items-center bg-[#F8F8FC] shrink-0">
            <h3 className="font-bold text-eventrix-black text-sm uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Event Approvals
            </h3>
            <Link href="/admin/sub-events" className="text-xs font-bold text-eventrix-lavender hover:text-eventrix-black transition-colors uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="p-0 flex-1 flex flex-col min-h-[220px]">
            {eventsError ? (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full my-auto">
                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-bold text-eventrix-black text-sm">Unable to load pending approvals.</p>
                <p className="text-xs text-eventrix-muted mt-1 mb-4">Failed to fetch events from database.</p>
                <Link href="/admin" className="text-xs font-bold bg-eventrix-black text-white px-3 py-1.5 rounded uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-colors">
                  Retry
                </Link>
              </div>
            ) : pendingEvents.length > 0 ? (
              <div className="divide-y divide-[#D9D9DF] max-h-[380px] overflow-y-auto">
                {pendingEvents.map(event => (
                  <div key={event.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-[#F8F8FC] transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-eventrix-black text-sm">{event.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          event.status === 'PENDING_APPROVAL' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {event.status === 'PENDING_APPROVAL' ? 'Pending Approval' : event.status}
                        </span>
                      </div>
                      <p className="text-xs text-eventrix-muted font-medium">
                        {event.category} • {event.participation_type || 'Individual'} • {event.coordinatorNames && event.coordinatorNames.length > 0 ? event.coordinatorNames.join(', ') : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center h-full my-auto opacity-60">
                <CheckCircle2 className="w-10 h-10 text-green-500 mb-3" />
                <p className="font-bold text-eventrix-black text-sm">All caught up!</p>
                <p className="text-xs text-eventrix-muted mt-1">No pending events to approve.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Signups */}
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
                {recentParticipants.map((participant: any) => (
                  <div key={participant.id || participant.participant_id || participant.email} className="p-5 flex justify-between items-center hover:bg-[#F8F8FC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-eventrix-light-lavender flex items-center justify-center text-eventrix-lavender font-bold text-xs">
                        {(participant.full_name || participant.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-eventrix-black text-sm">{participant.full_name || 'Unnamed Participant'}</h4>
                        <p className="text-[10px] font-medium text-eventrix-muted mt-0.5">{participant.college || 'No college specified'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-eventrix-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {participant.created_at ? new Date(participant.created_at).toLocaleDateString() : 'N/A'}
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
