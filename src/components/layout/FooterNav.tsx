import React from "react";

export function FooterNav() {
  return (
    <footer className="w-full py-6 mt-auto flex items-center justify-center border-t border-[#D9D9DF]/40 bg-transparent">
      <p className="text-xs text-eventrix-muted tracking-wide flex items-center gap-1.5 flex-wrap justify-center">
        <span>An experience crafted by</span>
        <span className="font-medium text-eventrix-black">Mohamed Imran Z</span>
        <span className="text-[#D9D9DF]">|</span>
        <span className="font-medium text-eventrix-black">Nagul G</span>
      </p>
    </footer>
  );
}
