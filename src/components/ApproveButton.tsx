"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { approveSubEvent } from "@/actions/event.actions";
import { useRouter } from "next/navigation";

export function ApproveButton({ id, isApproved }: { id: string, isApproved: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isApproved) {
    return (
      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Live
      </span>
    );
  }

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveSubEvent(id);
      if (res.success) {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isPending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
    >
      <ShieldCheck className="w-3.5 h-3.5" />
      {isPending ? "Approving..." : "Approve Event"}
    </button>
  );
}
