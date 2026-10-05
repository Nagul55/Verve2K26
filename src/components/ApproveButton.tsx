"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { approveSubEvent } from "@/actions/event.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ApproveButton({ 
  id, 
  isApproved, 
  coordinatorCount = 0 
}: { 
  id: string; 
  isApproved: boolean; 
  coordinatorCount?: number; 
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isApproved) {
    return (
      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Live
      </span>
    );
  }

  const hasCoordinator = coordinatorCount > 0;

  const handleApprove = () => {
    if (!hasCoordinator) {
      toast.error("Coordinator required — Assign at least one coordinator before approving this event.");
      return;
    }

    startTransition(async () => {
      const res = await approveSubEvent(id);
      if (res.success) {
        toast.success("Event approved and published live!");
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  if (!hasCoordinator) {
    return (
      <div className="relative group inline-block">
        <button
          type="button"
          onClick={() => toast.error("Coordinator required — Assign at least one coordinator before approving this event.")}
          className="bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-70 transition-all"
          title="Assign a coordinator before approving this event."
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          Approve Event
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-eventrix-black text-white text-[11px] font-medium rounded shadow-lg z-50 text-center pointer-events-none">
          Assign a coordinator before approving this event.
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      {isPending ? "Approving..." : "Approve Event"}
    </button>
  );
}
