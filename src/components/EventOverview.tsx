import React from "react";
import { Users, ArrowUpRight } from "lucide-react";

export function EventOverview({ registeredCount, totalEventsCount }: { registeredCount: number, totalEventsCount: number }) {
  return (
    <section className="bg-eventrix-white p-8 shadow-[0_0_0_1px_#D9D9DF]">
      <div className="flex justify-between items-center mb-8 border-b border-[#D9D9DF] pb-4">
        <h3 className="font-bold text-eventrix-black tracking-tight text-lg">My Overview</h3>
        <span className="text-[9px] font-bold uppercase text-eventrix-muted editorial-label bg-eventrix-bg px-2 py-1">This Fest ▾</span>
      </div>
      
      <div className="flex justify-between gap-4">
        <div className="flex flex-col items-center border border-[#D9D9DE] rounded-md p-3 w-1/2 min-w-0">
          <Users className="w-5 h-5 text-eventrix-lavender mb-3" />
          <p className="font-anton text-[28px] text-eventrix-black leading-none mb-1.5">{registeredCount}</p>
          <p className="text-xs text-eventrix-black whitespace-nowrap mb-1 text-center">My Events</p>
        </div>
        
        <div className="flex flex-col items-center border border-[#D9D9DE] rounded-md p-3 w-1/2 min-w-0">
          <ArrowUpRight className="w-5 h-5 text-eventrix-lavender mb-3" />
          <p className="font-anton text-[28px] text-eventrix-black leading-none mb-1.5">{totalEventsCount}</p>
          <p className="text-xs text-eventrix-black whitespace-nowrap mb-1 text-center">Total Events</p>
        </div>
      </div>
    </section>
  );
}

