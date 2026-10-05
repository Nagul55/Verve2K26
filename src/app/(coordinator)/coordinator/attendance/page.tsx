import React from "react";
import { CheckCircle2, ShieldCheck, Download, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getCoordinatorAssignedEventIds } from "@/actions/event.actions";

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export default async function CoordinatorAttendancePage({ searchParams }: { searchParams: { event_id?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { assignedEventIds: allowedEventIds, role } = user ? await getCoordinatorAssignedEventIds(user.id) : { assignedEventIds: [], role: 'coordinator' };
  const isAdmin = role === 'admin' || role === 'Super Admin';

  const adminClient = getAdminClient();

  // Fetch events for mapping and filtering
  let { data: subEvents } = await adminClient.from('sub_events').select('id, title');
  const eventMap = new Map<string, string>();
  (subEvents || []).forEach(e => eventMap.set(e.id, e.title));

  // If not admin and has allowed events, restrict subEvents to only those allowed
  if (!isAdmin && allowedEventIds.length > 0) {
    subEvents = (subEvents || []).filter(e => allowedEventIds.includes(e.id));
  } else if (!isAdmin && allowedEventIds.length === 0) {
    subEvents = []; // Not assigned to any event
  }

  // Determine active event filter
  let activeEventId = searchParams?.event_id || 'all';
  
  // Validate activeEventId against allowed events if not admin
  if (!isAdmin) {
     if (activeEventId === 'all' && allowedEventIds.length === 1) {
       activeEventId = allowedEventIds[0];
     } else if (activeEventId !== 'all' && !allowedEventIds.includes(activeEventId)) {
       activeEventId = allowedEventIds.length > 0 ? allowedEventIds[0] : 'none';
     }
  }

  let rawLogs: any[] = [];

  if (activeEventId !== 'all' && activeEventId !== 'none') {
    const { data } = await adminClient
      .from('attendance')
      .select('attendance_id, scanned_at, source, status, participant_id, event_id')
      .eq('event_id', activeEventId)
      .order('scanned_at', { ascending: false });
    rawLogs = data || [];
  } else if (activeEventId === 'all') {
    let query = adminClient
      .from('attendance')
      .select('attendance_id, scanned_at, source, status, participant_id, event_id')
      .order('scanned_at', { ascending: false });
      
    if (!isAdmin && allowedEventIds.length > 0) {
      query = query.in('event_id', allowedEventIds);
    }
    
    const { data } = await query;
    rawLogs = data || [];
  }

  // Fetch real participants details from DB map to accurately populate name and details
  const { data: participantsData } = await adminClient.from('participants').select('*');
  const partMap = new Map<string, any>();
  (participantsData || []).forEach(p => partMap.set(p.participant_id, p));

  // Purge any orphan dummy attendance entries from DB that don't match any real participant
  const validParticipantIds = new Set((participantsData || []).map(p => p.participant_id));
  const orphanAttendanceIds = rawLogs
    .filter(log => !log.participant_id || !validParticipantIds.has(log.participant_id))
    .map(log => log.attendance_id);

  if (orphanAttendanceIds.length > 0) {
    await adminClient.from('attendance').delete().in('attendance_id', orphanAttendanceIds);
  }

  // Filter logs to include ONLY valid registered participants
  const logs = rawLogs
    .filter(log => log.participant_id && validParticipantIds.has(log.participant_id))
    .map(log => ({
      ...log,
      participants: partMap.get(log.participant_id)
    }));

  const renderTable = (tableLogs: any[], hideEventColumn: boolean) => (
    <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
      <table className="w-full text-left text-sm min-w-[700px]">
        <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
          <tr>
            <th className="px-6 py-4">Log ID</th>
            {!hideEventColumn && <th className="px-6 py-4">Event</th>}
            <th className="px-6 py-4">Participant</th>
            <th className="px-6 py-4">Register No.</th>
            <th className="px-6 py-4">Scan Time</th>
            <th className="px-6 py-4">Verification Method</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9D9DF]">
          {tableLogs.length === 0 ? (
            <tr>
              <td colSpan={hideEventColumn ? 6 : 7} className="px-6 py-16 text-center text-eventrix-muted font-bold">
                No attendance records found yet.
              </td>
            </tr>
          ) : (
            tableLogs.map((log) => {
              const logDate = log.scanned_at ? new Date(log.scanned_at) : new Date();
              const shortId = `LOG-${log.attendance_id ? log.attendance_id.split('-')[0].toUpperCase() : '001'}`;
              
              return (
                <tr key={log.attendance_id} className="hover:bg-[#F8F8FC] transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-lavender">{shortId}</td>
                  {!hideEventColumn && (
                    <td className="px-6 py-4 font-bold text-xs text-eventrix-black uppercase tracking-wider">
                      {eventMap.get(log.event_id) || 'Unknown Event'}
                    </td>
                  )}
                  <td className="px-6 py-4 font-bold text-eventrix-black">
                    {log.participants?.full_name || log.participants?.email || 'Registered Participant'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-muted">
                    {log.participants?.register_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-eventrix-black">
                    {logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <span className="text-eventrix-muted">({logDate.toLocaleDateString()})</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="bg-[#F8F8FC] border border-[#D9D9DF] px-2.5 py-1 rounded font-medium">
                      {log.source === 'QR_Scanner' ? 'QR Scanner' : (log.source || 'Manual Scan')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.status === 'Present' ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Present
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> {log.status || 'Check-in Error'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[32px] md:text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            ATTENDANCE LOGS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-xs md:text-sm">
            Audited record of all verified ticket scans and check-in timestamps recorded for your event.
          </p>
        </div>

        {activeEventId !== 'all' && (
          <a 
            href={`/api/admin/export?sub_event_id=${activeEventId}`}
            download
            className="bg-eventrix-black text-eventrix-white px-4 md:px-6 py-2 md:py-3 rounded-md font-bold text-xs md:text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center justify-center gap-2 shrink-0">
            <Download className="w-4 h-4" /> Export Event CSV
          </a>
        )}
      </div>

      {subEvents && subEvents.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <a
            href="?event_id=all"
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeEventId === 'all' ? 'bg-eventrix-lavender text-eventrix-black' : 'bg-[#F8F8FC] border border-[#D9D9DF] text-eventrix-muted hover:border-eventrix-black'}`}
          >
            All Assigned Events
          </a>
          {subEvents.map((event) => (
            <a
              key={event.id}
              href={`?event_id=${event.id}`}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${activeEventId === event.id ? 'bg-eventrix-lavender text-eventrix-black' : 'bg-[#F8F8FC] border border-[#D9D9DF] text-eventrix-muted hover:border-eventrix-black'}`}
            >
              {event.title}
            </a>
          ))}
        </div>
      )}

      {/* Audit Log Tables */}
      {activeEventId === 'all' ? (
        <div className="space-y-10">
          {subEvents?.map(event => {
            const eventLogs = logs.filter(log => log.event_id === event.id);
            return (
              <div key={event.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-eventrix-black pb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="font-anton text-xl md:text-2xl text-eventrix-black tracking-wide uppercase">{event.title}</h2>
                    <span className="bg-eventrix-lavender text-eventrix-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0">
                      {eventLogs.length} Checked In
                    </span>
                  </div>
                  <a 
                    href={`/api/admin/export?sub_event_id=${event.id}`}
                    download
                    className="bg-eventrix-black text-eventrix-white px-4 py-2 rounded-md font-bold text-[10px] md:text-xs tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[3px_3px_0px_0px_#A78BFA] flex items-center justify-center gap-2 w-full sm:w-auto shrink-0">
                    <Download className="w-3 h-3 md:w-4 md:h-4" /> Export CSV
                  </a>
                </div>
                {renderTable(eventLogs, true)}
              </div>
            );
          })}
        </div>
      ) : (
        renderTable(logs, true)
      )}
    </div>
  );
}
