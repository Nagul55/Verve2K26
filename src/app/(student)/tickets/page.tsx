import React from "react";
import { getParticipantRegistrations } from "@/actions/event.actions";
import { createClient } from "@/lib/supabase/server";
import { EventrixLogo } from "@/components/EventrixLogo";
import { Calendar, MapPin, Users, ShieldCheck, Lightbulb } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { TicketsClient } from "./TicketsClient";
import Link from "next/link";

export default async function TicketsPage() {
  const registrations = await getParticipantRegistrations();
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let participant = null;
  if (user) {
    const { data } = await supabase.from('participants').select('*').eq('participant_id', user.id).single();
    participant = data;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 bg-[#F4F4F9] min-h-screen p-4 md:p-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            My Tickets
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl">
            Here are your beautifully generated digital tickets for upcoming events.
          </p>
        </div>
        <Link href="/registrations" className="bg-white border border-[#D9D9DF] text-eventrix-black px-6 py-3 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2">
          ← Back to Registrations
        </Link>
      </div>
      
      {registrations.length === 0 ? (
        <div className="col-span-full p-20 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-white">
          <p className="text-eventrix-muted font-bold mb-4 text-lg">No tickets found.</p>
          <p className="text-eventrix-muted text-sm max-w-md mx-auto mb-8">
            Register for an event first to see your beautifully generated digital tickets.
          </p>
          <Link href="/events" className="bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] inline-flex">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="pb-16">
          <TicketsClient registrations={registrations} participant={participant} />
        </div>
      )}
    </div>
  )
}
