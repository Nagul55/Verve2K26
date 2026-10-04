"use client";

import React, { useState, useRef, useEffect } from "react";
import { EventrixLogo } from "@/components/EventrixLogo";
import { Calendar, MapPin, Users, ShieldCheck, Download, Eye, X, RotateCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";

function TicketCard({ reg, participant, ticketRef }: { reg: any, participant: any, ticketRef?: React.RefObject<HTMLDivElement | null> }) {
  const isTech = reg.category === 'Technical';
  return (
    <div ref={ticketRef} className="w-[1000px] h-[500px] flex rounded-[2rem] shadow-2xl overflow-hidden bg-white shrink-0" style={{ fontFamily: 'sans-serif' }}>
      
      {/* LEFT SECTION (White side) */}
      <div className="flex-[7] bg-white relative p-10 flex flex-col justify-between overflow-hidden border-r-[3px] border-dashed border-gray-300">
        
        {/* Background Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex justify-between items-start relative z-10">
          <div>
            <EventrixLogo fill="#3A1C71" className="w-48 h-auto mb-2" />
            <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 max-w-[200px] leading-relaxed">
              COLLEGE EVENT REGISTRATION AND MANAGEMENT PLATFORM
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-1 text-[10px] font-bold text-gray-500 tracking-[0.15em] border-r-2 border-[#3A1C71] pr-3">
             <p>IDEAS</p>
             <p>PEOPLE</p>
             <p>EXPERIENCES</p>
          </div>
        </div>

        {/* Middle Content */}
        <div className="mt-6 relative z-10 flex justify-between items-center">
           <div>
             <span className="inline-block bg-purple-100 text-[#3A1C71] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
               {reg.category} Event
             </span>
             <h2 className="font-anton text-5xl uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#1E1A3D] via-[#3A1C71] to-[#8C62FF] tracking-tight mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
               {reg.title}
             </h2>
             <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
               Test your {isTech ? 'tech knowledge' : 'skills'}
             </p>
           </div>
           {/* Lightbulb 3D Icon */}
           <div className="w-32 h-32 relative shrink-0">
              <img src="/images/bulb_3d.jpg" alt="3D Bulb" className="w-full h-full object-contain mix-blend-multiply" crossOrigin="anonymous" />
           </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-6 mt-6 mb-6 relative z-10">
          <div className="flex gap-4 items-start">
             <Calendar className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Date</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap">{reg.date}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">{reg.time}</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <MapPin className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Venue</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap truncate max-w-[120px]">{reg.location}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">Sona College</p>
             </div>
          </div>
          <div className="flex gap-4 items-start">
             <Users className="w-6 h-6 text-[#3A1C71] mt-1 shrink-0" />
             <div>
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Event Type</p>
                <p className="font-bold text-sm text-[#1E1A3D] whitespace-nowrap">{reg.category}</p>
                <p className="text-[11px] text-gray-500 whitespace-nowrap">{reg.participation_type || 'Individual'}</p>
             </div>
          </div>
        </div>

        {/* Participant Inset */}
        <div className="bg-[#F8F9FC] rounded-2xl p-4 flex justify-between items-center relative z-10 border border-gray-100 shadow-sm">
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Participant Name</p>
             <p className="font-bold text-lg text-[#1E1A3D] truncate max-w-[180px]">{participant?.full_name || 'Anonymous'}</p>
           </div>
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Register Number</p>
             <p className="font-bold text-sm text-[#1E1A3D] truncate">{participant?.register_number || 'N/A'}</p>
           </div>
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Department</p>
             <p className="font-bold text-sm text-[#1E1A3D] truncate max-w-[120px]">{participant?.department || 'N/A'}</p>
           </div>
           <div>
             <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">Year</p>
             <p className="font-bold text-sm text-[#1E1A3D]">{participant?.year_of_study || 'N/A'}</p>
           </div>
        </div>

      </div>

      {/* RIGHT SECTION (Dark side) */}
      <div className="flex-[3] bg-[#110B24] p-10 flex flex-col items-center justify-between relative overflow-hidden text-white" style={{ background: 'linear-gradient(to bottom, #110B24, #2A115E, #4A1DFF)' }}>
         
         {/* Semi-circle cutouts to mimic perforations */}
         <div className="absolute top-[-15px] left-[-15px] w-8 h-8 bg-[#F4F4F9] rounded-full shadow-inner z-20"></div>
         <div className="absolute bottom-[-15px] left-[-15px] w-8 h-8 bg-[#F4F4F9] rounded-full shadow-inner z-20"></div>

         <div className="w-full flex flex-col items-center relative z-10">
            <EventrixLogo fill="#FFFFFF" className="w-40 h-auto mb-6" />
            <p className="font-bold tracking-[0.3em] text-xs mb-8 text-white/90 uppercase">Event Ticket</p>
            
            {/* QR Code Block */}
            <div className="bg-white p-4 rounded-2xl shadow-xl w-full flex flex-col items-center mb-6">
               <div className="w-full aspect-square bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-2">
                 <QRCodeSVG value={JSON.stringify({ pid: participant?.participant_id || '', event_id: reg.sub_event_id })} className="w-full h-full" level="H" />
               </div>
               <div className="mt-4 bg-purple-100 text-[#3A1C71] px-4 py-2 rounded-full font-bold text-xs tracking-widest text-center w-full truncate">
                 {reg.ticketNumber}
               </div>
               <p className="text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase mt-3">Scan at entry</p>
            </div>
         </div>

         <div className="w-full border-t border-white/20 pt-4 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-2">
               <div className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
               </div>
               <div>
                  <p className="text-[9px] text-white/60 font-bold tracking-widest uppercase mb-1">Valid For</p>
                  <p className="font-bold text-sm tracking-wider uppercase truncate max-w-[150px]">{reg.title}</p>
               </div>
            </div>
         </div>

      </div>

    </div>
  )
}

export function TicketsClient({ registrations, participant }: { registrations: any[], participant: any }) {
  const [previewTicket, setPreviewTicket] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [modalScale, setModalScale] = useState(1);
  const [isRotated, setIsRotated] = useState(false);
  const offscreenRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth * 0.9;
      const vh = window.innerHeight * 0.7; // Leave space for buttons

      if (isRotated) {
        // Rotated: visual width is 500, visual height is 1000
        const scaleByWidth = vw / 500;
        const scaleByHeight = vh / 1000;
        setModalScale(Math.min(scaleByWidth, scaleByHeight, 1));
      } else {
        // Normal: visual width is 1000, visual height is 500
        const scaleByWidth = vw / 1000;
        const scaleByHeight = vh / 500;
        setModalScale(Math.min(scaleByWidth, scaleByHeight, 1));
      }
    };
    if (previewTicket) {
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [previewTicket, isRotated]);

  const downloadTicketAsPng = async (reg: any) => {
    try {
      setDownloadingId(reg.id);
      const ticketElement = offscreenRefs.current[reg.id];
      if (!ticketElement) return;

      const dataUrl = await htmlToImage.toPng(ticketElement, {
        pixelRatio: 2, // High resolution
      });

      const link = document.createElement("a");
      link.download = `Verve26_Ticket_${reg.title.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download ticket:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registrations.map(reg => (
          <div key={reg.id} className="bg-white border border-[#D9D9DF] rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div>
              <span className="inline-block bg-purple-100 text-[#3A1C71] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest mb-2">
                {reg.category} Event
              </span>
              <h3 className="font-anton text-2xl uppercase text-eventrix-black">{reg.title}</h3>
              <p className="text-xs text-eventrix-muted mt-1">{reg.date} at {reg.time}</p>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setPreviewTicket(reg)}
                className="flex-1 bg-[#F8F8FC] border border-[#D9D9DF] text-eventrix-black py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button
                onClick={() => downloadTicketAsPng(reg)}
                disabled={downloadingId === reg.id}
                className="flex-1 bg-eventrix-black text-white py-2 rounded-md text-xs font-bold uppercase tracking-wide hover:bg-eventrix-lavender hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {downloadingId === reg.id ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </button>
            </div>

            {/* Hidden ticket for html2canvas generation */}
            <div className="absolute top-[-9999px] left-[-9999px] overflow-hidden" style={{ width: 1000, height: 500 }}>
               <TicketCard 
                 reg={reg} 
                 participant={participant} 
                 ticketRef={(el) => { offscreenRefs.current[reg.id] = el; }} 
               />
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8">
          <div className="relative flex flex-col items-center justify-center w-full h-full animate-in fade-in zoom-in-95 duration-200">
            
            {/* Action Bar */}
            <div className="flex justify-between items-center w-full max-w-[800px] mb-6 gap-2 flex-wrap">
              <button
                onClick={() => downloadTicketAsPng(previewTicket)}
                disabled={downloadingId === previewTicket.id}
                className="bg-white text-eventrix-black px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide hover:bg-eventrix-lavender transition-colors flex items-center gap-2 shadow-xl disabled:opacity-50"
              >
                {downloadingId === previewTicket.id ? (
                  <span className="animate-spin w-4 h-4 border-2 border-eventrix-black border-t-transparent rounded-full" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Download
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRotated(!isRotated)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2.5 rounded-full transition-colors"
                  title="Rotate Ticket"
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    setPreviewTicket(null);
                    setIsRotated(false);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            </div>
            
            {/* Scaled Ticket Container */}
            <div 
              className="relative flex items-center justify-center rounded-[1rem] md:rounded-[2rem] shadow-2xl bg-white shrink-0 transition-all duration-300 ease-in-out"
              style={{
                width: isRotated ? 500 * modalScale : 1000 * modalScale,
                height: isRotated ? 1000 * modalScale : 500 * modalScale,
              }}
            >
              <div 
                className="absolute origin-center transition-transform duration-300 ease-in-out"
                style={{
                  width: '1000px',
                  height: '500px',
                  transform: `scale(${modalScale}) ${isRotated ? 'rotate(90deg)' : 'rotate(0deg)'}`
                }}
              >
                <TicketCard reg={previewTicket} participant={participant} />
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
