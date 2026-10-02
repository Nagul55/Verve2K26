import React from "react";
import { getParticipantRegistrations } from "@/actions/event.actions";
import { RegistrationTicket } from "@/components/RegistrationTicket";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default async function MyRegistrationsPage() {
  const registeredEvents = await getParticipantRegistrations();

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            My Registrations
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl">
            View all the events you have successfully registered for.
          </p>
        </div>
        <Link href="/events" className="bg-eventrix-black text-white px-6 py-3 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Browse More Events
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registeredEvents.length > 0 ? (
          registeredEvents.map((reg) => (
            <RegistrationTicket
              key={reg.id}
              number={reg.ticketNumber}
              category={reg.category}
              title={reg.title}
              date={reg.date}
              location={reg.location}
            />
          ))
        ) : (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-white">
            <p className="text-eventrix-muted font-bold mb-4 text-lg">You haven't registered for any events yet!</p>
            <p className="text-eventrix-muted text-sm max-w-md mx-auto mb-8">
              Head over to the Events page to see what's happening and secure your spot.
            </p>
            <Link href="/events" className="bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] inline-flex">
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
