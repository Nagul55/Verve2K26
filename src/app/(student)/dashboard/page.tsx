import React from "react";
import Link from "next/link";

import { HeroBanner } from "@/components/HeroBanner";
import { ArrowRight } from "lucide-react";
import { FeaturedEventCard } from "@/components/FeaturedEventCard";
import { EventOverview } from "@/components/EventOverview";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { RegistrationTicket } from "@/components/RegistrationTicket";
import { PromoBanner } from "@/components/PromoBanner";
import { getSubEvents, getFests, getParticipantRegistrations } from "@/actions/event.actions";
import { getUnsplashImage } from "@/actions/image.actions";

// Render dynamic visual for the featured cards based on Unsplash
const renderDynamicVisual = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  return (
    <div className="absolute top-0 right-0 w-[45%] h-[65%] z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-eventrix-light-lavender opacity-30"></div>
      <img src={imageUrl} alt="Event background" className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-multiply opacity-50 z-10" />
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-eventrix-black z-20" style={{ clipPath: "polygon(100% 0, 100% 100%, 0% 100%)" }}></div>
    </div>
  );
};

export default async function Dashboard() {
  const fests = await getFests();
  const activeFest = fests && fests.length > 0 ? fests[0] : null;
  const events = activeFest ? await getSubEvents(activeFest.id) : [];
  const registeredEvents = await getParticipantRegistrations();

  // Try fetching images in parallel for the first 3 fests
  const featuredFests = (fests || []).slice(0, 3);
  const festsWithImages = await Promise.all(
    featuredFests.map(async (fest, index) => {
      const query = `campus college festival ${fest.name}`;
      const imageUrl = await getUnsplashImage(query);
      return { ...fest, imageUrl, number: `0${index + 1}` };
    })
  );
  return (
    <>
      <HeroBanner />

      <div className="flex flex-col xl:flex-row gap-10 mt-10">

        {/* Left Main Column */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* Featured Fests */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">Featured Fests <span className="font-normal text-eventrix-black">→</span></h2>
              <Link href="/events" className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap">View All Events →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredFests.map((fest) => (
                <Link href={`/events/${fest.id}`} key={fest.id} className="group block">
                  <div className="border border-[#D9D9DF] rounded-md overflow-hidden bg-white hover:border-eventrix-black transition-colors relative h-full flex flex-col">
                    <div className="h-32 bg-[#F8F8FC] relative flex items-center justify-center border-b border-[#D9D9DF] overflow-hidden group-hover:bg-[#EBEBF2] transition-colors">
                      <span className="font-anton text-4xl text-eventrix-lavender/30 absolute tracking-widest">{fest.name.toUpperCase()}</span>
                      <h3 className="font-anton text-3xl text-eventrix-black z-10">{fest.name}</h3>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-eventrix-muted font-medium mb-6 line-clamp-3 flex-1">
                        {fest.description || "The Ultimate Tech and Cultural Fest"}
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
            </div>
          </section>

          {/* My Registrations */}
          <section>
            <div className="flex justify-between items-end mb-6 mt-12">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">My Registrations <span className="font-normal text-eventrix-black">→</span></h2>
              <Link href="/registrations" className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap">View All →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((reg, index) => (
                  <RegistrationTicket
                    key={reg.id}
                    number={String(index + 1).padStart(2, '0')}
                    category={reg.category}
                    title={reg.title}
                    date={reg.date}
                    location={reg.location}
                  />
                ))
              ) : (
                <div className="col-span-3 p-10 text-center border border-dashed border-[#D9D9DF] rounded-md">
                  <p className="text-eventrix-muted font-bold mb-4">You haven't registered for any events yet!</p>
                  <Link href="/events" className="bg-eventrix-black text-white px-6 py-3 rounded-md text-xs uppercase font-bold tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors inline-block">
                    Register Now
                  </Link>
                </div>
              )}
            </div>
          </section>

          <PromoBanner />

        </div>

        {/* Right Sidebar Column */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-10 min-w-0">
          <EventOverview registeredCount={registeredEvents.length} totalEventsCount={events.length} />
          <UpcomingEvents events={events} />
        </div>

      </div>
    </>
  );
}
