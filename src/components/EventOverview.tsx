import React from "react";
import { Users, CheckCircle2, Calendar } from "lucide-react";

interface EventOverviewProps {
  registeredCount: number;
  completedCount?: number;
  upcomingCount?: number;
  totalEventsCount: number;
}

export function EventOverview({
  registeredCount,
  completedCount = 0,
  upcomingCount,
  totalEventsCount
}: EventOverviewProps) {
  return (
    <section className="bg-eventrix-white p-6 md:p-8 shadow-[0_0_0_1px_#D9D9DF] rounded-md">
      <div className="flex justify-between items-center mb-6 border-b border-[#D9D9DF] pb-4">
        <h3 className="font-bold text-eventrix-black tracking-tight text-lg">My Overview</h3>
        <span className="text-[9px] font-bold uppercase text-eventrix-muted editorial-label bg-eventrix-bg px-2 py-1">Fest Activity</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Completed & Attended */}
        <div className="flex flex-col items-center border border-emerald-200 bg-emerald-50/40 rounded-md p-3 min-w-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="font-anton text-[26px] text-emerald-800 leading-none mb-1">{completedCount}</p>
          <p className="text-[11px] font-bold text-emerald-700 whitespace-nowrap text-center">Completed</p>
        </div>

        {/* Total Registered */}
        <div className="flex flex-col items-center border border-[#D9D9DE] rounded-md p-3 min-w-0 bg-white">
          <Users className="w-5 h-5 text-eventrix-lavender mb-2" />
          <p className="font-anton text-[26px] text-eventrix-black leading-none mb-1">{registeredCount}</p>
          <p className="text-[11px] font-medium text-eventrix-black whitespace-nowrap text-center">Registered</p>
        </div>

        {/* Upcoming Count */}
        <div className="col-span-2 flex items-center justify-between border border-[#E5E5EB] bg-[#F8F8FC] rounded-md px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-eventrix-lavender" />
            <span className="text-xs font-semibold text-eventrix-black">Available / Live Events</span>
          </div>
          <span className="font-anton text-lg text-eventrix-black">{totalEventsCount}</span>
        </div>
      </div>
    </section>
  );
}
