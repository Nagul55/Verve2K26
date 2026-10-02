import React from "react";

import { HeroBanner } from "@/components/HeroBanner";
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

  // Try fetching images in parallel for the first 3 events
  const featuredEvents = (events || []).slice(0, 3);
  const featuredWithImages = await Promise.all(
    featuredEvents.map(async (event, index) => {
      // Use the event name as the query. Add some context to get better results
      const query = event.category === 'Technical' ? `technology ${event.title}` : `campus college ${event.title}`;
      const imageUrl = await getUnsplashImage(query);
      return { ...event, imageUrl, number: `0${index + 1}` };
    })
  );
  return (
    <>
      <HeroBanner />

      <div className="flex flex-col xl:flex-row gap-10 mt-10">

        {/* Left Main Column */}
        <div className="flex-1 min-w-0 space-y-12">

          {/* Featured Events */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">Featured Events <span className="font-normal text-eventrix-black">→</span></h2>
              <a href="/events" className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap">View All Events →</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredWithImages.map((event) => (
                <FeaturedEventCard
                  key={event.id}
                  number={event.number}
                  category={event.category}
                  title={event.title === 'CODE CLASH' ? <>{'CODE'}<br />{'CLASH'}</> : event.title === 'TREASURE HUNT' ? <>{'TREASURE'}<br />{'HUNT'}</> : event.title}
                  description={event.description}
                  date={event.date}
                  location={event.location}
                  imageVisual={renderDynamicVisual(event.imageUrl)}
                />
              ))}
            </div>
          </section>

          {/* My Registrations */}
          <section>
            <div className="flex justify-between items-end mb-6 mt-12">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">My Registrations <span className="font-normal text-eventrix-black">→</span></h2>
              <a href="/registrations" className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap">View All →</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((reg) => (
                  <RegistrationTicket
                    key={reg.id}
                    number={reg.ticketNumber}
                    category={reg.category}
                    title={reg.title}
                    date={reg.date}
                    location={reg.location}
                  />
                ))
              ) : (
                <div className="col-span-3 p-10 text-center border border-dashed border-[#D9D9DF] rounded-md">
                  <p className="text-eventrix-muted font-bold mb-4">You haven't registered for any events yet!</p>
                  <a href="/events" className="bg-eventrix-black text-white px-6 py-3 rounded-md text-xs uppercase font-bold tracking-widest hover:bg-eventrix-lavender hover:text-black transition-colors">
                    Register Now
                  </a>
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
