import React from "react";
import { getFests } from "@/actions/event.actions";
import Link from "next/link";
import { FestCard } from "@/components/FestCard";

export default async function EventsPage() {
  const allEvents = await getFests();
  
  const regularFests = (allEvents || []).filter(e => e.event_type !== 'hackathon');
  const hackathons = (allEvents || []).filter(e => e.event_type === 'hackathon');

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-12">
      {/* FESTS SECTION */}
      <div className="space-y-8">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Available Fests
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl">
            Select a fest to view its technical and non-technical sub-events and register.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularFests.map((fest) => (
            <FestCard
              key={fest.id}
              id={fest.id}
              name={fest.name}
              description={fest.description}
              minTech={fest.min_technical}
              minNonTech={fest.min_non_technical}
              registrationClosesAt={fest.registration_closes_at}
            />
          ))}

          {regularFests.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-gray-50">
              <p className="text-eventrix-muted font-bold text-sm tracking-widest uppercase">No fests are currently available.</p>
            </div>
          )}
        </div>
      </div>

      {/* HACKATHONS SECTION */}
      <div className="space-y-8">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Available Hackathons
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl">
            Register your team and compete in upcoming hackathons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Link 
              key={hackathon.id} 
              href={`/hackathons/${hackathon.id}`}
              className="group border border-[#D9D9DF] rounded-xl overflow-hidden bg-white hover:border-eventrix-lavender hover:shadow-lg transition-all"
            >
              <div className="h-32 bg-eventrix-black flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-eventrix-lavender/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="font-anton text-3xl text-white tracking-widest uppercase text-center relative z-10 group-hover:scale-105 transition-transform">
                  {hackathon.name}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-eventrix-muted font-medium text-sm line-clamp-2 min-h-[40px]">
                  {hackathon.description || "Join this hackathon to solve real-world problems."}
                </p>
                <div className="mt-6 pt-6 border-t border-[#D9D9DF] flex items-center justify-between">
                  <span className="text-xs font-bold text-eventrix-black uppercase tracking-widest">
                    View Details
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#F8F8FC] flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:text-eventrix-black text-eventrix-muted transition-colors">
                    →
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {hackathons.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-gray-50">
              <p className="text-eventrix-muted font-bold text-sm tracking-widest uppercase">No hackathons are currently available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
