import React from "react";
import { Calendar, MapPin, CheckCircle2, Code, Lightbulb, Map, Mic, Zap, Clock } from "lucide-react";

interface RegistrationTicketProps {
  number: string;
  category: string;
  title: string;
  date: string;
  location: string;
  isCompletedEvent?: boolean;
  isOver?: boolean;
  hasParticipated?: boolean;
  attendanceStatus?: string;
}

export function RegistrationTicket({
  number,
  category,
  title,
  date,
  location,
  isCompletedEvent,
  isOver,
  hasParticipated,
  attendanceStatus
}: RegistrationTicketProps) {
  const getEventIcon = () => {
    const t = title.toLowerCase();
    const props = { className: "w-4 h-4 transition-colors" };
    if (t.includes('code') || t.includes('hack')) return <Code {...props} />;
    if (t.includes('innovate') || t.includes('quiz')) return <Lightbulb {...props} />;
    if (t.includes('treasure') || t.includes('hunt')) return <Map {...props} />;
    if (t.includes('mic') || t.includes('sing')) return <Mic {...props} />;
    return <Zap {...props} />;
  };

  const isCompletedAndAttended = isCompletedEvent || (isOver && hasParticipated);

  return (
    <div className={`relative w-full bg-white rounded-xl border ${
      isCompletedAndAttended ? 'border-emerald-300 shadow-sm' : 'border-[#D9D9DF]'
    } overflow-hidden hover:shadow-lg transition-all group flex flex-col sm:flex-row`}>
      {/* Left Accent Strip */}
      <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${
        isCompletedAndAttended ? 'bg-emerald-500' : (isOver ? 'bg-gray-400' : 'bg-eventrix-lavender')
      } z-10 transition-all group-hover:w-[6px]`}></div>

      {/* 1. Event Information Area */}
      <div className="flex-1 p-4 pl-5 flex flex-col justify-between min-w-0">
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-block px-2 py-0.5 bg-[#F3F0FF] text-eventrix-lavender text-[9px] font-bold tracking-widest uppercase rounded-sm">
              {category}
            </span>
            {isCompletedAndAttended ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold tracking-widest uppercase rounded-sm border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed & Participated
              </span>
            ) : isOver ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold tracking-widest uppercase rounded-sm border border-gray-200">
                Event Concluded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold tracking-widest uppercase rounded-sm border border-blue-200">
                <Clock className="w-2.5 h-2.5" /> Upcoming
              </span>
            )}
          </div>
          <h4 className="font-anton text-xl tracking-wide text-eventrix-black mb-1 truncate group-hover:text-eventrix-lavender transition-colors" title={title}>
            {title}
          </h4>
        </div>
        
        <div className="flex flex-col gap-1.5 text-[11px] font-medium text-eventrix-muted mt-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-eventrix-lavender shrink-0" /> 
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-eventrix-lavender shrink-0" /> 
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px relative border-l-2 border-dashed border-[#D9D9DF] my-3"></div>
      <div className="block sm:hidden h-px relative border-t-2 border-dashed border-[#D9D9DF] mx-3"></div>

      {/* 2. Ticket Stub Area */}
      <div className="relative w-full sm:w-[90px] shrink-0 bg-white flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-4">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-bold text-eventrix-muted uppercase tracking-widest editorial-label mb-0.5">
            TKT NO.
          </span>
          <span className="font-anton text-2xl sm:text-3xl text-eventrix-black tracking-widest">
            {number}
          </span>
        </div>
        
        <div className={`sm:mt-3 w-8 h-8 rounded-full ${
          isCompletedAndAttended ? 'bg-emerald-50 border border-emerald-300 text-emerald-700' : 'bg-[#F8F8FC] border border-[#D9D9DF] text-eventrix-muted'
        } flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:border-eventrix-lavender group-hover:text-eventrix-black transition-all`}>
           {isCompletedAndAttended ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : getEventIcon()}
        </div>
      </div>
    </div>
  );
}
