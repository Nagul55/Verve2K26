import React from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface FeaturedEventCardProps {
  number: string;
  category: string;
  title: React.ReactNode;
  description: string;
  date: string;
  location: string;
  imageVisual: React.ReactNode;
}

export function FeaturedEventCard({ number, category, title, description, date, location, imageVisual }: FeaturedEventCardProps) {
  return (
    <div className="bg-eventrix-white flex flex-col group cursor-pointer relative min-h-[300px] shadow-[0_0_0_1px_#D9D9DF] overflow-hidden">
      <div className="p-6 flex-1 flex flex-col z-10 relative">
        <div className="flex justify-between items-start mb-8">
          <span className="text-[10px] font-bold bg-eventrix-light-lavender text-eventrix-black px-2 py-1 uppercase editorial-label">{category}</span>
          <span className="font-anton text-2xl text-eventrix-muted leading-none">{number}</span>
        </div>
        <h3 className="font-anton text-[28px] font-black uppercase mb-3 tracking-tight text-eventrix-black leading-[0.95] max-w-[60%]">{title}</h3>
        <p className="text-[13px] text-eventrix-muted leading-relaxed max-w-[60%]">{description}</p>
      </div>
      
      {/* Visual background element */}
      <div className="absolute inset-0 bg-gradient-to-br from-eventrix-light-lavender/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
      
      {/* Visual Cutout Element injected via props */}
      {imageVisual}
      
      <div className="border-t border-[#D9D9DF] p-0 flex justify-between items-stretch text-[10px] text-eventrix-muted font-bold uppercase bg-eventrix-white z-10 relative h-12">
        <div className="flex items-center gap-4 px-4 editorial-label">
          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 stroke-[2] text-eventrix-black" /> {date}</div>
          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 stroke-[2] text-eventrix-black" /> {location}</div>
        </div>
        <div className="bg-eventrix-black text-eventrix-white w-12 flex items-center justify-center shrink-0 group-hover:bg-eventrix-lavender group-hover:text-eventrix-black transition-colors">
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      </div>
    </div>
  );
}
