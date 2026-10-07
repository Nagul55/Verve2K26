"use client";

import React, { useState, useEffect } from "react";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Trophy, 
  Code, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  AlertCircle, 
  UserPlus, 
  Clock, 
  Send, 
  X, 
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  Flame,
  Award,
  Medal,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendHackathonInvitation, cancelHackathonInvitation } from "@/actions/hackathon.team.actions";

export function HackathonClient({ 
  fest, 
  hackathon, 
  problemStatements, 
  userTeam, 
  currentUserId 
}: { 
  fest: any; 
  hackathon: any; 
  problemStatements: any[]; 
  userTeam?: any; 
  currentUserId?: string; 
}) {
  const router = useRouter();
  const [expandedStatement, setExpandedStatement] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [countdownStr, setCountdownStr] = useState<string>("");

  const isRegistrationOpen = new Date() >= new Date(hackathon.registration_opens_at) && new Date() <= new Date(hackathon.registration_closes_at);
  const isBeforeRegistration = new Date() < new Date(hackathon.registration_opens_at);

  // Live Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetTime = isBeforeRegistration 
        ? new Date(hackathon.registration_opens_at).getTime()
        : new Date(hackathon.registration_closes_at).getTime();

      const diff = targetTime - now;
      if (diff <= 0) {
        setCountdownStr(isBeforeRegistration ? "Starts Soon" : "Registration Closed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      parts.push(`${hours.toString().padStart(2, '0')}h`);
      parts.push(`${minutes.toString().padStart(2, '0')}m`);
      parts.push(`${seconds.toString().padStart(2, '0')}s`);
      setCountdownStr(parts.join(' '));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hackathon.registration_opens_at, hackathon.registration_closes_at, isBeforeRegistration]);

  const handleCopyCode = () => {
    if (!userTeam?.passcode) return;
    navigator.clipboard.writeText(userTeam.passcode);
    setHasCopiedCode(true);
    toast.success("Team passcode copied to clipboard!");
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSendingInvite(true);
    try {
      const res = await sendHackathonInvitation(userTeam.id, inviteEmail.trim());
      if (res.success) {
        toast.success(res.message || "Invitation sent successfully!");
        setInviteEmail("");
        setIsInviteModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send invitation.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatPPP = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Parse prize pool total
  const prizeTotal = [hackathon.prize_1st, hackathon.prize_2nd, hackathon.prize_3rd]
    .map(p => parseInt(String(p || '').replace(/[^0-9]/g, '')) || 0)
    .reduce((a, b) => a + b, 0);

  const coordinators = fest.coordinatorDetails || [];
  const teamMemberCount = userTeam?.members?.length || 1;
  const maxTeamMembers = hackathon.maximum_team_size || 4;
  const teamProgressPercent = Math.min(100, Math.round((teamMemberCount / maxTeamMembers) * 100));

  return (
    <div className="w-full space-y-8 pb-12 transition-all duration-300">
      
      {/* Back Navigation Breadcrumb */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fests & Hackathons
        </Link>
      </div>

      {/* =========================================================================
          HERO SHOWCASE CARD (CONTAINED WITH ELEGANT SPACING FROM SIDEBAR)
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-gradient-to-br from-[#0B0F1E] via-[#0F142A] to-[#0A0D18] p-6 sm:p-10 lg:p-12 text-white shadow-xl">
        
        {/* Ambient Subtle Radial Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle Tech Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          
          {/* RECTANGULAR STATUS BAR (UNIFIED RECTANGULAR CONTAINER) */}
          <div className="inline-flex flex-wrap items-center bg-[#070A14]/90 border border-slate-700/80 rounded-md shadow-sm overflow-hidden text-xs divide-x divide-slate-700/80 backdrop-blur-md">
            {/* Box 1: Event Type */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-violet-600/20 text-violet-300 font-bold uppercase tracking-wider">
              <Code className="w-3.5 h-3.5 text-violet-400" />
              <span># HACKATHON 2026</span>
            </div>

            {/* Box 2: Mode */}
            {hackathon.mode && (
              <div className="flex items-center gap-1.5 px-3.5 py-2 text-slate-200 font-medium uppercase tracking-wider bg-slate-800/40">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{hackathon.mode}</span>
              </div>
            )}

            {/* Box 3: Countdown / Registration Status */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/70 font-mono tracking-wider">
              <span className={`w-2 h-2 rounded-full ${
                isRegistrationOpen ? "bg-emerald-400 animate-pulse" : isBeforeRegistration ? "bg-amber-400" : "bg-rose-400"
              }`} />
              <span className={`font-bold ${
                isRegistrationOpen ? "text-emerald-400" : isBeforeRegistration ? "text-amber-400" : "text-rose-400"
              }`}>
                {isRegistrationOpen 
                  ? `CLOSES IN: ${countdownStr || "OPEN"}` 
                  : isBeforeRegistration 
                    ? `STARTS: ${countdownStr || "SOON"}` 
                    : "REGISTRATION CLOSED"}
              </span>
            </div>
          </div>

          {/* BRANDING TITLE & MANIFESTO */}
          <div className="space-y-3 max-w-4xl">
            <h1 className="font-anton text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-wide leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-violet-300">
              VERVATHON 2026
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg font-bold tracking-[0.25em] sm:tracking-[0.3em] uppercase text-slate-300 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span>BUILD</span>
              <span className="text-violet-400">•</span>
              <span>INNOVATE</span>
              <span className="text-cyan-400">•</span>
              <span>TRANSFORM</span>
            </p>

            {fest.description && (
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed pt-2 max-w-3xl line-clamp-3">
                {fest.description}
              </p>
            )}
          </div>

          {/* 4 RECTANGULAR METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
            
            {/* 1. Dates */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-violet-400/40 transition-colors">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <CalendarDays className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event Dates</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white tracking-tight">
                {formatDate(hackathon.hackathon_starts_at)}
              </p>
              <p className="text-[11px] text-slate-400">to {formatDate(hackathon.hackathon_ends_at)}</p>
            </div>

            {/* 2. Venue */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-violet-400/40 transition-colors">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Venue</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white truncate tracking-tight">
                {hackathon.venue || "Main Campus"}
              </p>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{hackathon.mode || "Offline Mode"}</p>
            </div>

            {/* 3. Team Size */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-violet-400/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Team Size</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white tracking-tight">
                {hackathon.minimum_team_size} - {hackathon.maximum_team_size} Members
              </p>
              <p className="text-[11px] text-slate-400">Max {hackathon.maximum_teams || 100} Teams</p>
            </div>

            {/* 4. Prize Pool */}
            <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 backdrop-blur-sm hover:border-violet-400/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prize Pool</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-amber-300 tracking-tight">
                {prizeTotal > 0 ? `₹${prizeTotal.toLocaleString()}` : "Cash & Awards"}
              </p>
              <p className="text-[11px] text-slate-400">Trophies & Certs</p>
            </div>

          </div>

          {/* ACTION BUTTONS (RECOLORED TEAM BUTTON WITH EVENTRIX BRAND VIOLET) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            {userTeam ? (
              <a href="#team-card">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-anton text-base sm:text-lg tracking-wider uppercase px-7 h-12 shadow-[0_4px_20px_rgba(124,58,237,0.35)] hover:shadow-[0_6px_25px_rgba(124,58,237,0.5)] transition-all flex items-center gap-2.5 rounded-xl border border-violet-400/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-violet-200" />
                  <span>Team: {userTeam.name}</span>
                </Button>
              </a>
            ) : (
              <Link href={`/hackathons/${fest.id}/register`}>
                <Button 
                  size="lg" 
                  disabled={!isRegistrationOpen}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-anton text-base sm:text-lg tracking-wider uppercase px-8 h-12 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50 cursor-pointer rounded-xl flex items-center gap-2"
                >
                  <Flame className="w-5 h-5" />
                  <span>{isRegistrationOpen ? "Register Team Now" : "Registration Closed"}</span>
                </Button>
              </Link>
            )}

            <a href="#problem-statements">
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:text-white transition-all rounded-xl backdrop-blur-sm cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2 text-violet-300" />
                Problem Statements
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* =========================================================================
          MAIN BODY LAYOUT (CLEAN INDUSTRY-GRADE LIGHT/SLATE CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT 2 COLUMNS: TEAM ROSTER, ABOUT, PROBLEM STATEMENTS, RULES */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* ===================================================================
              1. TEAM ROSTER CONTAINER (REFINED MODERN DASHBOARD STYLE)
              =================================================================== */}
          {userTeam && (
            <div id="team-card" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 hover:shadow-md transition-shadow">
              
              {/* Header: Team Identity & Roster Meter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-[11px] font-bold uppercase tracking-wider mb-2 border border-violet-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Registered Team</span>
                  </div>
                  <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                    {userTeam.name}
                  </h2>
                </div>

                <div className="sm:text-right bg-slate-50 border border-slate-200/60 p-3 rounded-xl min-w-[180px]">
                  <div className="flex items-center justify-between sm:justify-end gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>Roster Capacity</span>
                    <span className="text-slate-900 font-extrabold">{teamMemberCount} / {maxTeamMembers}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${teamProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Team Members
                  </span>
                  {userTeam.pendingInvitations?.length > 0 && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      {userTeam.pendingInvitations.length} Pending
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userTeam.members?.map((member: any) => {
                    const isTeamLeader = member.participant_id === userTeam.leader_id;
                    const initial = member.participants?.full_name?.charAt(0)?.toUpperCase() || "U";

                    return (
                      <div 
                        key={member.participant_id} 
                        className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-anton text-base shrink-0 shadow-sm">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {member.participants?.full_name || "Team Member"}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {member.participants?.email || ""}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                          isTeamLeader 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {isTeamLeader ? "Leader" : "Member"}
                        </span>
                      </div>
                    );
                  })}

                  {/* Pending Invitations Slots */}
                  {userTeam.pendingInvitations?.map((inv: any) => (
                    <div 
                      key={inv.participant_id} 
                      className="flex items-center justify-between p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {inv.participants?.full_name || inv.participants?.email || "Invited Student"}
                          </p>
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                            Invitation Pending
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold px-2.5 h-8 shrink-0 cursor-pointer"
                        onClick={async () => {
                          if (!confirm("Cancel this invitation?")) return;
                          const res = await cancelHackathonInvitation(userTeam.id, inv.participant_id, fest.id);
                          if (res.success) {
                            toast.info("Invitation cancelled.");
                            router.refresh();
                          } else {
                            toast.error(res.error || "Failed to cancel invitation");
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passcode & Invite Actions Console Strip */}
              <div className="p-4 sm:p-5 bg-slate-950 text-white rounded-xl border border-slate-800 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 block mb-1">
                    Team Passcode / Invite Code
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl font-bold tracking-widest text-white px-3 py-1 bg-white/10 rounded-lg border border-white/10">
                      {userTeam.passcode || "------"}
                    </span>
                    <span className="text-xs text-slate-400 hidden md:inline">
                      Share with teammates to join
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-4 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Share Invitation</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/15 font-bold text-xs uppercase tracking-wider h-10 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              2. ABOUT THE HACKATHON
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                    About The Hackathon
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Overview & Challenge Objectives
                  </span>
                </div>
              </div>

              {hackathon.domain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  {hackathon.domain}
                </span>
              )}
            </div>

            <div className="text-slate-600 leading-relaxed text-sm sm:text-base space-y-4">
              <p className="whitespace-pre-line font-normal">
                {fest.description || hackathon.description || "Join fellow innovators and developers for an intense hackathon experience. Collaborate, code, and solve real-world problems with impactful digital solutions."}
              </p>
            </div>

            {/* Spec Matrix Tags */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hackathon.allowed_departments && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 block mb-1">
                    Eligible Departments
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {hackathon.allowed_departments}
                  </p>
                </div>
              )}
              {hackathon.allowed_years && (
                <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 block mb-1">
                    Eligible Batches / Years
                  </span>
                  <p className="text-xs font-semibold text-slate-800">
                    {hackathon.allowed_years}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================================
              3. PROBLEM STATEMENTS CONTAINER
              =================================================================== */}
          <div id="problem-statements" className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                    Problem Statements
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Official Challenges & Briefs
                  </span>
                </div>
              </div>

              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                {problemStatements.length} Challenges
              </span>
            </div>

            {problemStatements.length === 0 ? (
              <div className="p-10 border border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Problem statements will be revealed shortly.</p>
                <p className="text-xs text-slate-400 mt-0.5">Stay tuned as we approach the hackathon kickoff.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {problemStatements.map((ps, index) => {
                  const isExpanded = expandedStatement === ps.id;
                  const cleanTitle = ps.title || (ps.file_name ? ps.file_name.replace(/\.[^/.]+$/, '') : `Problem Statement #${index + 1}`);

                  return (
                    <div 
                      key={ps.id} 
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        isExpanded 
                          ? "border-violet-300 bg-violet-50/20 shadow-sm" 
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <button 
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between focus:outline-none cursor-pointer gap-4"
                        onClick={() => setExpandedStatement(isExpanded ? null : ps.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                            {cleanTitle}
                          </h3>
                        </div>
                        
                        <div className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-900">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4">
                          {ps.description && (
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                              {ps.description}
                            </p>
                          )}

                          {ps.file_url && (
                            <div className="pt-2">
                              <a 
                                href={ps.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Challenge Specification</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===================================================================
              4. RULES & REGULATIONS
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                  Rules & Guidelines
                </h2>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Important Compliance Instructions
                </span>
              </div>
            </div>

            {hackathon.rules ? (
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {hackathon.rules}
              </div>
            ) : (
              <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
                <p>1. Teams must comprise {hackathon.minimum_team_size} to {hackathon.maximum_team_size} verified members.</p>
                <p>2. All code and prototypes developed must be authored during the official hackathon hours.</p>
                <p>3. Plagiarism or pre-built complete solutions will result in immediate disqualification.</p>
                <p>4. Teams must bring their own laptops and development hardware unless stated otherwise.</p>
                <p>5. Decisions made by the jury panel will be conclusive and final.</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: PRIZE POOL, TIMELINE, COORDINATORS */}
        <div className="space-y-8">
          
          {/* ===================================================================
              5. PRIZE POOL & REWARDS
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900">
                Prize Pool & Rewards
              </h3>
            </div>

            <div className="space-y-3">
              {/* 1st Prize */}
              {hackathon.prize_1st && (
                <div className="p-3.5 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50/70 to-orange-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-anton text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        1st Prize Winner
                      </span>
                      <p className="font-anton text-xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_1st}
                      </p>
                    </div>
                  </div>
                  <Medal className="w-6 h-6 text-amber-600" />
                </div>
              )}

              {/* 2nd Prize */}
              {hackathon.prize_2nd && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-300 text-slate-950 flex items-center justify-center font-anton text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        2nd Prize Winner
                      </span>
                      <p className="font-anton text-xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_2nd}
                      </p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-slate-500" />
                </div>
              )}

              {/* 3rd Prize */}
              {hackathon.prize_3rd && (
                <div className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-200 text-slate-950 flex items-center justify-center font-anton text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        3rd Prize Winner
                      </span>
                      <p className="font-anton text-xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_3rd}
                      </p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
              )}

              {/* Certificates */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Participation Certificates for all verified attendees</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              6. TIMELINE CONTAINER
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <CalendarDays className="w-5 h-5 text-violet-600" />
              <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900">
                Event Timeline
              </h3>
            </div>

            <div className="space-y-4 pl-2">
              {/* Milestone 1 */}
              <div className="relative pl-6 border-l-2 border-violet-200 pb-4">
                <div className="absolute w-3 h-3 bg-violet-600 rounded-full -left-[7px] top-1 ring-4 ring-violet-50" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 block mb-0.5">
                  Registration Opens
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPPP(hackathon.registration_opens_at)}
                </p>
                <p className="text-xs text-slate-400">{formatTime(hackathon.registration_opens_at)}</p>
              </div>

              {/* Milestone 2 */}
              <div className="relative pl-6 border-l-2 border-slate-200 pb-4">
                <div className="absolute w-3 h-3 bg-slate-400 rounded-full -left-[7px] top-1 ring-4 ring-slate-100" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Registration Closes
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPPP(hackathon.registration_closes_at)}
                </p>
                <p className="text-xs text-slate-400">{formatTime(hackathon.registration_closes_at)}</p>
              </div>

              {/* Milestone 3 */}
              <div className="relative pl-6">
                <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1 ring-4 ring-emerald-50 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                  Hackathon Starts
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPPP(hackathon.hackathon_starts_at)}
                </p>
                <p className="text-xs text-slate-400">{formatTime(hackathon.hackathon_starts_at)}</p>
              </div>
            </div>
          </div>

          {/* ===================================================================
              7. COORDINATORS
              =================================================================== */}
          {coordinators.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Phone className="w-5 h-5 text-violet-600" />
                <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900">
                  Event Coordinators
                </h3>
              </div>

              <div className="space-y-2.5">
                {coordinators.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <p className="font-semibold text-sm text-slate-900">{c.name}</p>
                    {c.phone && (
                      <a 
                        href={`tel:${c.phone}`} 
                        className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1.5 mt-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{c.phone}</span>
                      </a>
                    )}
                    {c.email && (
                      <a 
                        href={`mailto:${c.email}`} 
                        className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 mt-0.5 truncate"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* =========================================================================
          SHARE INVITATION MODAL DIALOG
          ========================================================================= */}
      {isInviteModalOpen && userTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                  Invite Teammate
                </h3>
                <p className="text-xs font-semibold text-slate-500">Team: {userTeam.name}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed font-normal">
              Send an invitation directly to a registered student. The invite will appear in their <strong className="text-slate-900">Invitations</strong> section where they can accept it to join your team.
            </p>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Teammate&apos;s Registered Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. teammate@sonatech.ac.in"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 font-normal">
                  Make sure they have already signed up on Eventrix with this email address.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
                  disabled={isSendingInvite}
                  className="border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSendingInvite || !inviteEmail.trim()}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSendingInvite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
