import React from "react";
import { getFests, getSubEvents, getStudentRegisteredEventIds, getSubEventRegistrationCounts } from "@/actions/event.actions";
import { notFound } from "next/navigation";
import { FestEventsClient } from "./FestEventsClient";

export default async function FestEventsPage({ params }: { params: Promise<{ festId: string }> }) {
  const { festId } = await params;
  const fests = await getFests();
  const fest = fests.find(f => f.id === festId);
  
  if (!fest) {
    notFound();
  }

  const events = await getSubEvents(fest.id);
  const registeredIds = await getStudentRegisteredEventIds();
  const registrationCounts = await getSubEventRegistrationCounts();

  return (
    <FestEventsClient
      fest={fest}
      events={events}
      initialRegisteredIds={registeredIds}
      registrationCounts={registrationCounts}
    />
  );
}
