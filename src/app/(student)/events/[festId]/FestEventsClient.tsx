"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { EventDetailsModal, SubEvent } from "@/components/EventDetailsModal";

interface FestEventsClientProps {
  fest: any;
  events: SubEvent[];
  initialRegisteredIds: string[];
  registrationCounts: Record<string, number>;
}

export function FestEventsClient({
  fest,
  events,
  initialRegisteredIds,
  registrationCounts,
}: FestEventsClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<SubEvent | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>(initialRegisteredIds);

  const handleRegisterSuccess = (eventId: string) => {
    if (!registeredIds.includes(eventId)) {
      setRegisteredIds((prev) => [...prev, eventId]);
    }
  };

  const techEvents = events.filter((e) => e.category === "Technical");
  const nonTechEvents = events.filter((e) => e.category === "Non-Technical");

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-eventrix-muted uppercase tracking-widest hover:text-eventrix-black transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fests
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
              {fest.name} Events
            </h1>
            <p className="text-eventrix-muted font-medium max-w-2xl">
              {fest.description}
            </p>
          </div>
          <Link
            href={`/events/${fest.id}/register`}
            className="bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] flex items-center gap-2"
          >
            Register Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Technical Events */}
        <section>
          <h2 className="text-xl font-bold text-eventrix-black mb-4 border-b border-[#D9D9DF] pb-2">
            Technical Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techEvents.map((event) => {
              const isReg = registeredIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">
                      {event.category} - {event.participation_type}
                    </span>
                    {isReg && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}
                    </div>
                  </div>
                </div>
              );
            })}
            {techEvents.length === 0 && (
              <p className="text-sm text-eventrix-muted">No technical events announced yet.</p>
            )}
          </div>
        </section>

        {/* Non-Technical Events */}
        <section>
          <h2 className="text-xl font-bold text-eventrix-black mb-4 border-b border-[#D9D9DF] pb-2">
            Non-Technical Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nonTechEvents.map((event) => {
              const isReg = registeredIds.includes(event.id);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black hover:shadow-md transition-all cursor-pointer relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">
                      {event.category} - {event.participation_type}
                    </span>
                    {isReg && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        <Check className="w-3 h-3" /> Registered
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}
                    </div>
                  </div>
                </div>
              );
            })}
            {nonTechEvents.length === 0 && (
              <p className="text-sm text-eventrix-muted">No non-technical events announced yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          festId={fest.id}
          isRegistered={registeredIds.includes(selectedEvent.id)}
          registeredCount={registrationCounts[selectedEvent.id] || 0}
          onClose={() => setSelectedEvent(null)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </div>
  );
}
