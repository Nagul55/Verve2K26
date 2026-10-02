import React from "react";

export function VerveLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/images/logo.png" 
        alt="Verve26 Logo" 
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
