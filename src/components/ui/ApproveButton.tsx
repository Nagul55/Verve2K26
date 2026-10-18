"use client";

import React, { useTransition } from "react";
import { CheckCircle2, ShieldCheck, PauseCircle, PlayCircle, XCircle } from "lucide-react";
import { approveSubEvent, toggleSubEventLiveStatus } from "@/actions/event.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isEventOver } from "@/lib/utils/event-status";

export function ApproveButton({ 
  id, 
  status,
  isApproved, 
  coordinatorCount = 0,
  date,
  time
}: { 
  id: string; 
  status?: string;
  isApproved?: boolean; 
  coordinatorCount?: number;
  date?: string;
  time?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const rawStatus = status || (isApproved ? 'LIVE' : 'DRAFT');
  const eventHasEnded = isEventOver({ status: rawStatus, date, time });
  const currentStatus = eventHasEnded ? 'COMPLETED' : rawStatus;
  const hasCoordinator = coordinatorCount > 0;

  const handleToggle = (targetStatus: 'LIVE' | 'CLOSED' | 'COMPLETED') => {
    if (targetStatus === 'LIVE' && !hasCoordinator) {
      toast.error("Coordinator required — Assign at least one coordinator before setting this event live.");
      return;
    }

    startTransition(async () => {
      const res = await toggleSubEventLiveStatus(id, targetStatus);
      if (res.success) {
        if (targetStatus === 'CLOSED') {
          toast.success("Event stopped and closed for registrations.");
        } else if (targetStatus === 'COMPLETED') {
          toast.success("Event marked as completed.");
        } else {
          toast.success("Event reopened and published live!");
        }
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

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

  // 0. COMPLETED STATUS: If event is over or marked COMPLETED, it is NOT live!
  if (currentStatus === 'COMPLETED') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-purple-600" /> Completed
        </span>
      </div>
    );
  }

  // 1. LIVE STATUS: Show LIVE badge + One-Click "Stop Live" button
  if (currentStatus === 'LIVE') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 shrink-0">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
        </span>
        <button
          onClick={() => handleToggle('CLOSED')}
          disabled={isPending}
          type="button"
          title="Stop Live — Close registrations for this event"
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-150 flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <PauseCircle className="w-3 h-3" />
          {isPending ? "..." : "Stop Live"}
        </button>
      </div>
    );
  }

  // 2. CLOSED STATUS: Show CLOSED badge + One-Click "Reopen" button
  if (currentStatus === 'CLOSED') {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1 shrink-0">
          <XCircle className="w-3 h-3 text-red-600" /> Closed
        </span>
        <button
          onClick={() => handleToggle('LIVE')}
          disabled={isPending}
          type="button"
          title="Reopen — Open registrations and set live"
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-150 flex items-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <PlayCircle className="w-3 h-3" />
          {isPending ? "..." : "Reopen"}
        </button>
      </div>
    );
  }

  // 3. PENDING / DRAFT without coordinator
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

  // 4. PENDING / DRAFT with coordinator ready
  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      type="button"
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      {isPending ? "Approving..." : "Approve Event"}
    </button>
  );
}
