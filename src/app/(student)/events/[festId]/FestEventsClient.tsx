"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, ArrowLeft, ArrowRight, Check, Timer, XCircle, Code, Users, Trophy, GraduationCap, FileText, Download, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { EventDetailsModal, SubEvent, parseEventData } from "@/components/EventDetailsModal";
import { EventStatusBadge } from "@/components/EventStatusBadge";

interface FestEventsClientProps {
  fest: any;
  events: SubEvent[];
  initialRegisteredIds: string[];
  registrationCounts: Record<string, number>;
  hackathonData?: any;
}

export function FestEventsClient({
  fest,
  events,
  initialRegisteredIds,
  registrationCounts,
  hackathonData
}: FestEventsClientProps) {
  const [selectedEvent, setSelectedEvent] = useState<SubEvent | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>(initialRegisteredIds);
  const [isFestClosed, setIsFestClosed] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);

  const isHackathon = fest?.event_type === 'hackathon';
  const hDetails = hackathonData?.hackathonDetails;
  const pStatements = hackathonData?.problem_statements || [];
  const coords = hackathonData?.coordinatorDetails || [];

  useEffect(() => {
    if (!fest.registration_closes_at) return;

    const updateFestCountdown = () => {
      const now = new Date().getTime();
      const deadline = new Date(fest.registration_closes_at).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsFestClosed(true);
        setTimeLeftStr(null);
      } else {
        setIsFestClosed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const pad = (n: number) => n.toString().padStart(2, '0');
        setTimeLeftStr(`${days > 0 ? `${days}d ` : ''}${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      }
    };

    updateFestCountdown();
    const interval = setInterval(updateFestCountdown, 1000);
    return () => clearInterval(interval);
  }, [fest.registration_closes_at]);

  const techEvents = events.filter((e) => e.category === "Technical");
  const nonTechEvents = events.filter((e) => e.category === "Non-Technical");

  // Check if student is already registered for this hackathon
  const isRegisteredForHackathon = events.some(e => initialRegisteredIds.includes(e.id));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button & Header */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-eventrix-muted uppercase tracking-widest hover:text-eventrix-black transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fests & Hackathons
        </Link>

        {isHackathon ? (
          <div className="bg-white border border-[#D9D9DF] rounded-lg p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#D9D9DF] pb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white rounded text-xs font-bold uppercase tracking-wider">
                    <Code className="w-3.5 h-3.5" /> Hackathon
                  </span>
                  {hDetails?.mode && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-eventrix-lavender/20 text-eventrix-black border border-eventrix-lavender/40 rounded text-xs font-bold uppercase tracking-wider">
                      {hDetails.mode}
                    </span>
                  )}
                  {fest.registration_closes_at && (
                    isFestClosed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded border border-red-200">
                        <XCircle className="w-4 h-4" /> Registration Closed
                      </span>
                    ) : (
                      timeLeftStr && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-3 py-1 rounded border border-purple-200 font-mono">
                          <Timer className="w-4 h-4" /> CLOSES IN: {timeLeftStr}
                        </span>
                      )
                    )
                  )}
                </div>
                <h1 className="font-anton text-3xl md:text-5xl text-eventrix-black uppercase tracking-wide">
                  {fest.name}
                </h1>
                {hDetails?.tagline && (
                  <p className="text-eventrix-lavender font-bold text-base md:text-lg mt-1">
                    {hDetails.tagline}
                  </p>
                )}
                {fest.description && (
                  <p className="text-eventrix-muted font-medium text-sm md:text-base mt-2 max-w-3xl">
                    {fest.description}
                  </p>
                )}
              </div>

              <div className="w-full md:w-auto shrink-0">
                {isRegisteredForHackathon ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3.5 rounded-md text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 stroke-[3]" /> Registered
                  </div>
                ) : isFestClosed ? (
                  <button
                    disabled
                    className="w-full md:w-auto bg-[#D9D9DF] text-[#85858F] px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Registration Closed
                  </button>
                ) : (
                  <Link
                    href={`/events/${fest.id}/register`}
                    className="w-full md:w-auto bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] flex items-center justify-center gap-2"
                  >
                    Register Team Now <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-wider block mb-1">Team Size</span>
                <span className="font-bold text-eventrix-black text-sm md:text-base flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-eventrix-lavender" />
                  {hDetails?.minimum_team_size || 1} – {hDetails?.maximum_team_size || 4} Members
                </span>
              </div>

              <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-wider block mb-1">Max Teams</span>
                <span className="font-bold text-eventrix-black text-sm md:text-base flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-eventrix-lavender" />
                  {hDetails?.maximum_teams || 50} Teams
                </span>
              </div>

              <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-wider block mb-1">Venue</span>
                <span className="font-bold text-eventrix-black text-sm md:text-base flex items-center gap-1.5 truncate">
                  <MapPin className="w-4 h-4 text-eventrix-lavender shrink-0" />
                  {hDetails?.venue || 'Main Campus'}
                </span>
              </div>

              <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-wider block mb-1">Eligibility</span>
                <span className="font-bold text-eventrix-black text-sm md:text-base flex items-center gap-1.5 truncate">
                  <GraduationCap className="w-4 h-4 text-eventrix-lavender shrink-0" />
                  {hDetails?.eligibility_type || 'Open to All'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide">
                  {fest.name} Events
                </h1>
                {fest.registration_closes_at && (
                  isFestClosed ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-red-100 text-red-700 px-3 py-1 rounded border border-red-200">
                      <XCircle className="w-4 h-4" /> Registration Closed
                    </span>
                  ) : (
                    timeLeftStr && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-3.5 py-1.5 rounded-md border border-purple-200 font-mono shadow-sm">
                        <Timer className="w-4 h-4" /> CLOSES IN: {timeLeftStr}
                      </span>
                    )
                  )
                )}
              </div>
              <p className="text-eventrix-muted font-medium max-w-2xl">
                {fest.description}
              </p>
            </div>

            {isFestClosed ? (
              <button
                disabled
                className="bg-[#D9D9DF] text-[#85858F] px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase cursor-not-allowed flex items-center gap-2"
                title="Registration for this fest has closed."
              >
                Registration Closed
              </button>
            ) : (
              <Link
                href={`/events/${fest.id}/register`}
                className="bg-eventrix-black text-white px-8 py-4 rounded-md text-sm font-bold tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] flex items-center gap-2"
              >
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Main Hackathon Details Content */}
      {isHackathon ? (
        <div className="space-y-8">
          {/* Key Hackathon Dates */}
          <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-eventrix-lavender" /> Schedule & Deadlines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {hDetails?.hackathon_starts_at && (
                <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                  <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Hackathon Window</span>
                  <p className="text-xs font-bold text-eventrix-black">
                    Start: {new Date(hDetails.hackathon_starts_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                  {hDetails?.hackathon_ends_at && (
                    <p className="text-xs font-bold text-eventrix-black mt-1">
                      End: {new Date(hDetails.hackathon_ends_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  )}
                </div>
              )}

              {fest?.registration_closes_at && (
                <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                  <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Registration Closes</span>
                  <p className="text-xs font-bold text-eventrix-black">
                    {new Date(fest.registration_closes_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              )}

              {(hDetails?.abstract_submission_deadline || hDetails?.project_submission_deadline || hDetails?.demo_pitch_date) && (
                <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                  <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Submission Deadlines</span>
                  {hDetails?.abstract_submission_deadline && (
                    <p className="text-xs font-medium text-eventrix-black">
                      Abstract: {new Date(hDetails.abstract_submission_deadline).toLocaleDateString('en-IN')}
                    </p>
                  )}
                  {hDetails?.project_submission_deadline && (
                    <p className="text-xs font-medium text-eventrix-black">
                      Project: {new Date(hDetails.project_submission_deadline).toLocaleDateString('en-IN')}
                    </p>
                  )}
                  {hDetails?.demo_pitch_date && (
                    <p className="text-xs font-medium text-eventrix-black">
                      Pitch/Demo: {new Date(hDetails.demo_pitch_date).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Theme & Problem Statement */}
          <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-eventrix-lavender" /> Theme & Problem Statements
            </h3>
            
            {hDetails?.theme && (
              <div>
                <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Theme / Domain</span>
                <span className="inline-block bg-[#A78BFA]/10 border border-[#A78BFA]/30 px-3 py-1.5 rounded text-xs font-bold text-eventrix-black">
                  {hDetails.theme} {hDetails?.domain ? `(${hDetails.domain})` : ''}
                </span>
              </div>
            )}

            {hDetails?.problem_statement_description && (
              <div>
                <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Challenge Overview</span>
                <p className="text-sm text-eventrix-black font-medium whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded-md border border-[#D9D9DF]">
                  {hDetails.problem_statement_description}
                </p>
              </div>
            )}

            {/* Attached Problem Statement Documents */}
            {pStatements.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-eventrix-muted uppercase block mb-2">Problem Statement Documents & Files</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pStatements.map((ps: any) => (
                    <a
                      key={ps.id}
                      href={ps.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-[#D9D9DF] rounded-md hover:border-eventrix-black hover:bg-[#F8F8FC] transition-all group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-eventrix-lavender shrink-0" />
                        <span className="text-xs font-bold text-eventrix-black truncate">{ps.file_name}</span>
                      </div>
                      <Download className="w-4 h-4 text-eventrix-muted group-hover:text-eventrix-black shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tech Stack & Submission Requirements */}
          {(hDetails?.required_tech_stack || hDetails?.github_url_required || hDetails?.demo_video_required || hDetails?.ppt_required || hDetails?.report_required || hDetails?.live_demo_required) && (
            <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
                <Code className="w-5 h-5 text-eventrix-lavender" /> Tech Stack & Submission Requirements
              </h3>

              {hDetails?.required_tech_stack && (
                <div>
                  <span className="text-xs font-bold text-eventrix-muted uppercase block mb-2">Required / Recommended Tech Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {hDetails.required_tech_stack.split(',').map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-bold text-eventrix-black">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-eventrix-muted uppercase block mb-2">Required Deliverables</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className={`p-3 rounded border text-center text-xs font-bold ${hDetails?.github_url_required ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    GitHub Repo {hDetails?.github_url_required ? '✓' : 'Optional'}
                  </div>
                  <div className={`p-3 rounded border text-center text-xs font-bold ${hDetails?.demo_video_required ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    Demo Video {hDetails?.demo_video_required ? '✓' : 'Optional'}
                  </div>
                  <div className={`p-3 rounded border text-center text-xs font-bold ${hDetails?.ppt_required ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    PPT Presentation {hDetails?.ppt_required ? '✓' : 'Optional'}
                  </div>
                  <div className={`p-3 rounded border text-center text-xs font-bold ${hDetails?.report_required ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    Project Report {hDetails?.report_required ? '✓' : 'Optional'}
                  </div>
                  <div className={`p-3 rounded border text-center text-xs font-bold ${hDetails?.live_demo_required ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                    Live Demo {hDetails?.live_demo_required ? '✓' : 'Optional'}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Prizes */}
          {(hDetails?.prize_1st || hDetails?.prize_2nd || hDetails?.prize_3rd || hDetails?.special_prizes) && (
            <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-4">
              <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Prizes & Recognition
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {hDetails?.prize_1st && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center">
                    <span className="text-xs font-bold uppercase text-amber-700 block mb-1">🥇 1st Prize</span>
                    <span className="font-bold text-eventrix-black text-base">{hDetails.prize_1st}</span>
                  </div>
                )}
                {hDetails?.prize_2nd && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center">
                    <span className="text-xs font-bold uppercase text-slate-700 block mb-1">🥈 2nd Prize</span>
                    <span className="font-bold text-eventrix-black text-base">{hDetails.prize_2nd}</span>
                  </div>
                )}
                {hDetails?.prize_3rd && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-md text-center">
                    <span className="text-xs font-bold uppercase text-orange-700 block mb-1">🥉 3rd Prize</span>
                    <span className="font-bold text-eventrix-black text-base">{hDetails.prize_3rd}</span>
                  </div>
                )}
              </div>

              {hDetails?.special_prizes && (
                <div className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md">
                  <span className="text-xs font-bold text-eventrix-muted uppercase block mb-1">Special Track Prizes</span>
                  <p className="text-xs font-bold text-eventrix-black">{hDetails.special_prizes}</p>
                </div>
              )}
            </section>
          )}

          {/* Rules & Guidelines */}
          {(hDetails?.rules || hDetails?.participation_guidelines || hDetails?.submission_guidelines || hDetails?.judging_criteria || hDetails?.code_of_conduct) && (
            <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-6">
              <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
                <FileText className="w-5 h-5 text-eventrix-lavender" /> Rules & Guidelines
              </h3>

              {hDetails?.rules && (
                <div>
                  <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">Rules & Regulations</h4>
                  <p className="text-xs text-eventrix-muted whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded border border-[#D9D9DF]">
                    {hDetails.rules}
                  </p>
                </div>
              )}

              {hDetails?.participation_guidelines && (
                <div>
                  <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">Participation Guidelines</h4>
                  <p className="text-xs text-eventrix-muted whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded border border-[#D9D9DF]">
                    {hDetails.participation_guidelines}
                  </p>
                </div>
              )}

              {hDetails?.submission_guidelines && (
                <div>
                  <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">Submission Guidelines</h4>
                  <p className="text-xs text-eventrix-muted whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded border border-[#D9D9DF]">
                    {hDetails.submission_guidelines}
                  </p>
                </div>
              )}

              {hDetails?.judging_criteria && (
                <div>
                  <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">Judging Criteria</h4>
                  <p className="text-xs text-eventrix-muted whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded border border-[#D9D9DF]">
                    {hDetails.judging_criteria}
                  </p>
                </div>
              )}

              {hDetails?.code_of_conduct && (
                <div>
                  <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider mb-1">Code of Conduct</h4>
                  <p className="text-xs text-eventrix-muted whitespace-pre-wrap bg-[#F8F8FC] p-4 rounded border border-[#D9D9DF]">
                    {hDetails.code_of_conduct}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Assigned Coordinator Contacts (Fetched dynamically from DB) */}
          <section className="bg-white border border-[#D9D9DF] rounded-lg p-6 shadow-sm space-y-4">
            <h3 className="font-anton text-xl uppercase tracking-wide text-eventrix-black flex items-center gap-2">
              <Phone className="w-5 h-5 text-eventrix-lavender" /> Event Coordinator Contact
            </h3>
            
            {coords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coords.map((c: any, index: number) => (
                  <div key={index} className="p-4 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md space-y-2">
                    <span className="font-bold text-sm text-eventrix-black block">{c.name || 'Assigned Coordinator'}</span>
                    <div className="space-y-1 text-xs text-eventrix-muted font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-eventrix-lavender shrink-0" />
                        <span className="text-eventrix-black font-semibold">{c.phone || 'Not Provided'}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-eventrix-lavender shrink-0" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-eventrix-muted">No coordinator details available.</p>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Technical Events */}
          <section>
            <h2 className="text-xl font-bold text-eventrix-black mb-4 border-b border-[#D9D9DF] pb-2">
              Technical Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techEvents.map((event) => {
                const isReg = registeredIds.includes(event.id);
                const parsed = parseEventData(event);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="group border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">
                        {event.category} - {event.participation_type}
                      </span>
                      {isReg && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Registered
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">
                      {parsed.cleanDescription}
                    </p>

                    <div className="mb-4">
                      <EventStatusBadge 
                        date={event.date} 
                        time={event.time} 
                        capacity={event.capacity} 
                        registeredCount={registrationCounts[event.id]}
                        festRegistrationClosesAt={fest.registration_closes_at} 
                      />
                    </div>

                    <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}
                      </div>
                    </div>
                  </div>
                );
              })}
              {techEvents.length === 0 && (
                <p className="text-sm text-eventrix-muted">No technical events announced yet.</p>
              )}
            </div>
          </section>

          {/* Non-Technical Events */}
          <section>
            <h2 className="text-xl font-bold text-eventrix-black mb-4 border-b border-[#D9D9DF] pb-2">
              Non-Technical Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nonTechEvents.map((event) => {
                const isReg = registeredIds.includes(event.id);
                const parsed = parseEventData(event);
                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="group border border-[#D9D9DF] bg-white p-5 rounded-md hover:border-eventrix-black hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest">
                        {event.category} - {event.participation_type}
                      </span>
                      {isReg && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Registered
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-eventrix-black mb-1 group-hover:text-eventrix-lavender transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-xs text-eventrix-muted mb-4 line-clamp-2">
                      {parsed.cleanDescription}
                    </p>

                    <div className="mb-4">
                      <EventStatusBadge 
                        date={event.date} 
                        time={event.time} 
                        capacity={event.capacity} 
                        registeredCount={registrationCounts[event.id]} 
                        festRegistrationClosesAt={fest.registration_closes_at}
                      />
                    </div>

                    <div className="space-y-1.5 text-[10px] text-eventrix-black font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-eventrix-lavender" /> {event.location}
                      </div>
                    </div>
                  </div>
                );
              })}
              {nonTechEvents.length === 0 && (
                <p className="text-sm text-eventrix-muted">No non-technical events announced yet.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
