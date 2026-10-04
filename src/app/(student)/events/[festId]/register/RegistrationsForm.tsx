"use client";

import React, { useState, useTransition } from "react";
import { Check, Calendar, MapPin, Clock, AlertTriangle } from "lucide-react";
import { registerForEvents } from "@/actions/event.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RegistrationsForm({ fest, events }: { fest: any, events: any[] }) {
  const router = useRouter();
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showTeamStep, setShowTeamStep] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});

  const toggleSelection = (id: string) => {
    setSelectedEventIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectedEvents = events.filter(e => selectedEventIds.includes(e.id));
  const techCount = selectedEvents.filter(e => e.category === 'Technical').length;
  const nonTechCount = selectedEvents.filter(e => e.category === 'Non-Technical').length;

  const meetsTechRule = fest ? techCount >= fest.min_technical : false;
  const meetsNonTechRule = fest ? nonTechCount >= fest.min_non_technical : false;
  const canRegister = meetsTechRule && meetsNonTechRule && !isPending;

  const teamEvents = selectedEvents.filter(e => e.participation_type === 'Team');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canRegister) return;

    if (!showTeamStep && teamEvents.length > 0) {
      setShowTeamStep(true);
      return;
    }

    if (showTeamStep) {
      // Validate all team names are provided
      for (const event of teamEvents) {
        if (!teamNames[event.id]?.trim()) {
          toast.error(`Please provide a team name for ${event.title}`);
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        // Convert string[] back to comma separated for the backend action
        const membersStrMap: Record<string, string> = {};
        Object.entries(teamMembers).forEach(([eventId, emails]) => {
          membersStrMap[eventId] = emails.filter(e => e.trim() !== '').join(',');
        });

        const res = await registerForEvents(
          fest.id, 
          selectedEventIds,
          showTeamStep ? teamNames : undefined,
          showTeamStep ? membersStrMap : undefined
        );
        if (res.success) {
          toast.success("Event registration successful!");
          router.push("/registrations");
        } else {
          toast.error(res.error || "Event registration failed");
        }
      } catch (err: any) {
        toast.error(`Something went wrong: ${err.message || 'Please try again.'}`);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-10 px-4 md:px-0">
      {/* Header */}
      <div>
        <h1 className="font-anton text-3xl md:text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
          Register for {fest?.name || 'Fest'}
        </h1>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm md:text-base">
          {fest?.description || 'Please select the events you wish to participate in below.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 md:gap-10">

        {/* Left Side: Event Selection or Team Details */}
        <div className="flex-1 space-y-8">

          {showTeamStep ? (
            <section className="bg-white p-6 md:p-8 border border-[#D9D9DF] rounded-md shadow-sm">
              <h2 className="text-xl font-bold text-eventrix-black mb-2">Team Details Required</h2>
              <p className="text-sm text-eventrix-muted mb-6">You selected group events. Please provide a team name for each.</p>
              
              <div className="space-y-6">
                {teamEvents.map(event => (
                  <div key={event.id} className="p-4 md:p-6 border border-[#D9D9DF] rounded-md space-y-6 bg-[#F8F8FC]">
                    <div>
                      <label className="text-xs font-bold text-eventrix-black uppercase tracking-widest">{event.title} Team Name</label>
                      <input 
                        type="text" 
                        value={teamNames[event.id] || ''}
                        onChange={(e) => setTeamNames(prev => ({...prev, [event.id]: e.target.value}))}
                        placeholder="e.g. Cyber Ninjas"
                        className="w-full mt-1.5 border border-[#D9D9DF] rounded-md px-4 py-3 bg-white focus:outline-none focus:border-eventrix-lavender text-sm"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-eventrix-black uppercase tracking-widest">Team Members</label>
                        <span className="text-[10px] font-bold bg-[#A78BFA]/10 text-eventrix-lavender px-2 py-1 rounded-sm">Max Size: 4</span>
                      </div>
                      <p className="text-[11px] text-eventrix-muted mb-3">You are automatically the Team Leader. Enter up to 3 additional registered emails. They will receive an invitation to accept and join your team.</p>
                      
                      <div className="space-y-3">
                        {[0, 1, 2].map(index => (
                          <input 
                            key={index}
                            type="email"
                            value={teamMembers[event.id]?.[index] || ''}
                            onChange={(e) => {
                              const currentEmails = [...(teamMembers[event.id] || ['', '', ''])];
                              currentEmails[index] = e.target.value;
                              setTeamMembers(prev => ({...prev, [event.id]: currentEmails}));
                            }}
                            placeholder={`Member ${index + 2} Email (john.doe@example.com)`}
                            className="w-full border border-[#D9D9DF] rounded-md px-4 py-2.5 bg-white focus:outline-none focus:border-eventrix-lavender text-sm"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                type="button"
                onClick={() => setShowTeamStep(false)}
                className="mt-8 text-sm font-bold text-eventrix-muted hover:text-eventrix-black transition-colors"
              >
                ← Back to Selection
              </button>
            </section>
          ) : (
            <>
              {/* Technical Section */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-eventrix-black">Technical Events</h2>
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm ${meetsTechRule ? 'bg-[#20B486]/20 text-[#20B486]' : 'bg-red-500/10 text-red-600'}`}>
                    {techCount} / {fest?.min_technical || 0} Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.filter(e => e.category === 'Technical').map(event => (
                    <div
                      key={event.id}
                      onClick={() => toggleSelection(event.id)}
                      className={`border p-4 md:p-5 rounded-md cursor-pointer transition-all relative overflow-hidden group ${selectedEventIds.includes(event.id)
                          ? 'border-eventrix-lavender bg-eventrix-lavender/5 shadow-[0_4px_12px_rgba(167,139,250,0.15)]'
                          : 'border-[#D9D9DF] bg-eventrix-white hover:border-eventrix-black'
                        }`}
                    >
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedEventIds.includes(event.id) ? 'bg-eventrix-lavender border-eventrix-lavender' : 'border-[#D9D9DF]'
                        }`}>
                        {selectedEventIds.includes(event.id) && <Check className="w-3 h-3 text-eventrix-black stroke-[3]" />}
                      </div>

                      <span className="text-[9px] md:text-[10px] font-bold text-eventrix-lavender uppercase mb-2 block tracking-widest">{event.category} - {event.participation_type}</span>
                      <h4 className="font-bold text-base md:text-lg text-eventrix-black mb-1">{event.title}</h4>
                      <p className="text-[11px] md:text-xs text-eventrix-muted mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-1.5 text-[9px] md:text-[10px] text-eventrix-black font-medium">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Non-Technical Section */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-eventrix-black">Non-Technical Events</h2>
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm ${meetsNonTechRule ? 'bg-[#20B486]/20 text-[#20B486]' : 'bg-red-500/10 text-red-600'}`}>
                    {nonTechCount} / {fest?.min_non_technical || 0} Required
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.filter(e => e.category === 'Non-Technical').map(event => (
                    <div
                      key={event.id}
                      onClick={() => toggleSelection(event.id)}
                      className={`border p-4 md:p-5 rounded-md cursor-pointer transition-all relative overflow-hidden group ${selectedEventIds.includes(event.id)
                          ? 'border-eventrix-lavender bg-eventrix-lavender/5 shadow-[0_4px_12px_rgba(167,139,250,0.15)]'
                          : 'border-[#D9D9DF] bg-eventrix-white hover:border-eventrix-black'
                        }`}
                    >
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedEventIds.includes(event.id) ? 'bg-eventrix-lavender border-eventrix-lavender' : 'border-[#D9D9DF]'
                        }`}>
                        {selectedEventIds.includes(event.id) && <Check className="w-3 h-3 text-eventrix-black stroke-[3]" />}
                      </div>

                      <span className="text-[9px] md:text-[10px] font-bold text-eventrix-lavender uppercase mb-2 block tracking-widest">{event.category} - {event.participation_type}</span>
                      <h4 className="font-bold text-base md:text-lg text-eventrix-black mb-1">{event.title}</h4>
                      <p className="text-[11px] md:text-xs text-eventrix-muted mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-1.5 text-[9px] md:text-[10px] text-eventrix-black font-medium">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

        </div>

        {/* Right Side: Summary & Checkout */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="sticky top-10 border border-[#D9D9DF] bg-eventrix-white p-5 md:p-6 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <h3 className="font-bold text-base md:text-lg text-eventrix-black mb-4 pb-4 border-b border-[#D9D9DF]">Registration Summary</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-eventrix-muted font-medium">Technical Events</span>
                <span className="font-bold text-eventrix-black">{techCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-eventrix-muted font-medium">Non-Technical Events</span>
                <span className="font-bold text-eventrix-black">{nonTechCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base font-bold pt-4 border-t border-[#D9D9DF] text-eventrix-lavender">
                <span>Total Selected</span>
                <span>{selectedEventIds.length}</span>
              </div>
            </div>

            {/* Rules Check */}
            {(!meetsTechRule || !meetsNonTechRule) && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-sm flex gap-3 text-red-600 text-xs font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Missing Requirements:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {!meetsTechRule && <li>Select at least {fest?.min_technical} Technical event.</li>}
                    {!meetsNonTechRule && <li>Select at least {fest?.min_non_technical} Non-Technical event.</li>}
                  </ul>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!canRegister}
              className={`w-full py-3.5 rounded-md font-bold text-xs md:text-sm tracking-wide uppercase transition-all duration-200 ${canRegister
                  ? 'bg-eventrix-black text-eventrix-white shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer'
                  : 'bg-[#D9D9DF] text-[#85858F] cursor-not-allowed'
                }`}
            >
              {isPending ? "Processing..." : (showTeamStep ? "Finalize Registration" : (teamEvents.length > 0 ? "Next: Team Details" : "Complete Registration"))}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
