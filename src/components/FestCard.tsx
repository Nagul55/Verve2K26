import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface FestCardProps {
  id: string;
  name: string;
  description: string;
  minTech: number;
  minNonTech: number;
  imageUrl?: string;
}

export function FestCard({ id, name, description, minTech, minNonTech, imageUrl }: FestCardProps) {
  return (
    <Link href={`/events/${id}`} className="group block h-full p-2 -m-2">
      <div className="bg-white rounded-lg border-2 border-[#D9D9DF] overflow-hidden transition-all duration-300 relative flex flex-col h-full group-hover:border-eventrix-black group-hover:-translate-y-1.5 group-hover:-translate-x-1.5 group-hover:shadow-[6px_6px_0px_0px_rgba(8,10,18,1)]">
        
        {/* Header Section */}
        <div className="h-44 relative overflow-hidden bg-eventrix-black flex items-center justify-center p-6 border-b-2 border-eventrix-black transition-colors">
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-eventrix-black via-eventrix-black/40 to-transparent"></div>
            </>
          ) : (
            <>
              {/* Halftone Pattern Fallback */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff30_1px,transparent_1px),linear-gradient(to_bottom,#ffffff30_1px,transparent_1px)] bg-[size:14px_14px]"></div>
              
              {/* Background large text (outlined) */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-30 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700 ease-out">
                <span 
                  className="font-anton text-8xl uppercase whitespace-nowrap tracking-widest text-transparent" 
                  style={{ WebkitTextStroke: '2px #A98BFF' }}
                >
                  {name}
                </span>
              </div>
            </>
          )}
          
          <h3 className="font-anton text-4xl tracking-widest text-white z-10 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-300">
            {name}
          </h3>
          
          <div className="absolute top-4 left-4 bg-white border-2 border-eventrix-black text-eventrix-black text-[10px] font-black px-3 py-1 uppercase tracking-widest flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(8,10,18,1)] z-20">
            <Sparkles className="w-3 h-3 text-eventrix-lavender" fill="currentColor" /> FEST
          </div>
        </div>
        
        {/* Body Section */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          <p className="text-sm text-eventrix-muted font-medium mb-8 line-clamp-3 leading-relaxed flex-1 group-hover:text-gray-800 transition-colors">
            {description || "Join us for an incredible celebration of technology, culture, and innovation."}
          </p>
          
          <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-[#D9D9DF] mt-auto group-hover:border-eventrix-black/40 transition-colors gap-2">
            <div className="space-y-2 min-w-0">
              <span className="block text-[10px] font-black text-eventrix-muted uppercase tracking-widest editorial-label truncate">
                REQUIREMENTS
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block whitespace-nowrap bg-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-eventrix-black border-2 border-eventrix-black shadow-[2px_2px_0px_0px_rgba(169,139,255,1)]">
                  {minTech || 0} TECH
                </span>
                <span className="inline-block whitespace-nowrap bg-white px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-eventrix-black border-2 border-eventrix-black shadow-[2px_2px_0px_0px_rgba(169,139,255,1)]">
                  {minNonTech || 0} NON-TECH
                </span>
              </div>
            </div>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-eventrix-black text-white flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:text-black transition-all border-2 border-transparent group-hover:border-eventrix-black group-hover:shadow-[3px_3px_0px_0px_rgba(8,10,18,1)] shrink-0">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </div>
          </div>
        </div>
        
      </div>
    </Link>
  );
}
