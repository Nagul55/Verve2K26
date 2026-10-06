import React from "react";
import ScannerClient from "@/components/coordinator/ScannerClient";
import { getCoordinatorAssignedEventIds } from "@/actions/event.actions";
import { getCurrentUser } from "@/lib/auth/get-user";

export default async function CoordinatorScannerPage() {
  const { user } = await getCurrentUser();
  
  const { assignedEventIds, role } = user ? await getCoordinatorAssignedEventIds(user.id) : { assignedEventIds: [], role: 'coordinator' };
  const isAdmin = role === 'admin' || role === 'Super Admin';

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

      <ScannerClient assignedEventIds={assignedEventIds} isAdmin={isAdmin} />
    </div>
  );
}
