"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, Download, Search, RefreshCw } from "lucide-react";

export default function CoordinatorAttendancePage() {
  const [logs] = useState([
    { id: "LOG-101", participant: "Imran Khan", registerNo: "21CS001", time: "10:14 AM", date: "Oct 15, 2026", event: "Code Clash", source: "QR Scanner", scanner: "Coordinator Admin" },
    { id: "LOG-102", participant: "Venkatesh S", registerNo: "21IT044", time: "10:18 AM", date: "Oct 15, 2026", event: "Code Clash", source: "QR Scanner", scanner: "Coordinator Admin" },
    { id: "LOG-103", participant: "Priya R", registerNo: "21EC089", time: "10:25 AM", date: "Oct 15, 2026", event: "Code Clash", source: "Manual Lookup", scanner: "Coordinator Admin" },
    { id: "LOG-104", participant: "Anish K", registerNo: "21ME012", time: "10:31 AM", date: "Oct 15, 2026", event: "Code Clash", source: "QR Scanner", scanner: "Coordinator Admin" },
  ]);

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

        <button className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Attendance CSV
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
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
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#F8F8FC] transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-lavender">{log.id}</td>
                <td className="px-6 py-4 font-bold text-eventrix-black">{log.participant}</td>
                <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-muted">{log.registerNo}</td>
                <td className="px-6 py-4 text-xs font-medium text-eventrix-black">
                  {log.time} <span className="text-eventrix-muted">({log.date})</span>
                </td>
                <td className="px-6 py-4 text-xs">
                  <span className="bg-[#F8F8FC] border border-[#D9D9DF] px-2.5 py-1 rounded font-medium">
                    {log.source}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified Present
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
