import React from "react";
import { Code2 } from "lucide-react";

export function FooterNav() {
  return (
    <footer className="w-full bg-eventrix-bg/95 backdrop-blur-sm border-t border-[#D9D9DF]/80 py-2.5 sm:py-3 px-4 md:px-10 shrink-0 z-40 transition-all">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 max-w-[1700px] mx-auto w-full">
        {/* Developers Section */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 text-eventrix-black">
            <Code2 className="w-4 h-4 text-eventrix-lavender stroke-[2.5]" />
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-eventrix-black">
              Developed By
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Developer 1: Nagul G (28 Batch) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-eventrix-black rounded-md shadow-[2px_2px_0px_0px_rgba(8,10,18,1)] hover:shadow-[3px_3px_0px_0px_#A98BFF] hover:-translate-y-0.5 transition-all">
              <span className="text-xs font-black text-eventrix-black tracking-tight">Nagul G</span>
              <span className="text-[10px] font-bold text-eventrix-lavender bg-eventrix-black px-1.5 py-0.5 rounded-[2px] tracking-wide">
                28 Batch
              </span>
            </div>

            <span className="text-eventrix-black font-black text-xs">,</span>

            {/* Developer 2: Mohamed Imran Z (28 Batch) */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-eventrix-black rounded-md shadow-[2px_2px_0px_0px_rgba(8,10,18,1)] hover:shadow-[3px_3px_0px_0px_#A98BFF] hover:-translate-y-0.5 transition-all">
              <span className="text-xs font-black text-eventrix-black tracking-tight">Mohamed Imran Z</span>
              <span className="text-[10px] font-bold text-eventrix-lavender bg-eventrix-black px-1.5 py-0.5 rounded-[2px] tracking-wide">
                28 Batch
              </span>
            </div>
          </div>
        </div>

        {/* Institution / Eventrix Branding */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-eventrix-muted uppercase tracking-wider">
          <span>Eventrix</span>
          <span>•</span>
          <span>Sona College of Technology</span>
        </div>
      </div>
    </footer>
  );
}
