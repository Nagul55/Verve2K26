import React from "react";
import { getParticipantRegistrations } from "@/actions/event.actions";
import { getCurrentUser } from "@/lib/auth/get-user";
import { CompletedEventsClient } from "./CompletedEventsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completed Events & Team Details | Eventrix",
  description: "View your completed campus festival events and team member details.",
};

export default async function CompletedEventsPage() {
  const [registeredEvents, { user }] = await Promise.all([
    getParticipantRegistrations(),
    getCurrentUser()
  ]);

  // Filter ONLY completed/concluded events
  const completedEvents = (registeredEvents || []).filter(e => e.isCompletedEvent || e.isOver);

  return (
    <CompletedEventsClient 
      completedEvents={completedEvents} 
      user={user} 
    />
  );
}
