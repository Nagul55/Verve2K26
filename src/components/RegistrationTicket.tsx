import React from "react";
import { Calendar, MapPin, QrCode, ArrowRight, Code, Lightbulb, Map, Mic, Zap } from "lucide-react";
import Link from "next/link";

interface RegistrationTicketProps {
  number: string;
  category: string;
  title: string;
  date: string;
  location: string;
}

export function RegistrationTicket({ number, category, title, date, location }: RegistrationTicketProps) {
  // Determine event-specific icon based on title
  const getEventIcon = () => {
    const t = title.toLowerCase();
    if (t.includes('code') || t.includes('hack')) return <Code className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2" />;
    if (t.includes('innovate') || t.includes('quiz')) return <Lightbulb className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2" />;
    if (t.includes('treasure') || t.includes('hunt')) return <Map className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2" />;
    if (t.includes('mic') || t.includes('sing')) return <Mic className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2" />;
    return <Zap className="w-12 h-12 text-white/20 absolute -right-2 -bottom-2" />;
  };

  return (
    <div className="relative w-full min-h-[150px] bg-white border border-[#D9D9DE] rounded-[2px] overflow-hidden hover:shadow-md transition-shadow group flex flex-col md:flex-row">
      {/* Left Accent Strip */}
      <div className="absolute top-0 bottom-0 left-0 w-[5px] bg-[#A98BFF] z-10"></div>

      {/* 1. Event Information Area */}
      <div className="flex-1 pl-6 py-5 pr-4 flex flex-col justify-center">
        <span className="font-['Inter'] text-[9px] font-bold tracking-[0.18em] uppercase text-[#A98BFF] mb-1">
          {category}
        </span>
        <h4 className="font-['Roboto_Condensed','Anton',sans-serif] font-[800] text-[26px] leading-[0.95] tracking-[-0.02em] uppercase text-[#080A12] mb-3 truncate">
          {title}
        </h4>
        <div className="font-['Inter'] text-[12px] text-[#596078] space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> 
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> 
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* 2. Geometric Identity Area */}
      <div className="relative overflow-hidden w-full md:w-[150px] shrink-0 h-[100px] md:h-auto">
        {/* Lavender shape */}
        <div 
          className="absolute inset-0 bg-[#A98BFF]"
          style={{ clipPath: "polygon(0 0, 100% 0, 72% 50%, 100% 100%, 0 100%)" }}
        ></div>
        {/* Black shape */}
        <div 
          className="absolute inset-0 bg-[#080A12] flex items-center justify-center overflow-hidden"
          style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 22% 100%, 55% 50%)" }}
        >
          {getEventIcon()}
          <span className="absolute z-10 text-white font-['Roboto_Condensed','Anton',sans-serif] text-[22px] font-[800]">
            {number}
          </span>
        </div>
      </div>
    </div>
  );
}
