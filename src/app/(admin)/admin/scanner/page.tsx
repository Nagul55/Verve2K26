import React from "react";
import ScannerClient from "@/components/coordinator/ScannerClient";

export default function QRScannerPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Ticket Scanner (Admin Mode)
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
          Administrator Tool: Scan participant QR tickets or perform manual lookup to record event attendance across all activities.
        </p>
      </div>

      <ScannerClient isAdmin={true} />
    </div>
  );
}

