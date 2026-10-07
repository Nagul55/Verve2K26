import React from "react";
import { getHackathon } from "@/actions/hackathon.actions";
import { notFound } from "next/navigation";
import { HackathonClient } from "./HackathonClient";

import { getUserHackathonTeam } from "@/actions/hackathon.team.actions";
import { createClient } from "@/lib/supabase/server";

export default async function HackathonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hackathonData = await getHackathon(id);
  
  if (!hackathonData || !hackathonData.hackathonDetails) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const userTeam = await getUserHackathonTeam(hackathonData.hackathonDetails.id);

  return (
    <HackathonClient 
      fest={hackathonData} 
      hackathon={hackathonData.hackathonDetails}
      problemStatements={hackathonData.problem_statements}
      userTeam={userTeam}
      currentUserId={user?.id}
    />
  );
}
