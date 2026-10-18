import React from "react";

export function VerveLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src="/assets/Eventrix logo.svg" 
        alt="Eventrix Logo" 
        width={180}
        height={60}
        style={{ width: "auto", height: "auto", maxWidth: "100%" }}
        className="h-12 w-auto object-contain"
      />
    </div>
  );
}
