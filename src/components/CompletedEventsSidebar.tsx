"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Users, ArrowRight, Award, ChevronDown, ChevronUp, MapPin, Calendar, Phone } from "lucide-react";

interface CompletedEventsSidebarProps {
  completedEvents: any[];
}

export function CompletedEventsSidebar({ completedEvents }: CompletedEventsSidebarProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (!completedEvents || completedEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-eventrix-white p-6 md:p-8 shadow-[0_0_0_1px_#D9D9DF] rounded-md">
      <div className="flex justify-between items-center mb-6 border-b border-[#D9D9DF] pb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-eventrix-black tracking-tight text-lg">Completed Events</h3>
        </div>
        <Link 
          href="/completed-events" 
          className="text-[9px] font-bold uppercase text-eventrix-lavender hover:text-eventrix-black transition-colors editorial-label flex items-center gap-1"
        >
          View All ({completedEvents.length}) <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {completedEvents.slice(0, 3).map((event) => {
          const isExpanded = expandedId === event.id;
          const isTeam = event.participation_type === 'Team' || !!event.teamDetails;
          const members = event.teamDetails?.members || [];

          return (
            <div 
              key={event.id}
              className="border border-[#D9D9DF] rounded-md bg-white overflow-hidden transition-all hover:border-eventrix-black"
            >
              {/* Event Header */}
              <div 
                onClick={() => toggleExpand(event.id)}
                className="p-3.5 cursor-pointer hover:bg-[#F8F8FC] transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-eventrix-lavender bg-[#F3F0FF] px-2 py-0.5 rounded-xs">
                    {event.category}
                  </span>
                  {event.hasParticipated ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Participated
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-xs">
                      Concluded
                    </span>
                  )}
                </div>

                <h4 className="font-anton text-base text-eventrix-black truncate mb-1">
                  {event.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-eventrix-muted">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-eventrix-lavender" />
                    <span>{event.date}</span>
                  </div>

                  {isTeam && event.teamDetails?.teamName && (
                    <div className="flex items-center gap-1 font-bold text-eventrix-black text-[10px]">
                      <Users className="w-3 h-3 text-eventrix-lavender" />
                      <span className="truncate max-w-[120px]">{event.teamDetails.teamName}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Details Dropdown */}
              {isTeam && isExpanded && (
                <div className="border-t border-[#E5E5EB] bg-[#F8F8FC] p-3 space-y-2 animate-in slide-in-from-top-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-eventrix-muted">
                      Team: <strong className="text-eventrix-black">{event.teamDetails?.teamName || 'Team'}</strong>
                    </span>
                    <span className="text-[9px] font-bold text-eventrix-lavender">
                      {members.length} Members
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {members.map((m: any, idx: number) => (
                      <div 
                        key={m.participantId || m.email || idx}
                        className="bg-white border border-[#E5E5EB] p-2 rounded-xs flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-eventrix-black truncate flex items-center gap-1">
                            {m.name || m.email}
                            {m.isLeader && (
                              <span className="bg-eventrix-black text-white text-[7px] font-black uppercase px-1 py-0.2 rounded-xs">
                                Leader
                              </span>
                            )}
                          </p>
                          {m.mobile && m.mobile !== 'N/A' && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5 text-gray-300" /> {m.mobile}
                            </p>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs shrink-0 ${
                          m.isLeader || m.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          {m.isLeader ? 'Leader' : m.status || 'Accepted'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 text-right">
                    <Link
                      href="/completed-events"
                      className="text-[10px] font-bold text-eventrix-lavender hover:underline inline-flex items-center gap-1"
                    >
                      Full Details <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
