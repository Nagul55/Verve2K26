import React from "react";
import { CheckCircle2, ShieldCheck, Download, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export default async function CoordinatorAttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Retrieve assigned event for coordinator from user metadata
  const assignedEventId = user?.app_metadata?.coordinating_event_id;
  const adminClient = getAdminClient();

  let rawLogs: any[] = [];

  if (assignedEventId) {
    const { data } = await adminClient
      .from('attendance')
      .select('attendance_id, scanned_at, source, status, participant_id, event_id')
      .eq('event_id', assignedEventId)
      .order('scanned_at', { ascending: false });
    rawLogs = data || [];
  } else {
    const { data } = await adminClient
      .from('attendance')
      .select('attendance_id, scanned_at, source, status, participant_id, event_id')
      .order('scanned_at', { ascending: false });
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

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            ATTENDANCE LOGS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Audited record of all verified ticket scans and check-in timestamps recorded for your event.
          </p>
        </div>

        <a 
          href={assignedEventId ? `/api/admin/export?sub_event_id=${assignedEventId}` : `/api/admin/export`}
          download
          className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Attendance CSV
        </a>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Log ID</th>
              <th className="px-6 py-4">Participant</th>
              <th className="px-6 py-4">Register No.</th>
              <th className="px-6 py-4">Scan Time</th>
              <th className="px-6 py-4">Verification Method</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-eventrix-muted font-bold">
                  No attendance records found yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const logDate = log.scanned_at ? new Date(log.scanned_at) : new Date();
                const shortId = `LOG-${log.attendance_id ? log.attendance_id.split('-')[0].toUpperCase() : '001'}`;
                
                return (
                  <tr key={log.attendance_id} className="hover:bg-[#F8F8FC] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-lavender">{shortId}</td>
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
    </div>
  );
}
