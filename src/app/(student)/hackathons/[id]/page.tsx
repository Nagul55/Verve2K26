import React from "react";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound } from "next/navigation";
import { HackathonClient } from "./HackathonClient";

import { getUserHackathonTeam } from "@/actions/hackathon.team.actions";
import { createClient } from "@/lib/supabase/server";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const hackathonData = await getHackathon(id);

  if (!hackathonData || !hackathonData.hackathonDetails) {
    return { title: 'Hackathon Not Found | Eventrix' };
  }

  const title = `${hackathonData.name} | Sona College Hackathons | Eventrix`;
  const description = hackathonData.description || `Join ${hackathonData.name} at Sona College of Technology.`;
  
  return {
    title,
    description,
    alternates: {
      canonical: `/hackathons/${id}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      images: hackathonData.logo_url ? [{ url: hackathonData.logo_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: hackathonData.logo_url ? [hackathonData.logo_url] : undefined,
    }
  };
}

export default async function HackathonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hackathonData = await getHackathon(id);
  
  if (!hackathonData || !hackathonData.hackathonDetails) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userTeam = await getUserHackathonTeam(hackathonData.hackathonDetails.id);

  const hackathon = hackathonData.hackathonDetails;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: hackathonData.name,
    description: hackathonData.description,
    image: hackathonData.logo_url ? [hackathonData.logo_url] : undefined,
    startDate: hackathon.hackathon_starts_at || hackathonData.created_at,
    endDate: hackathon.hackathon_ends_at || hackathonData.registration_closes_at,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: hackathon.venue || 'Sona College of Technology',
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
      <HackathonClient 
        fest={hackathonData} 
        hackathon={hackathon}
        problemStatements={hackathonData.problem_statements}
        userTeam={userTeam}
        currentUserId={user?.id}
      />
    </>
  );
}
