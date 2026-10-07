import React from "react";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound } from "next/navigation";
import { HackathonClient } from "./HackathonClient";

import { getUserHackathonTeam } from "@/actions/hackathon.team.actions";

export default async function HackathonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hackathonData = await getHackathon(id);
  
  if (!hackathonData || !hackathonData.hackathonDetails) {
    notFound();
  }

  const userTeam = await getUserHackathonTeam(hackathonData.hackathonDetails.id);

  return (
    <HackathonClient 
      fest={hackathonData} 
      hackathon={hackathonData.hackathonDetails}
      problemStatements={hackathonData.problem_statements}
      userTeam={userTeam}
    />
  );
}
