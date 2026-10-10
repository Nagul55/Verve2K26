import React from "react";
import Link from "next/link";
import Image from "next/image";

import { HeroBanner } from "@/components/HeroBanner";
import { ArrowRight } from "lucide-react";
import { FestCard } from "@/components/FestCard";
import { EventOverview } from "@/components/EventOverview";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { RegistrationTicket } from "@/components/RegistrationTicket";
import { PromoBanner } from "@/components/PromoBanner";
import { getSubEvents, getFests, getParticipantRegistrations } from "@/actions/event.actions";
import { getUnsplashImage } from "@/actions/image.actions";
import { getCurrentUser } from "@/lib/auth/get-user";
import { isUserEligibleForEvent } from "@/lib/utils/eligibility";

// Render dynamic visual for the featured cards based on Unsplash
const renderDynamicVisual = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  return (
    <div className="absolute top-0 right-0 w-[45%] h-[65%] z-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-eventrix-light-lavender opacity-30"></div>
      <Image src={imageUrl} alt="Event background" fill sizes="(max-width: 768px) 100vw, 33vw" priority className="object-cover grayscale mix-blend-multiply opacity-50 z-10" />
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-eventrix-black z-20" style={{ clipPath: "polygon(100% 0, 100% 100%, 0% 100%)" }}></div>
    </div>
  );
};

export default async function Dashboard() {
  const [fests, registeredEvents, { profile }] = await Promise.all([
    getFests(),
    getParticipantRegistrations(),
    getCurrentUser()
  ]);

  const eligibleFests = (fests || []).filter(e => isUserEligibleForEvent(profile?.department, e.allowed_departments));
  const activeFest = eligibleFests && eligibleFests.length > 0 ? eligibleFests[0] : null;
  const events = activeFest ? await getSubEvents(activeFest.id) : [];

  // Fetch images in parallel for the first 3 eligible fests
  const featuredFests = (eligibleFests || []).slice(0, 3);
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
              {festsWithImages.map((fest) => (
                <FestCard
                  key={fest.id}
                  id={fest.id}
                  name={fest.name}
                  description={fest.description}
                  minTech={fest.min_technical}
                  minNonTech={fest.min_non_technical}
                  imageUrl={fest.imageUrl || undefined}
                  registrationClosesAt={fest.registration_closes_at}
                />
              ))}
              {festsWithImages.length === 0 && (
                <div className="col-span-full p-8 text-center border-2 border-dashed border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
                  <p className="text-eventrix-muted font-bold text-sm uppercase tracking-widest">
                    No fests are currently available for your department ({profile?.department || 'Not Specified'}).
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* My Registrations */}
          <section>
            <div className="flex justify-between items-end mb-6 mt-12">
              <h2 className="text-[22px] font-bold text-eventrix-black tracking-tight">My Registrations <span className="font-normal text-eventrix-black">→</span></h2>
              <Link href="/registrations" className="text-[10px] text-eventrix-lavender font-bold uppercase hover:text-eventrix-black transition-colors editorial-label whitespace-nowrap">View All →</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="col-span-2 p-10 text-center border border-dashed border-[#D9D9DF] rounded-md">
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
