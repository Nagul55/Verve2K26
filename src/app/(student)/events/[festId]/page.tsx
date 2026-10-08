import React from "react";
import { getFests, getSubEvents, getStudentRegisteredEventIds, getSubEventRegistrationCounts } from "@/actions/event.actions";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound, redirect } from "next/navigation";
import { FestEventsClient } from "./FestEventsClient";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ festId: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { festId } = await params;
  const fests = await getFests();
  const fest = fests.find(f => f.id === festId);

  if (!fest) {
    return { title: 'Event Not Found | Eventrix' };
  }

  const title = `${fest.name} | Sona College Events | Eventrix`;
  const description = fest.description || `Join ${fest.name} at Sona College of Technology.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: `/events/${fest.id}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: fest.logo_url ? [{ url: fest.logo_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: fest.logo_url ? [fest.logo_url] : undefined,
    }
  };
}

export default async function FestEventsPage({ params }: { params: Promise<{ festId: string }> }) {
  const { festId } = await params;
  const fests = await getFests();
  const fest = fests.find(f => f.id === festId);

  if (!fest) {
    notFound();
  }

  // If this "fest" is actually a Hackathon, redirect to the dedicated Hackathon portal
  if (fest.event_type === 'HACKATHON' || fest.event_type === 'hackathon') {
    redirect(`/hackathons/${fest.id}`);
  }

  const events = await getSubEvents(fest.id);
  const registeredIds = await getStudentRegisteredEventIds();
  const registrationCounts = await getSubEventRegistrationCounts();
  const hackathonData = fest.event_type === 'hackathon' ? await getHackathon(fest.id) : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: fest.name,
    description: fest.description,
    image: fest.logo_url ? [fest.logo_url] : undefined,
    startDate: fest.created_at,
    endDate: fest.registration_closes_at,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Sona College of Technology',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Salem',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: 'Sona College of Technology',
      url: 'https://sonatech.ac.in'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FestEventsClient
        fest={fest}
        events={events}
        initialRegisteredIds={registeredIds}
        registrationCounts={registrationCounts}
        hackathonData={hackathonData}
      />
    </>
  );
}
