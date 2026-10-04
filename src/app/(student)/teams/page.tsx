"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Users, Plus } from "lucide-react";
import { getSubEvents } from "@/actions/event.actions";
import { createTeam } from "@/actions/team.actions";
import { toast } from "sonner";
import { EventrixSelect } from "@/components/ui/EventrixSelect";

export default function TeamsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadEvents() {
      const dbEvents = await getSubEvents();
      // Filter only Team events if we had that flag, or just show all for now
      setEvents(dbEvents || []);
    }
    loadEvents();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !leaderEmail || !selectedEventId) return;

    startTransition(async () => {
      const res = await createTeam(teamName, selectedEventId, leaderEmail);
      if (res.success) {
        toast.success("Team created successfully!");
        setTeamName("");
      } else {
        toast.error(res.error || "An error occurred");
      }
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Team Portal
        </h1>
        <p className="text-eventrix-muted font-medium text-sm">
          Create or join a team for group events. You must be registered for the event individually first!
        </p>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Users className="text-eventrix-lavender w-5 h-5" />
          Register a New Team
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <EventrixSelect
            label="Select Event"
            name="selectedEventId"
            required
            placeholder="-- Choose an Event --"
            value={selectedEventId}
            onChange={(val) => setSelectedEventId(val)}
            options={events.map((event) => ({ value: event.id, label: event.title }))}
            searchable
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Team Name</label>
            <input 
              type="text" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Cyber Ninjas"
              className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Leader Registration Email</label>
            <input 
              type="email" 
              value={leaderEmail}
              onChange={(e) => setLeaderEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white transition-colors text-sm font-medium"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-eventrix-black text-eventrix-white py-4 rounded-md font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-eventrix-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? "Creating Team..." : <><Plus className="w-4 h-4" /> Create Team</>}
          </button>
        </form>
      </div>
    </div>
  );
}
