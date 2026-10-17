"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Users, ArrowRight, Award } from "lucide-react";
import { RegistrationTicket } from "./RegistrationTicket";

interface DashboardRegistrationsProps {
  registeredEvents: any[];
}

export function DashboardRegistrations({ registeredEvents }: DashboardRegistrationsProps) {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'ALL'>('UPCOMING');

  const completedEvents = registeredEvents.filter((e) => e.isCompletedEvent || e.isOver);
  const upcomingEvents = registeredEvents.filter((e) => !e.isOver);

  const displayedEvents =
    activeTab === 'COMPLETED'
      ? completedEvents
      : activeTab === 'UPCOMING'
      ? upcomingEvents
      : registeredEvents;

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 mt-12">
        <div>
          <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">
            My Registrations <span className="font-normal text-eventrix-black">→</span>
          </h2>
          <p className="text-xs text-eventrix-muted font-medium mt-1">
            Track your registered events, live participation, and completed activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/registrations"
            className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap"
          >
            Full View →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#E5E5EB] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('UPCOMING')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'UPCOMING'
              ? 'bg-eventrix-black text-white shadow-xs'
              : 'bg-[#F8F8FC] text-eventrix-muted hover:bg-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Live & Upcoming ({upcomingEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed Events ({completedEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-eventrix-black text-white shadow-xs'
              : 'bg-[#F8F8FC] text-eventrix-muted hover:bg-gray-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All ({registeredEvents.length})
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((reg, index) => (
            <RegistrationTicket
              key={reg.id ? `${reg.id}-${index}` : index}
              number={String(index + 1).padStart(2, '0')}
              category={reg.category}
              title={reg.title}
              date={reg.date}
              location={reg.location}
              isCompletedEvent={reg.isCompletedEvent}
              isOver={reg.isOver}
              hasParticipated={reg.hasParticipated}
              attendanceStatus={reg.attendanceStatus}
            />
          ))
        ) : activeTab === 'COMPLETED' ? (
          <div className="col-span-2 p-10 text-center border border-dashed border-emerald-200 bg-emerald-50/20 rounded-md">
            <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-eventrix-black font-bold mb-1 text-sm">No completed events yet</p>
            <p className="text-xs text-eventrix-muted max-w-md mx-auto mb-4">
              Events will be added here once they conclude and your attendance/participation is verified.
            </p>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className="text-xs font-bold text-emerald-700 underline uppercase tracking-wider hover:text-emerald-900"
            >
              View Upcoming Events →
            </button>
          </div>
        ) : activeTab === 'UPCOMING' ? (
          <div className="col-span-2 p-10 text-center border border-dashed border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
            <Clock className="w-8 h-8 text-eventrix-muted mx-auto mb-2 opacity-60" />
            <p className="text-eventrix-black font-bold mb-1 text-sm">No upcoming registered events</p>
            <p className="text-xs text-eventrix-muted max-w-md mx-auto mb-4">
              All your registered events have concluded. Explore upcoming fests and register for new events!
            </p>
            <Link
              href="/events"
              className="bg-eventrix-black text-white px-6 py-2.5 rounded-md text-xs uppercase font-bold tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors inline-block"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="col-span-2 p-10 text-center border border-dashed border-[#D9D9DF] rounded-md">
            <p className="text-eventrix-muted font-bold mb-4">You haven't registered for any events yet!</p>
            <Link
              href="/events"
              className="bg-eventrix-black text-white px-6 py-3 rounded-md text-xs uppercase font-bold tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors inline-block"
            >
              Register Now
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
