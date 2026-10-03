"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Search, CheckCircle2, Clock, Filter, UserCheck, RefreshCw, Mail, Phone, Building2 } from "lucide-react";
import { getCoordinatorParticipants } from "@/actions/event.actions";

export default function CoordinatorParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCoordinatorParticipants();
      setParticipants(data || []);
      
      const initialAttendanceState: Record<string, boolean> = {};
      (data || []).forEach((p: any) => {
        if (p.isPresent) {
          initialAttendanceState[p.id || p.participant_id] = true;
        }
      });
      setAttendanceState(initialAttendanceState);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (id: string) => {
    setAttendanceState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filtered = useMemo(() => {
    return participants.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.register_number && p.register_number.toLowerCase().includes(q)) ||
        (p.college && p.college.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q));

      const isChecked = !!attendanceState[p.id || p.participant_id];
      const matchesStatus = statusFilter === "ALL" || 
        (statusFilter === "PRESENT" && isChecked) || 
        (statusFilter === "PENDING" && !isChecked);

      return matchesSearch && matchesStatus;
    });
  }, [participants, searchQuery, statusFilter, attendanceState]);

  const presentCount = Object.values(attendanceState).filter(Boolean).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            EVENT PARTICIPANTS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Event Coordinator Roster: View registered students for your event and record real-time attendance.
          </p>
        </div>

        <button 
          onClick={loadData}
          className="p-3 bg-white border border-[#D9D9DF] rounded-md text-eventrix-black hover:bg-[#F8F8FC] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Roster
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <p className="text-xs font-bold text-eventrix-muted uppercase tracking-widest mb-1">Total Enrolled</p>
          <p className="text-3xl font-anton text-eventrix-black">{participants.length}</p>
        </div>
        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <p className="text-xs font-bold text-eventrix-muted uppercase tracking-widest mb-1">Checked-In (Present)</p>
          <p className="text-3xl font-anton text-emerald-600">{presentCount}</p>
        </div>
        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <p className="text-xs font-bold text-eventrix-muted uppercase tracking-widest mb-1">Pending Check-Ins</p>
          <p className="text-3xl font-anton text-amber-600">{Math.max(0, participants.length - presentCount)}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#D9D9DF] p-4 rounded-md shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-eventrix-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-sm font-medium focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#F8F8FC] border border-[#D9D9DF] px-3 py-2 rounded-md">
            <Filter className="w-4 h-4 text-eventrix-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-eventrix-black focus:outline-none uppercase tracking-wide"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Checked-In Only ({presentCount})</option>
              <option value="PENDING">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Register No.</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">College & Dept</th>
                <th className="px-6 py-4">Attendance Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    Loading roster...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    No matching participants found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const pId = p.id || p.participant_id;
                  const isPresent = !!attendanceState[pId];

                  return (
                    <tr key={pId || p.email} className="hover:bg-[#F8F8FC] transition-colors">
                      <td className="px-6 py-4 font-bold text-eventrix-black">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-black font-anton">
                            {(p.full_name || p.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-eventrix-black">{p.full_name || "Unnamed Participant"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-xs">
                        <span className="bg-[#F8F8FC] border border-[#D9D9DF] px-2.5 py-1 rounded">
                          {p.register_number || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="text-eventrix-black font-medium">{p.email}</p>
                          <p className="text-eventrix-muted">{p.mobile || "No phone"}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <p className="font-bold text-eventrix-black">{p.college || "N/A"}</p>
                        <p className="text-eventrix-muted">{p.department || "N/A"}</p>
                      </td>

                      <td className="px-6 py-4">
                        {isPresent ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Checked In
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleAttendance(pId)}
                          className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                            isPresent 
                              ? 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700' 
                              : 'bg-eventrix-black text-white hover:bg-eventrix-lavender hover:text-black'
                          }`}
                        >
                          {isPresent ? "Undo Check-In" : "Mark Present"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
