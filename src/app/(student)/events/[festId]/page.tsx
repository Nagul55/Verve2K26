import React from "react";
import { getFests, getSubEvents, getStudentRegisteredEventIds, getSubEventRegistrationCounts } from "@/actions/event.actions";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound, redirect } from "next/navigation";
import { FestEventsClient } from "./FestEventsClient";

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

  return (
    <FestEventsClient
      fest={fest}
      events={events}
      initialRegisteredIds={registeredIds}
      registrationCounts={registrationCounts}
      hackathonData={hackathonData}
    />
  );
}
