import { EventrixLogo } from "@/components/EventrixLogo";

export function HeroBanner() {
  return (
    <section className="bg-eventrix-white relative overflow-hidden flex flex-col lg:flex-row h-auto lg:h-[340px] border-b border-[#D9D9DF]">
      {/* Left Content */}
      <div className="w-[55%] shrink-0 p-10 relative z-10 flex flex-col justify-center bg-eventrix-white">
        <div className="w-full max-w-[380px] mb-4">
          <EventrixLogo fill="currentColor" className="w-full h-auto object-contain" />
        </div>
        <p className="text-lg xl:text-xl text-eventrix-black uppercase font-bold editorial-label mb-3">Campus Events, Reimagined</p>
        <p className="text-[11px] text-eventrix-black uppercase editorial-label relative inline-block w-fit">
          Discover. Participate. Create Memories.
          <span className="absolute -bottom-2 left-0 w-16 h-[2px] bg-eventrix-black"></span>
        </p>
      </div>

      {/* Center Image */}
      <div className="w-[45%] shrink-0 relative hidden lg:block overflow-hidden bg-eventrix-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80&grayscale" 
            alt="Architecture" 
            className="w-full h-full object-cover grayscale contrast-[1.15]"
          />
        </div>
        {/* Lavender geometric overlay */}
        <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-eventrix-lavender -rotate-[35deg] origin-top-right mix-blend-multiply opacity-90 -translate-y-10 translate-x-20 z-10"></div>
      </div>

      {/* Right Editorial Box */}
      <div className="w-full lg:w-72 bg-eventrix-white p-6 relative z-20 shrink-0">
        <div className="border border-[#D9D9DE] h-full w-full p-8 flex flex-col justify-between relative">
          <div className="space-y-1.5 text-[11px] font-bold text-eventrix-black uppercase editorial-label">
            <p>IDEAS</p>
            <p>PEOPLE</p>
            <p>EVENTS</p>
            <p>TOGETHER</p>
          </div>
          <div className="absolute right-6 top-10">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1l14.2-14.2"/></svg>
          </div>
          <div className="mt-12 flex flex-col items-start justify-end h-full">
            <div className="w-10 h-[1.5px] bg-eventrix-black mb-10"></div>
            <p className="text-sm font-bold text-eventrix-black editorial-label self-end mt-auto">2026</p>
          </div>
        </div>
      </div>
    </section>
  );
}
