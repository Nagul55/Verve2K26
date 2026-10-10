"use client";

import React, { useState, useEffect } from "react";
import { createHackathonTeam, joinHackathonTeam } from "@/actions/hackathon.team.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function HackathonRegistrationClient({ hackathonId, festId, problemStatements, maxTeamSize, minTeamSize }: { 
  hackathonId: string, 
  festId: string,
  problemStatements: any[],
  maxTeamSize: number,
  minTeamSize: number
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");

  // Create Team State
  const [createTeamName, setCreateTeamName] = useState("");
  const [createPasscode, setCreatePasscode] = useState("");

  useEffect(() => {
    // Generate a random 6-character alphanumeric passcode
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreatePasscode(code);
  }, []);

  // Join Team State
  const [joinTeamName, setJoinTeamName] = useState("");
  const [joinPasscode, setJoinPasscode] = useState("");

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTeamName.trim() || !createPasscode.trim()) {
      toast.error("Please fill in team name and passcode.");
      return;
    }

    setLoading(true);
    const result = await createHackathonTeam(hackathonId, festId, createTeamName.trim(), createPasscode.trim());
    setLoading(false);

    if (result.success) {
      toast.success("Team created successfully!");
      router.push(`/hackathons/${festId}`);
    } else {
      toast.error(result.error || "Failed to create team.");
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinTeamName || !joinPasscode) {
      toast.error("Please provide team name and passcode.");
      return;
    }

    setLoading(true);
    const result = await joinHackathonTeam(hackathonId, festId, joinTeamName, joinPasscode);
    setLoading(false);

    if (result.success) {
      toast.success("Successfully joined the team!");
      router.push(`/hackathons/${festId}`);
    } else {
      toast.error(result.error || "Failed to join team.");
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-eventrix-black text-white rounded-t-xl text-center py-8">
        <CardTitle className="font-anton tracking-widest uppercase text-3xl">Team Formation</CardTitle>
        <CardDescription className="text-gray-300">
          Create a new team, or join an existing team using their passcode.
          <br/>
          Team Size Requirement: {minTeamSize} to {maxTeamSize} members.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        
        <div className="flex bg-[#F8F8FC] rounded-lg p-1 mb-8">
          <button 
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase rounded-md transition-colors ${activeTab === "create" ? "bg-white text-eventrix-black shadow-sm" : "text-eventrix-muted hover:text-eventrix-black"}`}
          >
            Create a Team
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("join")}
            className={`flex-1 py-3 text-sm font-bold tracking-widest uppercase rounded-md transition-colors ${activeTab === "join" ? "bg-white text-eventrix-black shadow-sm" : "text-eventrix-muted hover:text-eventrix-black"}`}
          >
            Join a Team
          </button>
        </div>

        {activeTab === "create" && (
          <form onSubmit={handleCreateTeam} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Team Name</label>
              <input 
                type="text" 
                value={createTeamName}
                onChange={(e) => setCreateTeamName(e.target.value)}
                className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender text-sm font-bold text-eventrix-black" 
                placeholder="e.g. Code Ninjas"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Team Passcode (for members to join)</label>
              <input 
                type="text" 
                value={createPasscode}
                onChange={(e) => setCreatePasscode(e.target.value)}
                className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender text-sm font-bold text-eventrix-black" 
                placeholder="Create a secure passcode"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-eventrix-lavender text-white font-bold tracking-widest uppercase py-4 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        )}

        {activeTab === "join" && (
          <form onSubmit={handleJoinTeam} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Team Name</label>
              <input 
                type="text" 
                value={joinTeamName}
                onChange={(e) => setJoinTeamName(e.target.value)}
                className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender text-sm font-bold text-eventrix-black" 
                placeholder="Enter the team name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Team Passcode</label>
              <input 
                type="text" 
                value={joinPasscode}
                onChange={(e) => setJoinPasscode(e.target.value)}
                className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender text-sm font-bold text-eventrix-black" 
                placeholder="Enter the passcode from your team leader"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-eventrix-black text-white font-bold tracking-widest uppercase py-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Team"}
            </button>
          </form>
        )}

      </CardContent>
    </Card>
  );
}
