import React from "react";
import { getFests, getSubEvents } from "@/actions/event.actions";
import { Calendar, Clock, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FestEventsPage({ params }: { params: Promise<{ festId: string }> }) {
  const { festId } = await params;
  const fests = await getFests();
  const fest = fests.find(f => f.id === festId);
  
  if (!fest) {
    notFound();
  }

  const events = await getSubEvents(fest.id);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      
      <div>
        <Link href="/events" className="inline-flex items-center gap-2 text-xs font-bold text-eventrix-muted uppercase tracking-widest hover:text-eventrix-black transition-colors mb-6">
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
          <Link href={`/events/${fest.id}/register`} className="bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] flex items-center gap-2">
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
            {events.filter(e => e.category === 'Technical').map(event => (
              <div key={event.id} className="border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black transition-colors">
                <span className="text-[10px] font-bold text-eventrix-lavender uppercase mb-2 block tracking-widest">{event.category} - {event.participation_type}</span>
                <h4 className="font-bold text-lg text-eventrix-black mb-1">{event.title}</h4>
                <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                </div>
              </div>
            ))}
            {events.filter(e => e.category === 'Technical').length === 0 && (
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
            {events.filter(e => e.category === 'Non-Technical').map(event => (
              <div key={event.id} className="border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black transition-colors">
                <span className="text-[10px] font-bold text-eventrix-lavender uppercase mb-2 block tracking-widest">{event.category} - {event.participation_type}</span>
                <h4 className="font-bold text-lg text-eventrix-black mb-1">{event.title}</h4>
                <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                </div>
              </div>
            ))}
            {events.filter(e => e.category === 'Non-Technical').length === 0 && (
              <p className="text-sm text-eventrix-muted">No non-technical events announced yet.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
