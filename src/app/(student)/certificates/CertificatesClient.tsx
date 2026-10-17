"use client";

import React, { useState, useRef } from "react";
import { Award, Download, Calendar, MapPin, CheckCircle2, ShieldCheck, Eye, X, Printer } from "lucide-react";
import { EventrixLogo } from "@/components/EventrixLogo";
import Link from "next/link";

interface CertificatesClientProps {
  completedEvents: any[];
  participant: {
    name: string;
    registerNumber: string;
    department: string;
    college: string;
  };
}

export function CertificatesClient({ completedEvents, participant }: CertificatesClientProps) {
  const [activeModalEvent, setActiveModalEvent] = useState<any | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (completedEvents.length === 0) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-[#D9D9DF] rounded-xl bg-white max-w-3xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-purple-50 text-eventrix-lavender rounded-full flex items-center justify-center mx-auto border border-purple-200">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="font-anton text-2xl text-eventrix-black uppercase tracking-wide">
          No Participation Certificates Yet
        </h3>
        <p className="text-sm text-eventrix-muted max-w-md mx-auto">
          Certificates are automatically generated and awarded here once an event concludes and your attendance/participation has been verified by the coordinator.
        </p>
        <div className="pt-2">
          <Link
            href="/events"
            className="inline-block bg-eventrix-black text-white px-6 py-3 rounded-md text-xs font-bold tracking-wider uppercase hover:bg-eventrix-lavender hover:text-black transition-colors"
          >
            Explore Events & Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-[#D9D9DF] rounded-xl overflow-hidden hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between"
          >
            {/* Header / Graphic banner */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-b border-[#E5E5EB] relative">
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed & Verified
              </span>
              <h3 className="font-anton text-2xl uppercase tracking-wide text-eventrix-black mb-1 line-clamp-1">
                {event.title}
              </h3>
              <p className="text-xs font-bold text-eventrix-lavender uppercase tracking-wider">
                {event.festName || 'Fest'} • {event.category}
              </p>
            </div>

            {/* Event Info */}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2 text-xs text-eventrix-muted font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-eventrix-lavender" />
                  <span>Concluded: <strong className="text-eventrix-black">{event.date}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-eventrix-lavender" />
                  <span>Venue: <strong className="text-eventrix-black">{event.location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Participant: <strong className="text-eventrix-black">{participant.name}</strong></span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5EB] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalEvent(event)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-eventrix-black text-white hover:bg-eventrix-lavender hover:text-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> View Certificate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-[#D9D9DF] relative max-h-[95vh] flex flex-col">
            
            {/* Modal Actions Bar */}
            <div className="p-4 bg-gray-50 border-b border-[#D9D9DF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs uppercase tracking-widest text-eventrix-black">
                  Certificate of Participation
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#D9D9DF] hover:bg-gray-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalEvent(null)}
                  className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Certificate Canvas / Template */}
            <div className="p-8 overflow-y-auto flex-1 flex items-center justify-center bg-gray-100">
              <div className="bg-white w-full max-w-3xl p-10 md:p-14 border-8 border-double border-eventrix-black rounded-lg shadow-md text-center relative overflow-hidden">
                {/* Decorative corners */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-emerald-600"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-emerald-600"></div>
                <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-emerald-600"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-emerald-600"></div>

                <div className="flex justify-center mb-4">
                  <EventrixLogo fill="#1E1A3D" className="w-36 h-auto" />
                </div>

                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-eventrix-muted mb-2">
                  Sona College of Technology • {activeModalEvent.festName || 'Festival'}
                </p>

                <h2 className="font-anton text-4xl text-eventrix-black uppercase tracking-wide mb-6">
                  Certificate of Participation
                </h2>

                <p className="text-xs uppercase tracking-widest text-eventrix-muted mb-3 font-semibold">
                  This is proudly presented to
                </p>

                <h3 className="font-anton text-3xl text-emerald-800 uppercase tracking-wide border-b-2 border-emerald-700/30 inline-block pb-1 px-8 mb-4">
                  {participant.name}
                </h3>

                <p className="text-xs text-eventrix-muted font-medium mb-4 max-w-lg mx-auto leading-relaxed">
                  Reg No: <strong className="text-eventrix-black">{participant.registerNumber}</strong> • Dept of{' '}
                  <strong className="text-eventrix-black">{participant.department}</strong>
                </p>

                <p className="text-sm text-eventrix-black max-w-xl mx-auto leading-relaxed mb-8">
                  For actively participating in the sub-event <strong className="text-emerald-700 font-bold uppercase">"{activeModalEvent.title}"</strong> ({activeModalEvent.category}) organized during the festival at {activeModalEvent.location || 'Sona College of Technology'}.
                </p>

                <div className="flex justify-between items-end pt-8 border-t border-gray-200 text-xs">
                  <div className="text-left">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Event Date</p>
                    <p className="font-bold text-eventrix-black">{activeModalEvent.date}</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-600 text-emerald-700 flex items-center justify-center mb-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-800">Verified Attendance</span>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Event Coordinator</p>
                    <p className="font-bold text-eventrix-black">{activeModalEvent.coordinatorNames?.[0] || 'Faculty Coordinator'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
