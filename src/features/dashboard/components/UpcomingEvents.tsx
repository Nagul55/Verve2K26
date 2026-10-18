import React from "react";
import { MapPin, Clock, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { isEventOver } from "@/lib/utils/event-status";

export function UpcomingEvents({ events }: { events: any[] }) {
  // Filter ONLY events that are NOT over (events that are over are not live or upcoming)
  const upcomingEvents = (events || []).filter(e => !isEventOver(e));
  const displayEvents = upcomingEvents.slice(0, 4);

  return (
    <section className="bg-eventrix-white p-6 md:p-8 shadow-[0_0_0_1px_#D9D9DF] rounded-md">
      <div className="flex justify-between items-center mb-6 border-b border-[#D9D9DF] pb-4">
        <h3 className="font-bold text-eventrix-black tracking-tight text-lg">Upcoming Events</h3>
        <Link href="/events" className="text-[9px] font-bold uppercase text-eventrix-lavender hover:text-eventrix-black transition-colors editorial-label flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {displayEvents.length > 0 ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-12 before:-translate-x-px before:h-full before:w-[1px] before:bg-[#D9D9DF]">
          {displayEvents.map((event) => {
            const d = new Date(event.date);
            const day = isNaN(d.getTime()) ? "--" : d.getDate().toString();
            const month = isNaN(d.getTime()) ? "---" : d.toLocaleString('default', { month: 'short' }).toUpperCase();
            
            return (
              <div key={event.id} className="relative flex items-center group">
                <div className="w-12 flex flex-col items-start pt-1 shrink-0">
                  <span className="block text-xl font-anton text-eventrix-black leading-none">{day}</span>
                  <span className="block text-[9px] font-bold uppercase text-eventrix-muted mt-1 editorial-label">{month}</span>
                </div>
                <div className="absolute left-12 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-eventrix-lavender z-20"></div>
                
                <div className="ml-8 flex-1 flex flex-col justify-center border-b border-[#D9D9DF] pb-4 group-last:border-0 group-last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-eventrix-black mb-1.5">{event.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-eventrix-muted whitespace-nowrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-eventrix-lavender" /> {event.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-eventrix-lavender" /> {event.time}</span>
                      </div>
                    </div>
                    <Link href="/events" className="w-8 h-8 rounded-sm border border-[#D9D9DE] flex items-center justify-center group-hover:border-eventrix-black transition-colors shrink-0 cursor-pointer">
                      <ArrowRight className="w-3 h-3 text-eventrix-muted group-hover:text-eventrix-black transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
          <Calendar className="w-6 h-6 text-eventrix-muted mx-auto mb-2 opacity-60" />
          <p className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">
            No Upcoming Events
          </p>
          <p className="text-[11px] text-eventrix-muted">
            All active fest events have completed. Check back for upcoming events!
          </p>
        </div>
      )}
    </section>
  );
}
