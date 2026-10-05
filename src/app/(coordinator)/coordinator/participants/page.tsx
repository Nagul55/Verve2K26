"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Phone, 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  AlertCircle 
} from "lucide-react";
import { 
  getCoordinatorEventsWithParticipants, 
  toggleParticipantAttendance, 
  CoordinatorEventGroup,
  EventParticipant
} from "@/actions/event.actions";
import { EventrixSelect } from "@/components/ui/EventrixSelect";

export default function CoordinatorParticipantsPage() {
  const [eventGroups, setEventGroups] = useState<CoordinatorEventGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-event search queries: { [eventId]: string }
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  // Per-event status filters: { [eventId]: "ALL" | "PRESENT" | "PENDING" }
  const [statusFilters, setStatusFilters] = useState<Record<string, string>>({});
  // Per-event collapsed state: { [eventId]: boolean }
  const [collapsedEvents, setCollapsedEvents] = useState<Record<string, boolean>>({});
  // Processing state for attendance toggle buttons: { [`${eventId}_${participantId}`]: boolean }
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await getCoordinatorEventsWithParticipants();
      setEventGroups(data || []);
    } catch (err: any) {
      console.error("Failed to load coordinator events:", err);
      setError(err?.message || "Failed to load participants. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleAttendance = async (eventId: string, participantId: string, currentStatus: 'PRESENT' | 'PENDING') => {
    const key = `${eventId}_${participantId}`;
    const targetStatus: 'PRESENT' | 'PENDING' = currentStatus === 'PRESENT' ? 'PENDING' : 'PRESENT';

    // Set action loading
    setActionLoading(prev => ({ ...prev, [key]: true }));

    // Optimistic UI update
    setEventGroups(prevGroups =>
      prevGroups.map(group => {
        if (group.event.id !== eventId) return group;

        const updatedParticipants: EventParticipant[] = group.participants.map(p => {
          if (p.participantId === participantId) {
            return { ...p, attendanceStatus: targetStatus };
          }
          return p;
        });

        const presentCount = updatedParticipants.filter(p => p.attendanceStatus === 'PRESENT').length;
        const pendingCount = updatedParticipants.filter(p => p.attendanceStatus === 'PENDING').length;

        return {
          ...group,
          statistics: {
            total: updatedParticipants.length,
            present: presentCount,
            pending: pendingCount
          },
          participants: updatedParticipants
        };
      })
    );

    try {
      const res = await toggleParticipantAttendance(eventId, participantId, targetStatus);
      if (!res.success) {
        console.error("Attendance update failed:", res.error);
        await loadData();
      }
    } catch (err) {
      console.error("Attendance update error:", err);
      await loadData();
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleEventCollapse = (eventId: string) => {
    setCollapsedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            EVENT PARTICIPANTS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Event Coordinator Roster: View registered students grouped by event and record real-time attendance independently.
          </p>
        </div>

        <button 
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className="p-3 bg-white border border-[#D9D9DF] rounded-md text-eventrix-black hover:bg-[#F8F8FC] transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider self-start md:self-auto disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin' : ''}`} /> Refresh Roster
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button 
            onClick={() => loadData()}
            className="ml-auto underline font-bold hover:text-red-900 text-xs uppercase"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#D9D9DF] rounded-md p-6 animate-pulse space-y-4">
              <div className="h-6 bg-slate-100 rounded w-1/3"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-slate-100 rounded"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
              <div className="h-32 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : eventGroups.length === 0 ? (
        /* Empty Assigned Events State */
        <div className="bg-white border border-[#D9D9DF] rounded-md p-12 text-center max-w-md mx-auto my-8">
          <Users className="w-12 h-12 text-eventrix-muted mx-auto mb-4 opacity-50" />
          <h3 className="font-anton text-xl text-eventrix-black uppercase mb-2">No Events Assigned</h3>
          <p className="text-eventrix-muted text-sm font-medium">
            You do not currently have any sub-events assigned to your coordinator account. Contact your administrator if this is an error.
          </p>
        </div>
      ) : (
        /* Event Groups List */
        <div className="space-y-8">
          {eventGroups.map((group) => {
            const eventId = group.event.id;
            const isCollapsed = !!collapsedEvents[eventId];
            const searchQuery = (searchQueries[eventId] || "").toLowerCase().trim();
            const statusFilter = statusFilters[eventId] || "ALL";

            // Filter participants per event
            const filteredParticipants = group.participants.filter(p => {
              const matchesSearch = !searchQuery || 
                p.fullName.toLowerCase().includes(searchQuery) ||
                p.email.toLowerCase().includes(searchQuery) ||
                p.registerNumber.toLowerCase().includes(searchQuery) ||
                p.college.toLowerCase().includes(searchQuery) ||
                p.department.toLowerCase().includes(searchQuery);

              const matchesStatus = statusFilter === "ALL" || 
                (statusFilter === "PRESENT" && p.attendanceStatus === "PRESENT") || 
                (statusFilter === "PENDING" && p.attendanceStatus === "PENDING");

              return matchesSearch && matchesStatus;
            });

            return (
              <div key={eventId} className="bg-white border border-[#D9D9DF] rounded-md shadow-sm overflow-hidden transition-all">
                {/* Event Card Header */}
                <div 
                  onClick={() => toggleEventCollapse(eventId)}
                  className="bg-[#F8F8FC] border-b border-[#D9D9DF] p-5 cursor-pointer hover:bg-[#F2F2F8] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start md:items-center gap-3">
                    <button 
                      type="button" 
                      className="mt-1 md:mt-0 p-1 text-eventrix-black hover:bg-white rounded transition-colors"
                    >
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h2 className="font-anton text-2xl text-eventrix-black uppercase tracking-wide">
                          {group.event.title}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          group.event.category?.toLowerCase() === 'technical' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {group.event.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {group.event.format}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-eventrix-muted">
                        {group.event.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {group.event.event_date} {group.event.event_time && `• ${group.event.event_time}`}
                          </span>
                        )}
                        {group.event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {group.event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Summary Pills on Header */}
                  <div className="flex items-center gap-3 text-xs font-bold shrink-0 self-end md:self-auto">
                    <span className="px-3 py-1 bg-white border border-[#D9D9DF] rounded-full text-eventrix-black">
                      Total: {group.statistics.total}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
                      Present: {group.statistics.present}
                    </span>
                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700">
                      Pending: {group.statistics.pending}
                    </span>
                  </div>
                </div>

                {/* Collapsible Content */}
                {!isCollapsed && (
                  <div className="p-6 space-y-6">
                    {/* Event Stats Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#F8F8FC] border border-[#D9D9DF] p-4 rounded-md">
                        <p className="text-[11px] font-bold text-eventrix-muted uppercase tracking-widest mb-1">Total Enrolled</p>
                        <p className="text-2xl font-anton text-eventrix-black">{group.statistics.total}</p>
                      </div>
                      <div className="bg-[#F8F8FC] border border-[#D9D9DF] p-4 rounded-md">
                        <p className="text-[11px] font-bold text-eventrix-muted uppercase tracking-widest mb-1">Checked-In (Present)</p>
                        <p className="text-2xl font-anton text-emerald-600">{group.statistics.present}</p>
                      </div>
                      <div className="bg-[#F8F8FC] border border-[#D9D9DF] p-4 rounded-md">
                        <p className="text-[11px] font-bold text-eventrix-muted uppercase tracking-widest mb-1">Pending Check-Ins</p>
                        <p className="text-2xl font-anton text-amber-600">{group.statistics.pending}</p>
                      </div>
                    </div>

                    {/* Filter and Search Bar for this event */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-eventrix-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search participants in this event..."
                          value={searchQueries[eventId] || ""}
                          onChange={(e) => setSearchQueries(prev => ({ ...prev, [eventId]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-medium focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="w-full sm:w-56">
                        <EventrixSelect
                          value={statusFilter}
                          onChange={(val) => setStatusFilters(prev => ({ ...prev, [eventId]: val }))}
                          options={[
                            { value: "ALL", label: "All Statuses" },
                            { value: "PRESENT", label: `Checked-In (${group.statistics.present})` },
                            { value: "PENDING", label: `Pending (${group.statistics.pending})` },
                          ]}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Participants Table for this event */}
                    {group.participants.length === 0 ? (
                      /* Empty event roster state */
                      <div className="border border-dashed border-[#D9D9DF] rounded-md p-8 text-center bg-[#F8F8FC]">
                        <Users className="w-8 h-8 text-eventrix-muted mx-auto mb-2 opacity-40" />
                        <p className="font-anton text-sm text-eventrix-black uppercase mb-1">No Participants Yet</p>
                        <p className="text-eventrix-muted text-xs font-medium">
                          Students who register for {group.event.title} will appear here automatically.
                        </p>
                      </div>
                    ) : filteredParticipants.length === 0 ? (
                      /* No filter match state */
                      <div className="border border-dashed border-[#D9D9DF] rounded-md p-8 text-center bg-[#F8F8FC]">
                        <Search className="w-8 h-8 text-eventrix-muted mx-auto mb-2 opacity-40" />
                        <p className="font-anton text-sm text-eventrix-black uppercase mb-1">No Matching Participants</p>
                        <p className="text-eventrix-muted text-xs font-medium">
                          No participants match your current search query or status filter for this event.
                        </p>
                      </div>
                    ) : (
                      <div className="border border-[#D9D9DF] rounded-md overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs min-w-[700px]">
                            <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-5 py-3">Participant</th>
                                <th className="px-5 py-3">Register No.</th>
                                <th className="px-5 py-3">Contact</th>
                                <th className="px-5 py-3">College & Dept</th>
                                <th className="px-5 py-3">Attendance Status</th>
                                <th className="px-5 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#D9D9DF]">
                              {filteredParticipants.map((p) => {
                                const isPresent = p.attendanceStatus === 'PRESENT';
                                const key = `${eventId}_${p.participantId}`;
                                const isBusy = !!actionLoading[key];

                                return (
                                  <tr key={p.participantId} className="hover:bg-[#F9F9FC] transition-colors">
                                    <td className="px-5 py-4 font-bold text-eventrix-black">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#EEEEF5] border border-[#D9D9DF] flex items-center justify-center font-anton text-eventrix-purple text-xs shrink-0 uppercase">
                                          {p.fullName ? p.fullName.charAt(0) : 'P'}
                                        </div>
                                        <div>
                                          <div className="text-sm font-bold text-eventrix-black">{p.fullName}</div>
                                          <div className="text-[11px] font-medium text-eventrix-muted">{p.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-eventrix-muted">
                                      <span className="bg-[#F8F8FC] border border-[#D9D9DF] px-2 py-1 rounded font-mono text-[11px]">
                                        {p.registerNumber}
                                      </span>
                                    </td>
                                    <td className="px-5 py-4 text-eventrix-muted font-medium">
                                      {p.mobile !== 'N/A' ? (
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                          <Phone className="w-3.5 h-3.5 text-eventrix-muted shrink-0" />
                                          <span>{p.mobile}</span>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-eventrix-muted font-mono">N/A</span>
                                      )}
                                    </td>
                                    <td className="px-5 py-4 text-eventrix-muted">
                                      <div className="font-bold text-eventrix-black text-xs line-clamp-1">{p.college}</div>
                                      <div className="text-[11px] text-eventrix-muted line-clamp-1">{p.department}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                      {isPresent ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px] uppercase tracking-wider">
                                          <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] uppercase tracking-wider">
                                          <Clock className="w-3.5 h-3.5" /> Pending
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <button
                                        onClick={() => handleToggleAttendance(eventId, p.participantId, p.attendanceStatus)}
                                        disabled={isBusy}
                                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                                          isPresent
                                            ? 'bg-[#F8F8FC] border border-[#D9D9DF] text-eventrix-black hover:bg-[#EEEEF5]'
                                            : 'bg-eventrix-black text-white hover:bg-[#2A2A38]'
                                        }`}
                                      >
                                        {isBusy ? (
                                          <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                                        ) : isPresent ? (
                                          'Undo Check-In'
                                        ) : (
                                          'Mark Present'
                                        )}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
