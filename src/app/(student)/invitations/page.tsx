import React from "react";
import { getPendingInvitations } from "@/actions/team.actions";
import { InvitationsList } from "./InvitationsList";

export const metadata = {
  title: "Team Invitations - Eventrix",
};

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const invitations = await getPendingInvitations();

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-0">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-anton text-3xl md:text-[40px] text-[#080A12] leading-none uppercase tracking-wide mb-2">
            Team Invitations
          </h1>
          <p className="text-[#596078] font-medium max-w-2xl text-sm md:text-base">
            Review and accept pending team invitations to finalize your event registrations.
          </p>
        </div>
      </div>

      <InvitationsList invitations={invitations} />
    </div>
  );
}
