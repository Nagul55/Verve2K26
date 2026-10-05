import React from "react";
import { getFests, getSubEvents } from "@/actions/event.actions";
import { RegistrationsForm } from "./RegistrationsForm";
import { Database } from "lucide-react";

export default async function RegistrationsPage({ params }: { params: Promise<{ festId: string }> }) {
  const { festId } = await params;
  
  // Fetch data on the server
  const fests = await getFests();
  if (!fests || fests.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 border border-red-200 bg-red-50 rounded-lg text-center">
        <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">No Fests Found</h2>
        <p className="text-sm text-red-600 mb-6">
          We connected to Supabase, but the `fests` table seems empty or missing.
        </p>
      </div>
    );
  }

  const activeFest = fests.find(f => f.id === festId) || fests[0];
  const events = await getSubEvents(activeFest.id);

  if (!events || events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 border border-red-200 bg-red-50 rounded-lg text-center">
        <Database className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-700 mb-2">No Events Found</h2>
        <p className="text-sm text-red-600 mb-6">
          We connected to Supabase, but there are no events for this Fest yet.
        </p>
      </div>
    );
  }

  const { getStudentRegisteredEventIds, getSubEventRegistrationCounts } = await import("@/actions/event.actions");
  const registeredIds = await getStudentRegisteredEventIds();
  const registrationCounts = await getSubEventRegistrationCounts();

  return (
    <RegistrationsForm fest={activeFest} events={events} initialRegisteredIds={registeredIds} registrationCounts={registrationCounts} />
  );
}
