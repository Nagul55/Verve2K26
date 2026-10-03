import React from "react";
import { getFests } from "@/actions/event.actions";
import Link from "next/link";
import { FestCard } from "@/components/FestCard";

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
          <FestCard
            key={fest.id}
            id={fest.id}
            name={fest.name}
            description={fest.description}
            minTech={fest.min_technical}
            minNonTech={fest.min_non_technical}
          />
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
