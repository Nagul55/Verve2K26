import React from "react";
import { getFests } from "@/actions/event.actions";
import { getUnsplashImage } from "@/actions/image.actions";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function EventsPage() {
  const fests = await getFests();

  const festsWithImages = await Promise.all(
    fests.map(async (fest) => {
      const imageUrl = await getUnsplashImage(`college campus festival ${fest.name}`);
      return { ...fest, imageUrl };
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Available Fests
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl">
          Select a fest to view its technical and non-technical sub-events and register.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {festsWithImages.map((fest) => (
          <Link href={`/events/${fest.id}`} key={fest.id} className="group block h-full">
            <div className="border-2 border-[#D9D9DF] rounded-xl overflow-hidden bg-white hover:border-eventrix-black transition-all duration-300 relative h-full flex flex-col hover:-translate-y-1 hover:shadow-2xl shadow-sm">
              
              {/* Image Section */}
              <div className="h-56 relative overflow-hidden bg-eventrix-purple">
                {fest.imageUrl ? (
                  <img 
                    src={fest.imageUrl} 
                    alt={fest.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-80 mix-blend-overlay" 
                  />
                ) : (
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[size:20px_20px]"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-eventrix-black/90 via-eventrix-black/40 to-transparent"></div>
                
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Featured
                </div>

                <div className="absolute bottom-6 left-6">
                  <h3 className="font-anton text-4xl text-white tracking-wide uppercase drop-shadow-md">{fest.name}</h3>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col justify-between bg-white relative">
                <p className="text-sm text-eventrix-muted font-medium mb-8 line-clamp-3 leading-relaxed">
                  {fest.description}
                </p>
                
                <div className="flex justify-between items-end pt-4 border-t-2 border-[#D9D9DF] group-hover:border-eventrix-black transition-colors">
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">Requirements</span>
                    <span className="block text-xs font-bold text-eventrix-black bg-gray-100 px-3 py-1.5 rounded-md">
                      {fest.min_technical} Tech / {fest.min_non_technical} Non-Tech
                    </span>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-eventrix-black text-white flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:text-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-45 group-hover:rotate-0">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

            </div>
          </Link>
        ))}

        {festsWithImages.length === 0 && (
          <div className="col-span-full p-16 text-center border-2 border-dashed border-[#D9D9DF] rounded-xl bg-gray-50">
            <p className="text-eventrix-muted font-bold">No fests are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
