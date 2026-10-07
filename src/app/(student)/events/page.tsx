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
          {hackathons.map((hackathon) => {
            const hDetails = Array.isArray(hackathon.hackathons) ? hackathon.hackathons[0] : hackathon.hackathons;
            const minT = hDetails?.minimum_team_size || 1;
            const maxT = hDetails?.maximum_team_size || 4;
            const teamSizeStr = minT === maxT ? `${minT} MEMBER` : `${minT} - ${maxT} MEMBERS`;
            const modeStr = hDetails?.mode ? hDetails.mode.toUpperCase() : "TEAM EVENT";

            return (
              <FestCard
                key={hackathon.id}
                id={hackathon.id}
                name={hackathon.name}
                description={hackathon.description || hDetails?.tagline || "Register your team and compete in this upcoming hackathon."}
                registrationClosesAt={hackathon.registration_closes_at}
                eventType="hackathon"
                teamSize={teamSizeStr}
                mode={modeStr}
              />
            );
          })}

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
