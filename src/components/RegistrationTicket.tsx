import React from "react";
import { Calendar, MapPin, QrCode, ArrowRight } from "lucide-react";

interface RegistrationTicketProps {
  number: string;
  category: string;
  title: string;
  date: string;
  location: string;
}

export function RegistrationTicket({ number, category, title, date, location }: RegistrationTicketProps) {
  return (
    <div className="bg-eventrix-white flex group relative shadow-[0_0_0_1px_#D9D9DE] h-[105px] w-full overflow-hidden rounded-sm">
      {/* Lavender vertical edge */}
      <div className="w-1 bg-eventrix-lavender shrink-0 h-full"></div>
      
      {/* Left Info Section */}
      <div className="p-3 pl-4 flex-1 relative z-10 flex flex-col justify-center bg-eventrix-white min-w-0">
        <span className="text-[9px] font-bold text-eventrix-lavender uppercase mb-1 block editorial-label tracking-widest">{category}</span>
        <h4 className="font-semibold text-base text-eventrix-black truncate">{title}</h4>
        <div className="space-y-1 mt-1.5 text-[11px] text-eventrix-muted whitespace-nowrap">
          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-eventrix-black stroke-[2]" /> {date}</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-eventrix-black stroke-[2]" /> {location}</div>
        </div>
      </div>

      {/* Center Black Cutout Shape (Diagonal Left) */}
      <div className="w-12 relative overflow-hidden shrink-0 bg-eventrix-white z-20 flex items-center justify-center -ml-2">
        <div 
          className="absolute inset-0 bg-eventrix-black"
          style={{ clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0% 100%)" }}
        ></div>
        <span className="font-bold text-[14px] text-eventrix-white relative z-10 opacity-90 translate-x-1">{number}</span>
      </div>

      {/* Right QR Section */}
      <div className="w-[85px] p-2 flex flex-col items-center justify-center relative bg-eventrix-white shrink-0 z-10 border-l border-dashed border-[#D9D9DE] before:absolute before:top-[-4px] before:left-[-4px] before:w-2 before:h-2 before:bg-eventrix-bg before:rounded-full before:shadow-[inset_0_-1px_0_0_#D9D9DE] after:absolute after:bottom-[-4px] after:left-[-4px] after:w-2 after:h-2 after:bg-eventrix-bg after:rounded-full after:shadow-[inset_0_1px_0_0_#D9D9DE]">
        <QrCode className="w-[44px] h-[44px] text-eventrix-black mb-1.5" strokeWidth={1} />
        <span className="text-[10px] font-medium text-eventrix-black flex items-center gap-1 group-hover:text-eventrix-lavender transition-colors whitespace-nowrap">
          View Ticket <ArrowRight className="w-2.5 h-2.5 stroke-[2]" />
        </span>
      </div>
    </div>
  );
}
