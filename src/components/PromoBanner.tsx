import React from "react";

export function PromoBanner() {
  return (
    <div className="mt-8 bg-eventrix-lavender flex flex-col md:flex-row h-auto md:h-[120px] relative overflow-hidden">
      <div className="p-6 flex-1 flex items-center justify-center z-10 relative bg-eventrix-lavender w-full md:w-auto shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-eventrix-black editorial-label leading-relaxed">
          BIGGER<br/>BRIGHTER<br/>CAMPUS
        </h2>
      </div>
      
      <div className="w-full md:w-[40%] relative z-0 shrink-0 hidden md:block overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80&grayscale" 
          alt="Students" 
          className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.1] z-0 mix-blend-multiply opacity-80" 
        />
        <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-eventrix-lavender -rotate-[35deg] origin-bottom-right translate-x-12 translate-y-6 opacity-90 mix-blend-multiply z-10"></div>
      </div>

      <div className="p-6 flex-1 flex items-center justify-between z-10 relative bg-eventrix-light-lavender border-l border-[#D9D9DF] w-full md:w-auto shrink-0">
        <h2 className="text-base font-bold tracking-widest text-eventrix-black editorial-label leading-snug">
          SAME<br/>STUDENTS<br/>BOLDER<br/>EVENTS
        </h2>
        <div className="flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
             <div className="w-8 h-8 rounded-full border border-eventrix-black bg-eventrix-black z-10"></div>
             <div className="w-8 h-8 rounded-full border border-eventrix-black bg-transparent relative z-20"></div>
          </div>
          <div className="border-b border-eventrix-black pb-0.5">
            <p className="text-[10px] font-bold uppercase text-eventrix-black editorial-label whitespace-nowrap">EVENTRIX 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
