"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Check, Calendar, MapPin, Clock, AlertTriangle, Users, Timer, XCircle } from "lucide-react";
import { registerForEvents } from "@/actions/event.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseEventData } from "@/components/EventDetailsModal";
import { EventStatusBadge } from "@/components/EventStatusBadge";

export function RegistrationsForm({ 
  fest, 
  events, 
  initialRegisteredIds = [], 
  registrationCounts = {} 
}: { 
  fest: any; 
  events: any[]; 
  initialRegisteredIds?: string[]; 
  registrationCounts?: Record<string, number>; 
}) {
  const router = useRouter();
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showTeamStep, setShowTeamStep] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<Record<string, string[]>>({});
  const [isFestClosed, setIsFestClosed] = useState(false);
  const [festTimerStr, setFestTimerStr] = useState<string | null>(null);

  useEffect(() => {
    if (!fest?.registration_closes_at) return;

    const checkDeadline = () => {
      const now = new Date().getTime();
      const deadline = new Date(fest.registration_closes_at).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsFestClosed(true);
        setFestTimerStr(null);
      } else {
        setIsFestClosed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setFestTimerStr(`${days > 0 ? `${days}d ` : ''}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      }
    };

    checkDeadline();
    const interval = setInterval(checkDeadline, 1000);
    return () => clearInterval(interval);
  }, [fest?.registration_closes_at]);

  const isEventUnavailable = (event: any) => {
    if (isFestClosed) return true;
    if (typeof event.capacity === 'number' && event.capacity > 0) {
      const regCount = registrationCounts[event.id] || 0;
      if (regCount >= event.capacity) return true;
    }
    return false;
  };

  const toggleSelection = (id: string) => {
    if (initialRegisteredIds.includes(id)) return;
    const event = events.find(e => e.id === id);
    if (event && isEventUnavailable(event)) return;
    
    setSelectedEventIds(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectedEvents = events.filter(e => selectedEventIds.includes(e.id));
  const techCount = selectedEvents.filter(e => e.category === 'Technical').length;
  const nonTechCount = selectedEvents.filter(e => e.category === 'Non-Technical').length;

  const totalTechCount = techCount + events.filter(e => e.category === 'Technical' && initialRegisteredIds.includes(e.id)).length;
  const totalNonTechCount = nonTechCount + events.filter(e => e.category === 'Non-Technical' && initialRegisteredIds.includes(e.id)).length;

  const meetsTechRule = fest ? totalTechCount >= fest.min_technical : false;
  const meetsNonTechRule = fest ? totalNonTechCount >= fest.min_non_technical : false;

  const teamEvents = selectedEvents.filter(e => e.participation_type === 'Team');

  // Check if all selected team events meet minimum and maximum candidate bounds
  const validateTeamBounds = () => {
    for (const event of teamEvents) {
      const minSize = event.min_candidates || 1;
      const maxSize = event.max_candidates || 1;
      const enteredEmails = (teamMembers[event.id] || []).filter(e => e.trim() !== '');
      const totalTeamSize = 1 + enteredEmails.length; // Leader + entered members

      if (totalTeamSize < minSize || totalTeamSize > maxSize) {
        return false;
      }
    }
    return true;
  };

  const canRegister = meetsTechRule && meetsNonTechRule && selectedEventIds.length > 0 && !isPending && !isFestClosed && (!showTeamStep || validateTeamBounds());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFestClosed) {
      toast.error("Registration for this fest has closed.");
      return;
    }

    if (!canRegister && !showTeamStep) {
      toast.error("Please meet all event registration requirements before proceeding.");
      return;
    }

    if (!showTeamStep && teamEvents.length > 0) {
      setShowTeamStep(true);
      return;
    }

    if (showTeamStep) {
      for (const event of teamEvents) {
        const minSize = event.min_candidates || 1;
        const maxSize = event.max_candidates || 1;
        
        if (!teamNames[event.id]?.trim()) {
          toast.error(`Please provide a team name for ${event.title}`);
          return;
        }

        const enteredEmails = (teamMembers[event.id] || []).filter(e => e.trim() !== '');
        const totalTeamSize = 1 + enteredEmails.length;

        if (totalTeamSize < minSize) {
          toast.error(`"${event.title}" requires at least ${minSize} members (including Team Leader). Current team size is ${totalTeamSize}.`);
          return;
        }

        if (totalTeamSize > maxSize) {
          toast.error(`"${event.title}" allows at most ${maxSize} members. Current team size is ${totalTeamSize}.`);
          return;
        }

        // Check for duplicates
        const uniqueEmails = new Set(enteredEmails.map(e => e.toLowerCase().trim()));
        if (uniqueEmails.size !== enteredEmails.length) {
          toast.error(`Duplicate member email entered for "${event.title}".`);
          return;
        }
      }
    }

    startTransition(async () => {
      try {
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
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="font-anton text-3xl md:text-[40px] text-eventrix-black leading-none uppercase tracking-wide">
            Register for {fest?.name || 'Fest'}
          </h1>
          {fest?.registration_closes_at && (
            isFestClosed ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded border border-red-200">
                <XCircle className="w-4 h-4" /> Registration Closed
              </span>
            ) : (
              festTimerStr && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-3 py-1 rounded border border-purple-200 font-mono">
                  <Timer className="w-4 h-4 text-eventrix-lavender" /> Closes in: {festTimerStr}
                </span>
              )
            )
          )}
        </div>
        <p className="text-eventrix-muted font-medium max-w-2xl text-sm md:text-base">
          {fest?.description || 'Please select the events you wish to participate in below.'}
        </p>

        {isFestClosed && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            Registration for this fest has closed. New registrations are no longer accepted.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 md:gap-10">

        {/* Left Side: Event Selection or Team Details */}
        <div className="flex-1 space-y-8">

          {showTeamStep ? (
            <section className="bg-white p-6 md:p-8 border border-[#D9D9DF] rounded-md shadow-sm">
              <h2 className="text-xl font-bold text-eventrix-black mb-2">Team Details Required</h2>
              <p className="text-sm text-eventrix-muted mb-6">You selected group events. Please configure your team details for each event below.</p>
              
              <div className="space-y-8">
                {teamEvents.map(event => {
                  const minCandidates = event.min_candidates || 1;
                  const maxCandidates = event.max_candidates || 1;
                  const additionalMin = Math.max(0, minCandidates - 1);
                  const additionalMax = Math.max(0, maxCandidates - 1);

                  const enteredEmails = (teamMembers[event.id] || []).filter(e => e.trim() !== '');
                  const currentTotalSize = 1 + enteredEmails.length; // Team leader + members
                  const isValidSize = currentTotalSize >= minCandidates && currentTotalSize <= maxCandidates;

                  return (
                    <div key={event.id} className="p-4 md:p-6 border border-[#D9D9DF] rounded-md space-y-6 bg-[#F8F8FC]">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 border-b border-[#D9D9DF] pb-4">
                        <div>
                          <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black">{event.title}</h3>
                          <p className="text-xs font-bold text-eventrix-muted">
                            TEAM SIZE: <span className="text-eventrix-black font-semibold">{minCandidates} – {maxCandidates} Members</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-3 py-1 rounded-sm ${
                            isValidSize ? 'bg-[#20B486]/20 text-[#20B486]' : 'bg-red-500/10 text-red-600'
                          }`}>
                            Team Size: {currentTotalSize} / {maxCandidates} (Min: {minCandidates})
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-eventrix-black uppercase tracking-widest block mb-1">
                          Team Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          value={teamNames[event.id] || ''}
                          onChange={(e) => setTeamNames(prev => ({...prev, [event.id]: e.target.value}))}
                          placeholder="e.g. Cyber Ninjas"
                          className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-white focus:outline-none focus:border-eventrix-lavender text-sm font-medium"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-eventrix-lavender" /> Team Members
                          </label>
                          <span className="text-[11px] font-bold text-eventrix-muted">
                            Min: {minCandidates} | Max: {maxCandidates}
                          </span>
                        </div>
                        
                        <div className="p-3 bg-[#A78BFA]/10 border border-[#A78BFA]/30 rounded-md text-xs text-eventrix-black font-medium mb-4">
                          <p className="font-bold text-eventrix-lavender mb-1">Team Requirements:</p>
                          <p className="text-eventrix-muted">
                            You are automatically the <strong>Team Leader</strong>. Add <strong>{additionalMin}–{additionalMax} additional</strong> registered member emails.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          {Array.from({ length: additionalMax }).map((_, index) => {
                            const memberNum = index + 2;
                            const isRequiredField = index < additionalMin;

                            return (
                              <div key={index} className="space-y-1">
                                <label className="text-[11px] font-bold text-eventrix-muted flex items-center justify-between">
                                  <span>Member {memberNum} Email {isRequiredField ? <span className="text-red-500">* (Required)</span> : <span className="text-gray-400 font-normal">(Optional)</span>}</span>
                                </label>
                                <input 
                                  type="email"
                                  value={teamMembers[event.id]?.[index] || ''}
                                  onChange={(e) => {
                                    const currentEmails = [...(teamMembers[event.id] || Array(additionalMax).fill(''))];
                                    currentEmails[index] = e.target.value;
                                    setTeamMembers(prev => ({...prev, [event.id]: currentEmails}));
                                  }}
                                  placeholder={`Member ${memberNum} Registered Email`}
                                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-2.5 bg-white focus:outline-none focus:border-eventrix-lavender text-sm"
                                  required={isRequiredField}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Status Notice */}
                        <div className="mt-4 pt-3 border-t border-[#D9D9DF] text-xs font-bold">
                          {currentTotalSize < minCandidates ? (
                            <p className="text-red-600 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              Add at least {minCandidates - currentTotalSize} more member(s) to meet minimum team size of {minCandidates}.
                            </p>
                          ) : currentTotalSize > maxCandidates ? (
                            <p className="text-red-600 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              Maximum team size is {maxCandidates} members. Please remove extra members.
                            </p>
                          ) : (
                            <p className="text-emerald-600 flex items-center gap-1.5">
                              <Check className="w-4 h-4 shrink-0 stroke-[3]" />
                              Team size valid ({currentTotalSize} / {maxCandidates} members). {maxCandidates - currentTotalSize > 0 ? `${maxCandidates - currentTotalSize} slot(s) remaining.` : 'Team is full.'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                    {meetsTechRule ? 'Requirement Met ✓' : `${totalTechCount} / ${fest?.min_technical || 0} Required`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.filter(e => e.category === 'Technical').map(event => {
                    const isAlreadyReg = initialRegisteredIds.includes(event.id);
                    const isUnavailable = isEventUnavailable(event) && !isAlreadyReg;
                    const minCandidates = event.min_candidates || 1;
                    const maxCandidates = event.max_candidates || 1;

                    return (
                    <div
                      key={event.id}
                      onClick={() => toggleSelection(event.id)}
                      className={`border p-4 md:p-5 rounded-md transition-all relative overflow-hidden group ${
                        isAlreadyReg
                          ? 'border-[#D9D9DF] bg-gray-50 opacity-60 cursor-not-allowed'
                          : isUnavailable 
                            ? 'border-red-100 bg-red-50/30 opacity-70 cursor-not-allowed'
                            : selectedEventIds.includes(event.id)
                              ? 'border-eventrix-lavender bg-eventrix-lavender/5 shadow-[0_4px_12px_rgba(167,139,250,0.15)] cursor-pointer'
                              : 'border-[#D9D9DF] bg-eventrix-white hover:border-eventrix-black cursor-pointer'
                      }`}
                    >
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isAlreadyReg 
                          ? 'bg-gray-200 border-gray-300' 
                          : isUnavailable
                            ? 'bg-red-50 border-red-200'
                            : selectedEventIds.includes(event.id) 
                              ? 'bg-eventrix-lavender border-eventrix-lavender' 
                              : 'border-[#D9D9DF]'
                      }`}>
                        {(isAlreadyReg || selectedEventIds.includes(event.id)) && <Check className={`w-3 h-3 stroke-[3] ${isAlreadyReg ? 'text-gray-400' : 'text-eventrix-black'}`} />}
                        {isUnavailable && !isAlreadyReg && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                      </div>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[9px] md:text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">{event.category} - {event.participation_type}</span>
                        {event.participation_type === "Team" && (
                          <span className="text-[9px] font-bold bg-[#A78BFA]/10 text-eventrix-black px-2 py-0.5 rounded border border-[#A78BFA]/30">
                            Min: {minCandidates} | Max: {maxCandidates}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base md:text-lg text-eventrix-black mb-1">{event.title}</h4>
                      <p className="text-[11px] md:text-xs text-eventrix-muted mb-4 line-clamp-2">{parseEventData(event).cleanDescription}</p>

                      <div className="mb-4">
                        <EventStatusBadge 
                          date={event.date} 
                          time={event.time} 
                          capacity={event.capacity} 
                          registeredCount={registrationCounts[event.id]}
                          festRegistrationClosesAt={fest?.registration_closes_at} 
                        />
                      </div>

                      <div className="space-y-1.5 text-[9px] md:text-[10px] text-eventrix-black font-medium">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                      </div>
                    </div>
                  )})}
                </div>
              </section>

              {/* Non-Technical Section */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-eventrix-black">Non-Technical Events</h2>
                  <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-sm ${meetsNonTechRule ? 'bg-[#20B486]/20 text-[#20B486]' : 'bg-red-500/10 text-red-600'}`}>
                    {meetsNonTechRule ? 'Requirement Met ✓' : `${totalNonTechCount} / ${fest?.min_non_technical || 0} Required`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.filter(e => e.category === 'Non-Technical').map(event => {
                    const isAlreadyReg = initialRegisteredIds.includes(event.id);
                    const isUnavailable = isEventUnavailable(event) && !isAlreadyReg;
                    const minCandidates = event.min_candidates || 1;
                    const maxCandidates = event.max_candidates || 1;

                    return (
                    <div
                      key={event.id}
                      onClick={() => toggleSelection(event.id)}
                      className={`border p-4 md:p-5 rounded-md transition-all relative overflow-hidden group ${
                        isAlreadyReg
                          ? 'border-[#D9D9DF] bg-gray-50 opacity-60 cursor-not-allowed'
                          : isUnavailable 
                            ? 'border-red-100 bg-red-50/30 opacity-70 cursor-not-allowed'
                            : selectedEventIds.includes(event.id)
                              ? 'border-eventrix-lavender bg-eventrix-lavender/5 shadow-[0_4px_12px_rgba(167,139,250,0.15)] cursor-pointer'
                              : 'border-[#D9D9DF] bg-eventrix-white hover:border-eventrix-black cursor-pointer'
                      }`}
                    >
                      <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isAlreadyReg 
                          ? 'bg-gray-200 border-gray-300' 
                          : isUnavailable
                            ? 'bg-red-50 border-red-200'
                            : selectedEventIds.includes(event.id) 
                              ? 'bg-eventrix-lavender border-eventrix-lavender' 
                              : 'border-[#D9D9DF]'
                      }`}>
                        {(isAlreadyReg || selectedEventIds.includes(event.id)) && <Check className={`w-3 h-3 stroke-[3] ${isAlreadyReg ? 'text-gray-400' : 'text-eventrix-black'}`} />}
                        {isUnavailable && !isAlreadyReg && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                      </div>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[9px] md:text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">{event.category} - {event.participation_type}</span>
                        {event.participation_type === "Team" && (
                          <span className="text-[9px] font-bold bg-[#A78BFA]/10 text-eventrix-black px-2 py-0.5 rounded border border-[#A78BFA]/30">
                            Min: {minCandidates} | Max: {maxCandidates}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-base md:text-lg text-eventrix-black mb-1">{event.title}</h4>
                      <p className="text-[11px] md:text-xs text-eventrix-muted mb-4 line-clamp-2">{parseEventData(event).cleanDescription}</p>

                      <div className="mb-4">
                        <EventStatusBadge 
                          date={event.date} 
                          time={event.time} 
                          capacity={event.capacity} 
                          registeredCount={registrationCounts[event.id]}
                          festRegistrationClosesAt={fest?.registration_closes_at} 
                        />
                      </div>

                      <div className="space-y-1.5 text-[9px] md:text-[10px] text-eventrix-black font-medium">
                        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}</div>
                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}</div>
                      </div>
                    </div>
                  )})}
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
            {(!meetsTechRule || !meetsNonTechRule) && !isFestClosed && (
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
              {isPending 
                ? "Processing..." 
                : isFestClosed
                  ? "REGISTRATION CLOSED"
                  : (showTeamStep ? "Finalize Registration" : (teamEvents.length > 0 ? "Next: Team Details" : "Complete Registration"))}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
