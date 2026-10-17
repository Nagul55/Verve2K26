"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  Award, 
  Phone, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ShieldCheck,
  FileText,
  Sparkles
} from "lucide-react";

interface CompletedEventsClientProps {
  completedEvents: any[];
  user: any;
}

export function CompletedEventsClient({ completedEvents, user }: CompletedEventsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTeamId(prev => (prev === id ? null : id));
  };

  // Filter events by search and category
  const filteredEvents = completedEvents.filter((event) => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.festName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.teamDetails?.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.teamDetails?.members?.some((m: any) => m.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = 
      categoryFilter === "ALL" || 
      (categoryFilter === "TEAM" && (event.participation_type === "Team" || !!event.teamDetails)) ||
      (categoryFilter === "INDIVIDUAL" && event.participation_type !== "Team" && !event.teamDetails) ||
      event.category?.toUpperCase() === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const participatedCount = completedEvents.filter(e => e.hasParticipated).length;
  const teamEventsCount = completedEvents.filter(e => e.participation_type === 'Team' || !!e.teamDetails).length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-white border-2 border-eventrix-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(8,10,18,1)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-widest border border-emerald-300">
                Official Records
              </span>
              <span className="text-eventrix-muted text-xs font-bold uppercase tracking-wider">
                • Verified Participation History
              </span>
            </div>
            <h1 className="font-anton text-3xl sm:text-5xl uppercase tracking-wider text-eventrix-black leading-none">
              Completed Events & Teams
            </h1>
            <p className="text-eventrix-muted font-medium text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Explore your past festival events, registered teams, fellow teammates, and attendance status.
            </p>
          </div>

          {/* Stat Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#F8F8FC] border border-[#D9D9DF] p-3 rounded-md text-center min-w-[90px]">
              <span className="block font-anton text-2xl text-eventrix-black leading-none">{completedEvents.length}</span>
              <span className="text-[9px] font-bold uppercase text-eventrix-muted tracking-wider">Completed</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md text-center min-w-[90px]">
              <span className="block font-anton text-2xl text-emerald-700 leading-none">{participatedCount}</span>
              <span className="text-[9px] font-bold uppercase text-emerald-700 tracking-wider">Attended</span>
            </div>
            <div className="bg-[#F3F0FF] border border-[#A98BFF]/30 p-3 rounded-md text-center min-w-[90px]">
              <span className="block font-anton text-2xl text-eventrix-black leading-none">{teamEventsCount}</span>
              <span className="text-[9px] font-bold uppercase text-eventrix-lavender tracking-wider">Team Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-eventrix-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event, team name, or member..."
            className="w-full bg-white border border-[#D9D9DF] pl-10 pr-4 py-2.5 rounded-md text-xs font-medium focus:outline-none focus:border-eventrix-black transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All Completed", value: "ALL" },
            { label: "Team Events", value: "TEAM" },
            { label: "Technical", value: "TECHNICAL" },
            { label: "Non-Technical", value: "NON-TECHNICAL" },
          ].map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => setCategoryFilter(pill.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === pill.value
                  ? "bg-eventrix-black text-white shadow-xs"
                  : "bg-white border border-[#D9D9DF] text-eventrix-muted hover:bg-gray-100"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => {
            const isTeam = event.participation_type === "Team" || !!event.teamDetails;
            const isExpanded = expandedTeamId === event.id || true; // Expanded by default to show team details
            const members = event.teamDetails?.members || [];
            const isAttended = event.hasParticipated;

            return (
              <div
                key={event.id || index}
                className="bg-white border-2 border-eventrix-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(8,10,18,1)] transition-all"
              >
                {/* Event Card Header */}
                <div className="p-6 border-b border-[#E5E5EB] bg-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[#F3F0FF] text-eventrix-lavender px-2.5 py-0.5 rounded border border-[#A98BFF]/20">
                          {event.festName || "Fest"} • {event.category}
                        </span>

                        {isTeam ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded border border-purple-200">
                            <Users className="w-3 h-3" /> Team Event
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded border border-gray-200">
                            Individual
                          </span>
                        )}

                        {isAttended ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed & Participated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded border border-gray-200">
                            Event Concluded
                          </span>
                        )}
                      </div>

                      <h2 className="font-anton text-2xl sm:text-3xl text-eventrix-black uppercase tracking-wide">
                        {event.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-eventrix-muted font-medium mt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-eventrix-lavender shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-eventrix-lavender shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-eventrix-lavender shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        {event.ticketNumber && (
                          <span className="font-mono text-[11px] text-gray-500 bg-[#F8F8FC] px-2 py-0.5 rounded border border-[#E5E5EB]">
                            {event.ticketNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      {isAttended && (
                        <Link
                          href="/certificates"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Award className="w-3.5 h-3.5" /> View Certificate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Details Section */}
                {isTeam ? (
                  <div className="bg-[#FAF9FF] p-6 border-t border-[#E5E5EB]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-[#E5E5EB]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-eventrix-black text-white flex items-center justify-center font-bold text-xs">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-eventrix-muted block">Registered Team</span>
                          <h4 className="font-anton text-lg text-eventrix-black tracking-wide">
                            {event.teamDetails?.teamName || "Team"}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-eventrix-lavender bg-white border border-[#A98BFF]/30 px-2.5 py-1 rounded">
                          {members.length} Total Members
                        </span>
                        {event.teamDetails?.isLeader && (
                          <span className="text-[10px] font-black uppercase tracking-wider bg-eventrix-black text-white px-2 py-1 rounded">
                            You are Team Leader
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Members List */}
                    {members.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {members.map((m: any, mIdx: number) => (
                          <div
                            key={m.participantId || m.email || mIdx}
                            className={`p-3.5 rounded-md border transition-all ${
                              m.isLeader 
                                ? "bg-white border-eventrix-black shadow-[2px_2px_0px_0px_rgba(8,10,18,1)]" 
                                : "bg-white border-[#D9D9DF]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#F0E6FF] text-eventrix-lavender font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                #{mIdx + 1}
                              </span>

                              {m.isLeader ? (
                                <span className="bg-eventrix-black text-white text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                                  Team Leader
                                </span>
                              ) : (
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                                  m.status === "Accepted"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  {m.status || "Member"}
                                </span>
                              )}
                            </div>

                            <p className="font-bold text-sm text-eventrix-black truncate">
                              {m.name || "Participant"}
                            </p>
                            <p className="text-[11px] text-eventrix-muted truncate font-medium">
                              {m.email}
                            </p>

                            {m.mobile && m.mobile !== "N/A" && (
                              <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1 mt-1 pt-1 border-t border-gray-100">
                                <Phone className="w-3 h-3 text-eventrix-lavender shrink-0" />
                                {m.mobile}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-white border border-dashed border-[#D9D9DF] rounded-md text-center text-xs text-eventrix-muted font-medium">
                        Team details are recorded for this event.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#F8F8FC] p-4 border-t border-[#E5E5EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-eventrix-black">
                        Individual Participation Verified
                      </span>
                    </div>
                    <span className="text-xs text-eventrix-muted">
                      Registered as {user?.email || "Student"}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
            <Award className="w-12 h-12 text-eventrix-muted mx-auto mb-3 opacity-60" />
            <h3 className="font-anton text-2xl uppercase tracking-wide text-eventrix-black mb-1">
              No Completed Events Found
            </h3>
            <p className="text-xs text-eventrix-muted max-w-md mx-auto mb-6">
              {searchTerm || categoryFilter !== "ALL"
                ? "No completed events matched your filter. Try clearing your search query."
                : "You don't have any concluded events yet. Once an event concludes and your attendance is recorded, full event and team details will appear here."}
            </p>
            <Link
              href="/events"
              className="bg-eventrix-black text-white px-6 py-2.5 rounded-md text-xs uppercase font-bold tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors inline-block"
            >
              Explore Available Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
