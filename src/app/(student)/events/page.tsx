import React from "react";
import { getFests } from "@/actions/event.actions";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function EventsPage() {
  const fests = await getFests();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(fests || []).map((fest) => (
          <Link href={`/events/${fest.id}`} key={fest.id} className="group block">
            <div className="border border-[#D9D9DF] rounded-md overflow-hidden bg-white hover:border-eventrix-black transition-colors relative h-full flex flex-col">
              <div className="h-32 bg-[#F8F8FC] relative flex items-center justify-center border-b border-[#D9D9DF] overflow-hidden group-hover:bg-[#EBEBF2] transition-colors">
                <span className="font-anton text-4xl text-eventrix-lavender/30 absolute tracking-widest">{fest.name.toUpperCase()}</span>
                <h3 className="font-anton text-3xl text-eventrix-black z-10">{fest.name}</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p className="text-sm text-eventrix-muted font-medium mb-6 line-clamp-3 flex-1">
                  {fest.description}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-[#D9D9DF]">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-eventrix-muted uppercase tracking-widest">REQUIREMENTS</span>
                    <span className="block text-xs font-bold text-eventrix-black">
                      {fest.min_technical || 0} Tech / {fest.min_non_technical || 0} Non-Tech
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-eventrix-black text-white flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {(!fests || fests.length === 0) && (
          <div className="col-span-full p-16 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-gray-50">
            <p className="text-eventrix-muted font-bold">No fests are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
