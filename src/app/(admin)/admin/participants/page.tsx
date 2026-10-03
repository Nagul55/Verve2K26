"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Download, 
  Filter, 
  RefreshCw, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  FileText, 
  X, 
  ChevronRight,
  Sparkles,
  Ticket
} from "lucide-react";
import { getAdminParticipants } from "@/actions/event.actions";

interface SubEventInfo {
  id: string;
  title: string;
  category: string;
  date?: string;
  location?: string;
  time?: string;
}

interface Registration {
  id: string;
  fest_id: string;
  created_at: string;
  registration_sub_events?: {
    sub_events?: SubEventInfo | null;
  }[];
}

interface Participant {
  id: string;
  participant_id: string;
  full_name: string;
  register_number: string;
  email: string;
  mobile: string;
  college: string;
  department: string;
  year_of_study: string;
  section: string | null;
  created_at: string;
  registrations?: Registration[];
}

export default function AdminParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    setLoading(true);
    try {
      const data = await getAdminParticipants();
      setParticipants(data || []);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract flat array of sub-events for a participant
  const getParticipantEvents = (p: Participant): SubEventInfo[] => {
    if (!p.registrations) return [];
    const events: SubEventInfo[] = [];
    p.registrations.forEach(reg => {
      reg.registration_sub_events?.forEach(rse => {
        if (rse.sub_events) {
          events.push(rse.sub_events);
        }
      });
    });
    return events;
  };

  // Extract unique departments & colleges for filters
  const departments = useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      if (p.department) set.add(p.department);
    });
    return Array.from(set).sort();
  }, [participants]);

  const colleges = useMemo(() => {
    const set = new Set<string>();
    participants.forEach(p => {
      if (p.college) set.add(p.college);
    });
    return Array.from(set).sort();
  }, [participants]);

  // Filtered list
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.register_number && p.register_number.toLowerCase().includes(q)) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.college && p.college.toLowerCase().includes(q)) ||
        (p.department && p.department.toLowerCase().includes(q));

      const matchesDept = selectedDept === "ALL" || p.department === selectedDept;
      const matchesCollege = selectedCollege === "ALL" || p.college === selectedCollege;

      return matchesSearch && matchesDept && matchesCollege;
    });
  }, [participants, searchQuery, selectedDept, selectedCollege]);

  // Compute metric stats
  const totalRegistrations = useMemo(() => {
    return participants.reduce((acc, p) => acc + getParticipantEvents(p).length, 0);
  }, [participants]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            ALL PARTICIPANTS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Manage, search, and monitor student registrations across all departments and sub-events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadParticipants}
            disabled={loading}
            className="p-3 bg-white border border-[#D9D9DF] rounded-md text-eventrix-black hover:bg-[#F8F8FC] transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <a
            href="/api/admin/export"
            download
            className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Total Students</span>
            <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{participants.length}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Registered on system</p>
        </div>

        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Event Bookings</span>
            <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{totalRegistrations}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Sub-event slots allocated</p>
        </div>

        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest font-mono">Colleges</span>
            <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{colleges.length}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Institutions represented</p>
        </div>

        <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Departments</span>
            <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-anton text-eventrix-black">{departments.length}</p>
          <p className="text-xs text-eventrix-muted mt-1 font-medium">Branches & Specializations</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#D9D9DF] p-4 rounded-md shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-eventrix-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, reg no, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-sm font-medium focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#F8F8FC] border border-[#D9D9DF] px-3 py-2 rounded-md">
            <Filter className="w-4 h-4 text-eventrix-muted" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-bold text-eventrix-black focus:outline-none uppercase tracking-wide"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F8FC] border border-[#D9D9DF] px-3 py-2 rounded-md">
            <Building2 className="w-4 h-4 text-eventrix-muted" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="bg-transparent text-xs font-bold text-eventrix-black focus:outline-none uppercase tracking-wide"
            >
              <option value="ALL">All Colleges ({colleges.length})</option>
              {colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedDept !== "ALL" || selectedCollege !== "ALL") && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedDept("ALL"); setSelectedCollege("ALL"); }}
              className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 uppercase tracking-wider"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Register No.</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">College & Dept</th>
                <th className="px-6 py-4">Enrolled Events</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9DF]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-eventrix-lavender" />
                    Loading participants data...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                    No participants match your criteria.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  const events = getParticipantEvents(p);
                  return (
                    <tr key={p.id || p.participant_id || p.email} className="hover:bg-[#F8F8FC] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-black font-anton text-lg">
                            {(p.full_name || p.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-eventrix-black">{p.full_name || "Unnamed Participant"}</p>
                            <p className="text-[11px] text-eventrix-muted font-mono">
                              Joined {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-xs text-eventrix-black">
                        <span className="bg-[#F8F8FC] border border-[#D9D9DF] px-2.5 py-1 rounded text-[11px]">
                          {p.register_number || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-eventrix-black font-medium">
                            <Mail className="w-3.5 h-3.5 text-eventrix-muted shrink-0" />
                            <span className="truncate max-w-[180px]">{p.email}</span>
                          </div>
                          {p.mobile && (
                            <div className="flex items-center gap-1.5 text-eventrix-muted">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{p.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-eventrix-black truncate max-w-[200px]" title={p.college}>
                            {p.college || "N/A"}
                          </p>
                          <p className="text-eventrix-muted font-medium">
                            {p.department || "N/A"} {p.year_of_study ? `(${p.year_of_study} Yr${p.section ? ` - Sec ${p.section}` : ''})` : ''}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {events.length === 0 ? (
                          <span className="text-eventrix-muted text-[11px] italic">No sub-events booked</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {events.map((ev, idx) => (
                              <span 
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  ev.category === 'TECHNICAL' 
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {ev.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedParticipant(p)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-eventrix-lavender hover:text-eventrix-black uppercase tracking-wider transition-colors"
                        >
                          View <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-[#F8F8FC] border-t border-[#D9D9DF] flex justify-between items-center text-xs font-medium text-eventrix-muted">
          <span>Showing {filteredParticipants.length} of {participants.length} participants</span>
          <span>Verve26 Admin System</span>
        </div>
      </div>

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9D9DF] rounded-lg max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-eventrix-black text-eventrix-white p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-eventrix-lavender text-eventrix-black text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                    Participant Profile
                  </span>
                  <span className="text-xs font-mono text-eventrix-white/60">
                    Reg: {selectedParticipant.register_number || "N/A"}
                  </span>
                </div>
                <h2 className="font-anton text-2xl uppercase tracking-wide">
                  {selectedParticipant.full_name || "Unnamed Participant"}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedParticipant(null)}
                className="text-eventrix-white/70 hover:text-eventrix-white p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Contact & Personal details */}
              <div className="grid grid-cols-2 gap-4 bg-[#F8F8FC] p-4 rounded-md border border-[#D9D9DF] text-xs">
                <div>
                  <p className="text-eventrix-muted font-bold uppercase text-[10px] tracking-wider mb-1">Email Address</p>
                  <p className="font-semibold text-eventrix-black break-all">{selectedParticipant.email}</p>
                </div>
                <div>
                  <p className="text-eventrix-muted font-bold uppercase text-[10px] tracking-wider mb-1">Mobile Phone</p>
                  <p className="font-semibold text-eventrix-black">{selectedParticipant.mobile || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-eventrix-muted font-bold uppercase text-[10px] tracking-wider mb-1">College</p>
                  <p className="font-semibold text-eventrix-black">{selectedParticipant.college || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-eventrix-muted font-bold uppercase text-[10px] tracking-wider mb-1">Dept / Year / Sec</p>
                  <p className="font-semibold text-eventrix-black">
                    {selectedParticipant.department || "N/A"} 
                    {selectedParticipant.year_of_study ? ` (${selectedParticipant.year_of_study} Year)` : ''}
                    {selectedParticipant.section ? ` - Sec ${selectedParticipant.section}` : ''}
                  </p>
                </div>
              </div>

              {/* Registered Events Section */}
              <div>
                <h3 className="text-sm font-bold text-eventrix-black uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-eventrix-lavender" /> Registered Sub-Events
                </h3>

                {getParticipantEvents(selectedParticipant).length === 0 ? (
                  <p className="text-xs text-eventrix-muted italic bg-[#F8F8FC] p-4 rounded text-center">
                    This participant has not enrolled in any sub-events yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {getParticipantEvents(selectedParticipant).map((ev, i) => (
                      <div key={i} className="border border-[#D9D9DF] p-3 rounded-md flex items-center justify-between bg-white hover:border-eventrix-lavender transition-colors">
                        <div>
                          <p className="font-bold text-sm text-eventrix-black">{ev.title}</p>
                          <p className="text-xs text-eventrix-muted flex items-center gap-3 mt-1">
                            {ev.date && <span>📅 {ev.date}</span>}
                            {ev.time && <span>⏰ {ev.time}</span>}
                            {ev.location && <span>📍 {ev.location}</span>}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ev.category === 'TECHNICAL' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ev.category}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#F8F8FC] px-6 py-4 border-t border-[#D9D9DF] flex justify-end">
              <button
                onClick={() => setSelectedParticipant(null)}
                className="bg-eventrix-black text-eventrix-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-eventrix-lavender hover:text-eventrix-black transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
