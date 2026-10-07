import React from "react";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound, redirect } from "next/navigation";
import { HackathonRegistrationClient } from "./HackathonRegistrationClient";
import { getUserHackathonTeam } from "@/actions/hackathon.team.actions";

export default async function HackathonRegistrationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hackathonData = await getHackathon(id);
  
  if (!hackathonData || !hackathonData.hackathonDetails) {
    notFound();
  }

  const { hackathonDetails, problem_statements: problemStatements } = hackathonData;

  const userTeam = await getUserHackathonTeam(hackathonDetails.id);
  if (userTeam) {
    // If they already have a team for this hackathon, redirect them back to the hackathon view
    redirect(`/hackathons/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#F8F8FC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-8 text-center">
          Register for {hackathonData.name}
        </h1>
        
        <HackathonRegistrationClient 
          hackathonId={hackathonDetails.id} 
          festId={id}
          problemStatements={problemStatements || []}
          minTeamSize={hackathonDetails.minimum_team_size || 1}
          maxTeamSize={hackathonDetails.maximum_team_size || 4}
        />
      </div>
    </div>
  );
}
