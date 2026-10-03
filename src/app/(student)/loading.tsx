import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-eventrix-lavender blur-xl opacity-30 rounded-full animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-eventrix-black animate-spin relative z-10" />
      </div>
      <p className="text-eventrix-black font-anton tracking-widest uppercase text-sm">Preparing Awesomeness...</p>
    </div>
  );
}
