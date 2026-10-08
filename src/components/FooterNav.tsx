import React from "react";

export function FooterNav() {
  return (
    <footer className="w-full py-6 mt-auto flex items-center justify-center border-t border-[#D9D9DF]/40 bg-transparent">
      <div className="inline-flex items-center gap-2 text-xs text-eventrix-muted font-medium tracking-wide flex-wrap justify-center">
        <span>Developed by:</span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D9D9DF]/80 shadow-2xs text-xs font-semibold text-eventrix-black">
          <span>Mohamed Imran Z</span>
          <span className="text-[#D9D9DF] font-normal">|</span>
          <span>Nagul G</span>
        </span>
      </div>
    </footer>
  );
}
