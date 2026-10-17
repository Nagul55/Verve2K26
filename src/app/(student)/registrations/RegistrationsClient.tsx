"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, Clock, Users, Award } from "lucide-react";
import { RegistrationEventCard } from "./RegistrationEventCard";

export function RegistrationsClient({ festsMap }: { festsMap: Record<string, any[]> }) {
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [expandedFest, setExpandedFest] = useState<string | null>(null);
  const [expandedRegistrationId, setExpandedRegistrationId] = useState<string | null>(null);

  const toggleFest = (festName: string) => {
    setExpandedFest(expandedFest === festName ? null : festName);
  };

  // Calculate global counts across all fests
  const allEvents = Object.values(festsMap).flat();
  const totalCompleted = allEvents.filter(e => e.isCompletedEvent || e.isOver).length;
  const totalUpcoming = allEvents.filter(e => !e.isOver).length;

  return (
    <div className="space-y-8">
      {/* Top Filter Buttons */}
      <div className="flex items-center gap-2 border-b border-[#E5E5EB] pb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-eventrix-black text-white shadow-xs'
              : 'bg-white border border-[#D9D9DF] text-eventrix-muted hover:bg-gray-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All Registrations ({allEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('UPCOMING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'UPCOMING'
              ? 'bg-eventrix-black text-white shadow-xs'
              : 'bg-white border border-[#D9D9DF] text-eventrix-muted hover:bg-gray-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Live & Upcoming ({totalUpcoming})
        </button>

        <button
          type="button"
          onClick={() => setFilter('COMPLETED')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            filter === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed Events ({totalCompleted})
        </button>
      </div>

      {Object.entries(festsMap).map(([festName, events]) => {
        // Filter events under this fest based on selected tab
        const filteredEvents = events.filter(e => {
          if (filter === 'COMPLETED') return e.isCompletedEvent || e.isOver;
          if (filter === 'UPCOMING') return !e.isOver;
          return true;
        });

        // If this fest has no events matching the active filter, skip it
        if (filteredEvents.length === 0 && filter !== 'ALL') {
          return null;
        }

        const isExpanded = expandedFest === festName || filter !== 'ALL';
        const techCount = events.filter(e => e.category === 'Technical').length;
        const nonTechCount = events.filter(e => e.category === 'Non-Technical').length;
        const completedCount = events.filter(e => e.isCompletedEvent).length;

        return (
          <div key={festName} className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* FEST CARD */}
            <div 
              onClick={() => toggleFest(festName)}
              className={`border-2 rounded-xl overflow-hidden bg-white transition-all duration-300 relative cursor-pointer shadow-sm group ${isExpanded ? 'border-[#A98BFF] ring-4 ring-[#A98BFF]/20' : 'border-[#D9D9DF] hover:border-eventrix-black hover:shadow-xl hover:-translate-y-1'}`}
            >
              <div className="h-48 md:h-56 relative overflow-hidden bg-eventrix-purple">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-eventrix-black/90 via-eventrix-black/40 to-transparent"></div>
                
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {completedCount > 0 && (
                    <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> {completedCount} Completed
                    </div>
                  )}
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> {events.length} Registered
                  </div>
                </div>

                <div className="absolute bottom-6 left-6">
                  <h3 className="font-anton text-4xl text-white tracking-wide uppercase drop-shadow-md">{festName}</h3>
                </div>
              </div>

              <div className="p-6 flex items-end justify-between bg-white relative">
                <div>
                  <p className="text-sm text-eventrix-muted font-medium mb-4">
                    Showing {filteredEvents.length} {filter === 'COMPLETED' ? 'completed' : filter === 'UPCOMING' ? 'upcoming' : ''} events in this fest.
                  </p>
                  
                  <div className="border-t border-[#D9D9DF] pt-4 w-full flex items-center gap-2 flex-wrap">
                    <span className="inline-block bg-[#F8F8FC] text-eventrix-black font-bold text-xs px-3 py-1.5 rounded-md border border-[#E5E5EB]">
                      {techCount} Tech / {nonTechCount} Non-Tech
                    </span>
                    {completedCount > 0 && (
                      <span className="inline-block bg-emerald-50 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-md border border-emerald-200">
                        {completedCount} Participated
                      </span>
                    )}
                  </div>
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(8,10,18,1)] ${isExpanded ? 'bg-[#A98BFF] text-white' : 'bg-eventrix-black text-white group-hover:bg-[#A98BFF] group-hover:text-eventrix-black'}`}>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* EXPANDED EVENTS GRID */}
            {isExpanded && (
              <div className="pl-0 md:pl-8 border-l-0 md:border-l-4 border-[#A98BFF]/30 space-y-4 animate-in slide-in-from-top-4 fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  {filteredEvents.map((reg, index) => (
                    <RegistrationEventCard
                      key={reg.id}
                      number={String(index + 1).padStart(2, '0')}
                      category={reg.category}
                      title={reg.title}
                      date={reg.date}
                      location={reg.location}
                      participationType={reg.participation_type}
                      teamDetails={reg.teamDetails}
                      whatsapp_group_link={reg.whatsapp_group_link}
                      isExpanded={expandedRegistrationId === reg.id}
                      onToggleExpand={() => setExpandedRegistrationId(expandedRegistrationId === reg.id ? null : reg.id)}
                      isCompletedEvent={reg.isCompletedEvent}
                      isOver={reg.isOver}
                      hasParticipated={reg.hasParticipated}
                      attendanceStatus={reg.attendanceStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allEvents.length > 0 && filter === 'COMPLETED' && totalCompleted === 0 && (
        <div className="p-16 text-center border-2 border-dashed border-emerald-200 bg-emerald-50/20 rounded-md">
          <Award className="w-10 h-10 text-emerald-600 mx-auto mb-3 opacity-80" />
          <h4 className="text-eventrix-black font-anton text-2xl uppercase tracking-wide mb-2">No Completed Events Yet</h4>
          <p className="text-sm text-eventrix-muted max-w-md mx-auto mb-6">
            When you attend an event and the coordinator scans your ticket or records your participation, the event will appear here once it concludes.
          </p>
          <button
            onClick={() => setFilter('ALL')}
            className="bg-eventrix-black text-white px-6 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-colors"
          >
            View All Registrations
          </button>
        </div>
      )}
    </div>
  );
}
