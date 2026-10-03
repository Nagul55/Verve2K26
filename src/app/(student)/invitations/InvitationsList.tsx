"use client";

import React, { useState } from "react";
import { Check, X, ShieldAlert, Users } from "lucide-react";
import { acceptTeamInvitation, rejectTeamInvitation } from "@/actions/team.actions";
import { useRouter } from "next/navigation";

export function InvitationsList({ invitations }: { invitations: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = async (invitation: any) => {
    setLoadingId(invitation.team_id);
    const res = await acceptTeamInvitation(
      invitation.team_id, 
      invitation.teams.sub_event_id || invitation.teams.event_id, 
      invitation.teams.sub_events.fest_id
    );
    if (res.success) {
      router.push("/registrations");
    } else {
      alert(res.error);
      setLoadingId(null);
    }
  };

  const handleReject = async (teamId: string) => {
    if (!confirm("Are you sure you want to reject this team invitation?")) return;
    setLoadingId(teamId);
    const res = await rejectTeamInvitation(teamId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoadingId(null);
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="p-20 text-center border-2 border-dashed border-[#D9D9DF] rounded-[2px] bg-white">
        <Users className="w-10 h-10 text-[#A98BFF] mx-auto mb-4" />
        <p className="text-[#080A12] font-bold mb-2 text-lg">No Pending Invitations</p>
        <p className="text-[#596078] text-sm max-w-md mx-auto">
          You don't have any pending team invitations at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {invitations.map((inv) => (
        <div key={inv.team_id} className="bg-white border border-[#D9D9DF] p-6 rounded-[2px] relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-[4px] h-full bg-[#A98BFF]"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#A98BFF] uppercase tracking-widest mb-1 block">Team Invitation</span>
              <h3 className="font-['Roboto_Condensed','Anton',sans-serif] font-[800] text-2xl text-[#080A12] uppercase leading-none">
                {inv.teams.team_name}
              </h3>
            </div>
          </div>

          <div className="space-y-2 mb-6 text-sm text-[#596078]">
            <p><strong className="text-[#080A12]">Event:</strong> {inv.teams.sub_events.title}</p>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => handleAccept(inv)}
              disabled={loadingId !== null}
              className="flex-1 bg-[#080A12] text-white py-2.5 rounded-[2px] text-[11px] font-bold tracking-widest uppercase hover:bg-[#A98BFF] hover:text-[#080A12] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> 
              {loadingId === inv.team_id ? "Processing..." : "Accept"}
            </button>
            <button
              onClick={() => handleReject(inv.team_id)}
              disabled={loadingId !== null}
              className="px-4 bg-white border border-[#D9D9DF] text-[#080A12] py-2.5 rounded-[2px] text-[11px] font-bold tracking-widest uppercase hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
