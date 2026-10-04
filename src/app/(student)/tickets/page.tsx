import React from "react";
import { getParticipantRegistrations } from "@/actions/event.actions";
import { createClient } from "@/lib/supabase/server";
import { EventrixLogo } from "@/components/EventrixLogo";
import { Calendar, MapPin, Users, ShieldCheck, Lightbulb } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

function TicketCard({ reg, participant }: { reg: any, participant: any }) {
  const isTech = reg.category === 'Technical';
  return (
    <div className="w-full flex flex-col lg:flex-row rounded-[2rem] shadow-2xl overflow-hidden bg-white min-h-[400px]">
      
      {/* LEFT SECTION (White side) */}
      <div className="flex-[7] bg-white relative p-6 md:p-10 flex flex-col justify-between overflow-hidden lg:border-r-[3px] lg:border-dashed lg:border-gray-300">
        
        {/* Background Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start relative z-10 gap-4 sm:gap-0">
          <div>
            <EventrixLogo fill="#3A1C71" className="w-48 h-auto mb-2" />
            <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 max-w-[200px] leading-relaxed">
              COLLEGE EVENT REGISTRATION AND MANAGEMENT PLATFORM
            </p>
          </div>
          <div className="text-left sm:text-right flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1 text-[10px] font-bold text-gray-500 tracking-[0.15em] sm:border-r-2 sm:border-[#3A1C71] sm:pr-3">
             <p>IDEAS</p>
             <p>PEOPLE</p>
             <p>EXPERIENCES</p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="mt-8 md:mt-12 relative z-10 flex justify-between items-center">
           <div>
             <span className="inline-block bg-purple-100 text-[#3A1C71] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
               {reg.category} Event
             </span>
             <h2 className="font-anton text-5xl md:text-7xl uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#1E1A3D] via-[#3A1C71] to-[#8C62FF] tracking-tight mb-2">
               {reg.title}
             </h2>
             <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">
               Test your {isTech ? 'tech knowledge' : 'skills'}
             </p>
           </div>
           {/* Lightbulb 3D Icon */}
           <div className="hidden sm:block w-32 h-32 md:w-48 md:h-48 relative animate-pulse shrink-0">
              <img src="/images/bulb_3d.jpg" alt="3D Bulb" className="w-full h-full object-contain mix-blend-multiply" />
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-10 md:mt-12 mb-8 relative z-10 border-b sm:border-b-0 border-gray-100 pb-6 sm:pb-0">
          <div className="flex gap-4 items-start">
             <Calendar className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Date</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap">{reg.date}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">{reg.time}</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <MapPin className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Venue</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap truncate">{reg.location}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">Sona College</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <Users className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">Event Type</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap">{reg.category}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">{reg.participation_type || 'Individual'}</p>
             </div>
          </div>
        </div>

        {/* Participant Inset */}
        <div className="bg-[#F8F9FC] rounded-2xl p-5 md:p-6 grid grid-cols-2 md:flex justify-between items-center relative z-10 border border-gray-100 shadow-sm gap-4 md:gap-0">
           <div className="col-span-2 md:col-span-1">
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Participant Name</p>
             <p className="font-bold text-lg md:text-xl text-[#1E1A3D] truncate">{participant?.full_name || 'Anonymous'}</p>
           </div>
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Register Number</p>
             <p className="font-bold text-sm text-[#1E1A3D] truncate">{participant?.register_number || 'N/A'}</p>
           </div>
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Department</p>
             <p className="font-bold text-sm text-[#1E1A3D] truncate max-w-[150px]">{participant?.department || 'N/A'}</p>
           </div>
           <div className="hidden md:block">
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Year</p>
             <p className="font-bold text-sm text-[#1E1A3D]">{participant?.year_of_study || 'N/A'}</p>
           </div>
        </div>

        {/* Bottom Silhouette & Script */}
        <div className="hidden md:block absolute bottom-0 left-0 w-full h-32 z-0 overflow-hidden rounded-bl-[2rem]">
          <img src="/images/building_silhouette.jpg" alt="Building Silhouette" className="w-full h-full object-cover mix-blend-multiply opacity-70 object-bottom" />
          <div className="absolute bottom-6 left-10 transform -rotate-6">
            <p className="font-serif italic text-2xl text-white drop-shadow-md leading-none">More Than</p>
            <p className="font-serif italic text-3xl text-white font-bold ml-6 drop-shadow-md leading-none mt-1">Just Events</p>
          </div>
          <div className="absolute bottom-6 right-10 text-right">
             <p className="text-[8px] font-bold tracking-[0.2em] text-white/70 uppercase">Different People</p>
             <p className="text-[8px] font-bold tracking-[0.2em] text-white/70 uppercase mt-0.5">Same Passion</p>
             <div className="w-8 h-0.5 bg-white/50 ml-auto mt-1.5"></div>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION (Dark side) */}
      <div className="flex-[3] bg-gradient-to-b from-[#110B24] via-[#2A115E] to-[#4A1DFF] p-10 flex flex-col items-center justify-between relative overflow-hidden text-white">
         
         {/* Semi-circle cutouts to mimic perforations (desktop only) */}
         <div className="hidden lg:block absolute top-[-15px] left-[-15px] w-8 h-8 bg-[#F4F4F9] rounded-full shadow-inner"></div>
         <div className="hidden lg:block absolute bottom-[-15px] left-[-15px] w-8 h-8 bg-[#F4F4F9] rounded-full shadow-inner"></div>

         <div className="w-full flex flex-col items-center relative z-10">
            <EventrixLogo fill="#FFFFFF" className="w-40 h-auto mb-6" />
            <p className="font-bold tracking-[0.3em] text-xs mb-10 text-white/90 uppercase">Event Ticket</p>
            
            {/* QR Code Block */}
            <div className="bg-white p-4 rounded-2xl shadow-xl w-full flex flex-col items-center mb-10">
               <div className="w-full aspect-square bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-2">
                 <QRCodeSVG value={JSON.stringify({ pid: participant?.participant_id || '', event_id: reg.sub_event_id })} className="w-full h-full" level="H" />
               </div>
               <div className="mt-4 bg-purple-100 text-[#3A1C71] px-4 py-2 rounded-full font-bold text-xs tracking-widest text-center w-full truncate">
                 {reg.ticketNumber}
               </div>
               <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-3">Scan at entry</p>
            </div>
         </div>

         <div className="w-full border-t border-white/20 pt-6 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
               <div className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
               </div>
               <div>
                  <p className="text-[9px] text-white/60 font-bold tracking-widest uppercase mb-1">Valid For</p>
                  <p className="font-bold text-sm tracking-wider uppercase truncate max-w-[150px]">{reg.title}</p>
               </div>
            </div>
            {/* NO BARCODE - as requested */}
            <p className="text-center text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase mt-4">
              {reg.ticketNumber}
            </p>
         </div>

      </div>

    </div>
  )
}

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
        <div className="space-y-10 pb-16">
          {registrations.map(reg => (
             <TicketCard key={reg.id} reg={reg} participant={participant} />
          ))}
        </div>
      )}
    </div>
  )
}
