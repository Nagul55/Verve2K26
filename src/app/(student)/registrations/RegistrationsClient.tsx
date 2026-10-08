"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { RegistrationEventCard } from "./RegistrationEventCard";

export function RegistrationsClient({ festsMap }: { festsMap: Record<string, any[]> }) {
  const [expandedFest, setExpandedFest] = useState<string | null>(null);
  const [expandedRegistrationId, setExpandedRegistrationId] = useState<string | null>(null);

  const toggleFest = (festName: string) => {
    setExpandedFest(expandedFest === festName ? null : festName);
  };

  return (
    <div className="space-y-8">
      {Object.entries(festsMap).map(([festName, events]) => {
        const isExpanded = expandedFest === festName;
        const techCount = events.filter(e => e.category === 'Technical').length;
        const nonTechCount = events.filter(e => e.category === 'Non-Technical').length;

        return (
          <div key={festName} className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* FEST CARD */}
            <div 
              onClick={() => toggleFest(festName)}
              className={`border-2 rounded-xl overflow-hidden bg-white transition-all duration-300 relative cursor-pointer shadow-sm group ${isExpanded ? 'border-[#A98BFF] ring-4 ring-[#A98BFF]/20' : 'border-[#D9D9DF] hover:border-eventrix-black hover:shadow-xl hover:-translate-y-1'}`}
            >
              <div className="h-56 relative overflow-hidden bg-eventrix-purple">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:20px_20px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-eventrix-black/90 via-eventrix-black/40 to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Registered
                </div>

                <div className="absolute bottom-6 left-6">
                  <h3 className="font-anton text-4xl text-white tracking-wide uppercase drop-shadow-md">{festName}</h3>
                </div>
              </div>

              <div className="p-6 flex items-end justify-between bg-white relative">
                <div>
                  <p className="text-sm text-eventrix-muted font-medium mb-6">
                    You are registered for {events.length} events in this fest.
                  </p>
                  
                  <div className="border-t border-[#D9D9DF] pt-4 w-full">
                    <span className="text-[10px] font-bold text-eventrix-lavender tracking-widest uppercase block mb-2">Registration Summary</span>
                    <span className="inline-block bg-[#F8F8FC] text-eventrix-black font-bold text-xs px-3 py-1.5 rounded-md">
                      {techCount} Tech / {nonTechCount} Non-Tech
                    </span>
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
                  {events.map((reg, index) => (
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
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
