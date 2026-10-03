import React from "react";
import { createClient } from "@/lib/supabase/server";
import ScannerClient from "@/components/coordinator/ScannerClient";

export default async function CoordinatorScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // A Coordinator is assigned an event via app_metadata
  const assignedEventId = user?.app_metadata?.coordinating_event_id || null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Ticket Scanner
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Coordinator Tool: Scan participant QR tickets or perform manual lookup to record event attendance.
        </p>
      </div>

      <ScannerClient assignedEventId={assignedEventId} />
    </div>
  );
}
