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
  Layers,
  Crown,
  Share2,
  Zap,
  Calendar,
  MessageCircle,
  HelpCircle,
  Target,
  FileCode2,
  ChevronRight,
  ArrowUpRight,
  Search,
  CheckCircle,
  Compass
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendHackathonInvitation, cancelHackathonInvitation } from "@/actions/hackathon.team.actions";
import { UserAvatar } from "@/components/UserAvatar";
import { TeamAvatar } from "@/components/TeamAvatar";

export function HackathonClient({ 
  fest, 
  hackathon, 
  problemStatements = [], 
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
  const [activeTab, setActiveTab] = useState<"overview" | "squad" | "challenges" | "rules">("overview");
  const [expandedStatement, setExpandedStatement] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [searchProblem, setSearchProblem] = useState("");

  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    statusText: string;
    isLive: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    statusText: "Calculating...",
    isLive: false
  });

  const now = new Date();
  const opensAt = hackathon?.registration_opens_at ? new Date(hackathon.registration_opens_at) : null;
  const closesAt = hackathon?.registration_closes_at ? new Date(hackathon.registration_closes_at) : null;

  const isRegistrationOpen = opensAt && closesAt ? now >= opensAt && now <= closesAt : true;
  const isBeforeRegistration = opensAt ? now < opensAt : false;
  const isRegistrationClosed = closesAt ? now > closesAt : false;

  // Real-time Countdown Engine
  useEffect(() => {
    const updateCountdown = () => {
      const currentTime = new Date().getTime();
      let targetTime = 0;

      if (isBeforeRegistration && opensAt) {
        targetTime = opensAt.getTime();
      } else if (closesAt) {
        targetTime = closesAt.getTime();
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, statusText: "REGISTRATION OPEN", isLive: true });
        return;
      }

      const diff = targetTime - currentTime;
      if (diff <= 0) {
        if (isBeforeRegistration) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, statusText: "REGISTRATION JUST OPENED", isLive: true });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, statusText: "REGISTRATION CLOSED", isLive: false });
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        statusText: isBeforeRegistration ? "REGISTRATION OPENS IN" : "REGISTRATION CLOSES IN",
        isLive: !isBeforeRegistration
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [hackathon.registration_opens_at, hackathon.registration_closes_at, isBeforeRegistration]);

  // Helper to ensure production Vercel link is shared even when tested locally
  const getPublicHackathonUrl = () => {
    const fallbackBase = "https://sona-eventrix-itads.vercel.app";
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || fallbackBase).replace(/\/$/, "");
    
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      if (!isLocal) {
        return window.location.href;
      }
      return `${appUrl}${window.location.pathname}`;
    }
    return `${appUrl}/hackathons/${fest.id}`;
  };

  const handleCopyCode = () => {
    if (!userTeam?.passcode) return;
    navigator.clipboard.writeText(userTeam.passcode);
    setHasCopiedCode(true);
    toast.success("Team passcode copied to clipboard!");
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    const url = getPublicHackathonUrl();
    navigator.clipboard.writeText(url);
    setHasCopiedLink(true);
    toast.success("Hackathon link copied to clipboard!");
    setTimeout(() => setHasCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!userTeam?.passcode) return;
    const hackathonTitle = fest.name || "Vervathon 2026";
    const publicUrl = getPublicHackathonUrl();
    const text = encodeURIComponent(
      `🚀 Join my squad "${userTeam.name}" for ${hackathonTitle} on Eventrix!\n\n🔑 Team Passcode: ${userTeam.passcode}\n🔗 Hackathon Link: ${publicUrl}\n\nLet's code, innovate and win together!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatPPP = (dateString?: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getMonthShort = (dateString?: string) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  const getDayNumber = (dateString?: string) => {
    if (!dateString) return "--";
    return new Date(dateString).getDate();
  };

  // Parse prize pool total
  const prizeTotal = [hackathon.prize_1st, hackathon.prize_2nd, hackathon.prize_3rd]
    .map(p => parseInt(String(p || '').replace(/[^0-9]/g, '')) || 0)
    .reduce((a, b) => a + b, 0);

  const coordinators = fest.coordinatorDetails || [];
  const teamMemberCount = userTeam?.members?.length || 0;
  const pendingCount = userTeam?.pendingInvitations?.length || 0;
  const maxTeamMembers = hackathon.maximum_team_size || 4;
  const minTeamMembers = hackathon.minimum_team_size || 1;
  const emptySlotsCount = Math.max(0, maxTeamMembers - (teamMemberCount + pendingCount));
  const teamProgressPercent = Math.min(100, Math.round((teamMemberCount / maxTeamMembers) * 100));

  const filteredProblemStatements = (problemStatements || []).filter((ps) => {
    if (!searchProblem.trim()) return true;
    const query = searchProblem.toLowerCase();
    const title = (ps.title || ps.file_name || "").toLowerCase();
    const desc = (ps.description || "").toLowerCase();
    return title.includes(query) || desc.includes(query);
  });

  return (
    <div className="w-full space-y-8 pb-16 transition-all duration-300">
      
      {/* =========================================================================
          TOP NAVIGATION & QUICK ACTION BAR
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-violet-600 hover:border-violet-300 shadow-sm transition-all w-fit group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 group-hover:text-violet-600 transition-all" />
          <span>Back to Fests & Hackathons</span>
        </Link>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-9 px-3 text-xs font-semibold rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm cursor-pointer"
          >
            {hasCopiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                <span className="text-emerald-700 font-bold">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                <span>Share Hackathon</span>
              </>
            )}
          </Button>

          {userTeam && (
            <button
              onClick={() => setActiveTab("squad")}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 border border-violet-200/80 text-xs font-bold hover:bg-violet-100 transition-colors cursor-pointer"
            >
              <TeamAvatar name={userTeam.name} className="w-4 h-4 rounded-md shrink-0" size={16} />
              <span>Squad: {userTeam.name}</span>
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          HERO STAGE: INDUSTRY-GRADE CYBER COMMAND BANNER
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#080B18] via-[#0E1328] to-[#070913] p-6 sm:p-10 lg:p-12 text-white shadow-2xl">
        
        {/* Dynamic Holographic & Neon Ambient Lighting */}
        <div className="absolute -top-36 -right-36 w-[450px] h-[450px] bg-gradient-to-br from-violet-600/25 to-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-36 -left-36 w-[450px] h-[450px] bg-gradient-to-tr from-cyan-600/20 to-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B18] via-transparent to-transparent pointer-events-none opacity-80" />

        <div className="relative z-10 space-y-8">
          
          {/* Top Status & Telemetry Pill Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
              {hackathon.mode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-cyan-300 font-semibold uppercase tracking-wider backdrop-blur-md">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {hackathon.mode} Campus Hack
                </span>
              )}

              {hackathon.domain && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 font-medium tracking-wide backdrop-blur-md">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  {hackathon.domain}
                </span>
              )}
            </div>

            {/* Right Live Countdown Segment Box */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${countdown.isLive ? "bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse" : isBeforeRegistration ? "bg-amber-400 animate-pulse" : "bg-rose-400"}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {countdown.statusText}
                </span>
              </div>

              {(countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0) && (
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white tracking-wider pl-2 border-l border-white/10">
                  {countdown.days > 0 && (
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-violet-300">
                      {countdown.days}d
                    </span>
                  )}
                  <span className="bg-white/10 px-1.5 py-0.5 rounded">
                    {String(countdown.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-slate-500">:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded">
                    {String(countdown.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-slate-500">:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-400">
                    {String(countdown.seconds).padStart(2, '0')}s
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Hackathon Identity / Display Title */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="font-anton text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.95] text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-violet-300 drop-shadow-sm">
              {fest.name || "VERVATHON 2026"}
            </h1>

            {/* Sub-tagline banner */}
            <div className="inline-flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-400/25 text-violet-300 text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
                {hackathon.tagline || "BUILD • INNOVATE • TRANSFORM"}
              </span>
              {fest.status && (
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">{fest.status}</span>
                </span>
              )}
            </div>

            {(hackathon.description || fest.description) && (
              <p className="text-slate-300/90 text-sm sm:text-base leading-relaxed pt-1 max-w-3xl line-clamp-3 font-normal">
                {hackathon.description || fest.description}
              </p>
            )}
          </div>

          {/* 4 Sleek Telemetry Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
            
            {/* 1. Event Schedule */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-400/40 p-4 transition-all duration-300 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-violet-400 mb-2">
                <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Event Dates</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white tracking-tight">
                {formatDate(hackathon.hackathon_starts_at)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                to {formatDate(hackathon.hackathon_ends_at)}
              </p>
            </div>

            {/* 2. Venue & Location */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-cyan-400/40 p-4 transition-all duration-300 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-cyan-400 mb-2">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Venue</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white truncate tracking-tight">
                {hackathon.venue || "Main Campus Hall"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
                {hackathon.mode || "Offline Mode"}
              </p>
            </div>

            {/* 3. Squad Size & Cap */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-400/40 p-4 transition-all duration-300 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-emerald-400 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Squad Format</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-white tracking-tight">
                {minTeamMembers === maxTeamMembers ? `${minTeamMembers} Members` : `${minTeamMembers} - ${maxTeamMembers} Members`}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Cap: {hackathon.maximum_teams || 100} Teams Max
              </p>
            </div>

            {/* 4. Total Prize Pool */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-orange-500/10 border border-amber-500/30 hover:border-amber-400/60 p-4 transition-all duration-300 backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-amber-400 mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                  <Trophy className="w-4 h-4 text-amber-300" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80">Prize Purse</span>
              </div>
              <p className="font-bold text-base sm:text-lg text-amber-300 tracking-tight">
                {prizeTotal > 0 ? `₹${prizeTotal.toLocaleString()}` : "Cash & Rewards"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                + Trophies & Certificates
              </p>
            </div>

          </div>

          {/* Hero Action Dock */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
            {userTeam ? (
              <Button 
                size="lg" 
                onClick={() => setActiveTab("squad")}
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-anton text-base sm:text-lg tracking-wider uppercase px-7 h-12 shadow-[0_4px_25px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_30px_rgba(124,58,237,0.6)] transition-all flex items-center gap-2.5 rounded-2xl border border-violet-400/30 cursor-pointer"
              >
                <TeamAvatar name={userTeam.name} className="w-5 h-5 rounded-md shrink-0" size={20} />
                <span>Squad Command: {userTeam.name}</span>
              </Button>
            ) : (
              <Link href={`/hackathons/${fest.id}/register`}>
                <Button 
                  size="lg" 
                  disabled={!isRegistrationOpen}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-anton text-base sm:text-lg tracking-wider uppercase px-8 h-12 shadow-[0_4px_25px_rgba(124,58,237,0.4)] transition-all disabled:opacity-50 cursor-pointer rounded-2xl flex items-center gap-2.5 border border-violet-400/30"
                >
                  <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>{isRegistrationOpen ? "Register Squad Now" : isBeforeRegistration ? "Registration Opening Soon" : "Registration Closed"}</span>
                </Button>
              </Link>
            )}

            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setActiveTab("challenges")}
              className="h-12 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:text-white transition-all rounded-2xl backdrop-blur-sm cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 mr-2 text-violet-300" />
              <span>Challenges ({problemStatements.length})</span>
            </Button>

            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setActiveTab("rules")}
              className="h-12 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:text-white transition-all rounded-2xl backdrop-blur-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 mr-2 text-cyan-300" />
              <span>Guidelines</span>
            </Button>

            {hackathon.whatsapp_group_link && (
              <a
                href={hackathon.whatsapp_group_link}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 px-5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white transition-all rounded-2xl flex items-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>

        </div>
      </section>

      {/* =========================================================================
          STICKY TABBED NAVIGATION HUB (INDUSTRY BENCHMARK)
          ========================================================================= */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1.5 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Overview & Brief</span>
          </button>

          {userTeam && (
            <button
              onClick={() => setActiveTab("squad")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === "squad"
                  ? "bg-violet-600 text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]"
                  : "text-violet-700 hover:bg-violet-50 bg-violet-50/50 border border-violet-200/60"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Squad Command</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </button>
          )}

          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "challenges"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Problem Statements</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === "challenges" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}>
              {problemStatements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === "rules"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Rules & Criteria</span>
          </button>

        </div>
      </div>

      {/* =========================================================================
          MAIN INTERACTIVE CONTENT STAGE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* LEFT 2 COLUMNS (PRIMARY VIEWPORT) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB 1: SQUAD COMMAND (HACKATHON MATE HQ) */}
          {(activeTab === "squad" || (activeTab === "overview" && userTeam)) && userTeam && (
            <div id="squad-command" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 hover:shadow-md transition-all">
              
              {/* Header: Squad Identity & Telemetry */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <TeamAvatar
                    name={userTeam.name}
                    className="w-14 h-14 rounded-2xl shrink-0 shadow-md border border-violet-200/80"
                    size={56}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified Squad
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        ID: {userTeam.id.slice(0, 8)}
                      </span>
                    </div>
                    <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                      {userTeam.name}
                    </h2>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 border border-slate-200/90 p-4 rounded-2xl min-w-[240px] shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-violet-600" />
                      Squad Slots
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold text-slate-900 bg-white border border-slate-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                      <span>{teamMemberCount}</span>
                      <span className="text-slate-400">/</span>
                      <span>{maxTeamMembers}</span>
                    </span>
                  </div>

                  {/* Segmented Slot Capsule Bar */}
                  <div className="flex items-center gap-1.5 w-full">
                    {Array.from({ length: maxTeamMembers }).map((_, slotIndex) => {
                      const isFilled = slotIndex < teamMemberCount;
                      const isPending = !isFilled && slotIndex < teamMemberCount + pendingCount;
                      
                      return (
                        <div
                          key={`slot-cap-${slotIndex}`}
                          className={`flex-1 h-3 rounded-full transition-all duration-300 relative overflow-hidden ${
                            isFilled
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_1px_6px_rgba(124,58,237,0.35)]"
                              : isPending
                              ? "bg-amber-400 border border-amber-300 animate-pulse shadow-[0_1px_4px_rgba(245,158,11,0.25)]"
                              : "bg-slate-200/70 border border-dashed border-slate-300"
                          }`}
                          title={
                            isFilled 
                              ? `Slot ${slotIndex + 1}: Confirmed Member`
                              : isPending 
                              ? `Slot ${slotIndex + 1}: Invitation Pending`
                              : `Slot ${slotIndex + 1}: Open Vacancy`
                          }
                        >
                          {isFilled && (
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:12px_12px]" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-500 font-medium">
                      {emptySlotsCount > 0 ? (
                        <span className="text-violet-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
                          {emptySlotsCount} slot{emptySlotsCount > 1 ? "s" : ""} open
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Squad locked & full
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-400 font-mono text-[10px]">
                      {teamProgressPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Roster Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Squad Roster ({teamMemberCount + pendingCount}/{maxTeamMembers})
                    </span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3 h-3 animate-pulse" />
                      {pendingCount} Pending Invite{pendingCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Verified Members */}
                  {userTeam.members?.map((member: any) => {
                    const isTeamLeader = member.participant_id === userTeam.leader_id;

                    return (
                      <div 
                        key={member.participant_id} 
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:border-violet-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <UserAvatar
                              user={member.participants}
                              alt={member.participants?.full_name || "Squad Member"}
                              className={`w-11 h-11 rounded-2xl object-cover shrink-0 shadow-sm border ${
                                isTeamLeader 
                                  ? "border-amber-400 ring-2 ring-amber-400/30" 
                                  : "border-slate-200"
                              }`}
                            />
                            {isTeamLeader && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm ring-2 ring-white">
                                <Crown className="w-3 h-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-sm text-slate-900 truncate">
                                {member.participants?.full_name || "Squad Member"}
                              </p>
                              {isTeamLeader && (
                                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {member.participants?.email || ""}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ml-2 ${
                          isTeamLeader 
                            ? "bg-amber-50 text-amber-800 border border-amber-200/80" 
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {isTeamLeader ? "Leader" : "Member"}
                        </span>
                      </div>
                    );
                  })}

                  {/* Pending Invitations */}
                  {userTeam.pendingInvitations?.map((inv: any) => (
                    <div 
                      key={inv.participant_id} 
                      className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <UserAvatar
                          user={inv.participants}
                          alt={inv.participants?.full_name || "Invited Student"}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-sm border border-dashed border-amber-300 opacity-80"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {inv.participants?.full_name || inv.participants?.email || "Invited Student"}
                          </p>
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mt-0.5">
                            Invitation Awaiting Response
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold px-3 h-8 shrink-0 cursor-pointer rounded-lg"
                        onClick={async () => {
                          if (!confirm("Cancel this teammate invitation?")) return;
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

                  {/* Interactive Empty Slots to Invite */}
                  {Array.from({ length: emptySlotsCount }).map((_, i) => (
                    <button
                      key={`empty-${i}`}
                      onClick={() => setIsInviteModalOpen(true)}
                      className="group flex items-center gap-3.5 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50/50 hover:bg-violet-50/30 transition-all text-left cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-xl border border-dashed border-slate-300 group-hover:border-violet-400 text-slate-400 group-hover:text-violet-600 group-hover:bg-violet-100 flex items-center justify-center transition-all shrink-0">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs uppercase tracking-wider text-slate-700 group-hover:text-violet-700 transition-colors">
                          + Open Squad Slot {teamMemberCount + pendingCount + i + 1}
                        </p>
                        <p className="text-[11px] text-slate-400 group-hover:text-slate-600 mt-0.5">
                          Click to invite another teammate
                        </p>
                      </div>
                    </button>
                  ))}

                </div>
              </div>

              {/* Compact Squad Passcode & Invite Strip */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Left: Refined Passcode Badge */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <Lock className="w-3 h-3" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Passcode:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-violet-300 text-slate-800 shadow-2xs transition-all cursor-pointer group"
                      title="Click to copy passcode"
                    >
                      <span className="font-mono text-sm font-bold tracking-wider text-slate-900 group-hover:text-violet-600 transition-colors">
                        {userTeam.passcode || "------"}
                      </span>
                      {hasCopiedCode ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 shrink-0 transition-colors" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    • Share with teammates to join directly
                  </span>
                </div>

                {/* Right: Compact Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="h-8.5 px-3 text-xs font-bold rounded-lg bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80 shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    {hasCopiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleShareWhatsApp}
                    className="h-8.5 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-8.5 px-3 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite by Email</span>
                  </Button>

                  {hackathon.whatsapp_group_link && (
                    <a
                      href={hackathon.whatsapp_group_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8.5 px-3 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Official Group</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: OVERVIEW & CHALLENGE OBJECTIVES */}
          {activeTab === "overview" && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                      About The Hackathon
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overview & Challenge Objectives
                    </span>
                  </div>
                </div>

                {hackathon.domain && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
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

              {/* Specification Matrix */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hackathon.allowed_departments && (
                  <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 block mb-1">
                      Eligible Departments
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {hackathon.allowed_departments}
                    </p>
                  </div>
                )}
                {hackathon.allowed_years && (
                  <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 block mb-1">
                      Eligible Batches / Years
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {hackathon.allowed_years}
                    </p>
                  </div>
                )}
                {hackathon.whatsapp_group_link && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl sm:col-span-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 block mb-0.5">
                        Official WhatsApp Community
                      </span>
                      <p className="text-xs font-semibold text-emerald-950">
                        Join for live alerts, mentor Q&A, and round updates
                      </p>
                    </div>
                    <a
                      href={hackathon.whatsapp_group_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Join Group</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>
                )}
              </div>

              {/* Callout if no team */}
              {!userTeam && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-anton text-lg uppercase tracking-wide text-violet-950">
                      Ready to build something unforgettable?
                    </h4>
                    <p className="text-xs text-violet-800">
                      Squads must have {minTeamMembers} to {maxTeamMembers} members. Assemble your team before the registration deadline!
                    </p>
                  </div>
                  <Link href={`/hackathons/${fest.id}/register`}>
                    <Button 
                      disabled={!isRegistrationOpen}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-xl shrink-0 cursor-pointer shadow-sm"
                    >
                      Register Your Squad
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROBLEM STATEMENTS & CHALLENGES */}
          {(activeTab === "challenges" || activeTab === "overview") && (
            <div id="problem-statements" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                    <FileCode2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                      Problem Statements
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Official Hackathon Challenge Tracks
                    </span>
                  </div>
                </div>

                {problemStatements.length > 0 && (
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search challenges..."
                      value={searchProblem}
                      onChange={(e) => setSearchProblem(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:border-violet-600 focus:bg-white transition-all"
                    />
                  </div>
                )}
              </div>

              {problemStatements.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-anton text-lg text-slate-800 uppercase tracking-wide">
                      Challenges Will Unlock Soon
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Official problem statements and challenge guidelines will be revealed right before kickoff.
                    </p>
                  </div>
                </div>
              ) : filteredProblemStatements.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No problem statements match &ldquo;{searchProblem}&rdquo;.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredProblemStatements.map((ps, index) => {
                    const isExpanded = expandedStatement === ps.id;
                    const cleanTitle = ps.title || (ps.file_name ? ps.file_name.replace(/\.[^/.]+$/, '') : `Problem Statement #${index + 1}`);

                    return (
                      <div 
                        key={ps.id} 
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isExpanded 
                            ? "border-violet-400/80 bg-violet-50/15 shadow-sm ring-1 ring-violet-400/20" 
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <button 
                          className="w-full p-4 sm:p-5 text-left flex items-center justify-between focus:outline-none cursor-pointer gap-4"
                          onClick={() => setExpandedStatement(isExpanded ? null : ps.id)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                              #{index + 1}
                            </span>
                            <div className="min-w-0">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                                {cleanTitle}
                              </h3>
                              <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">
                                Challenge Track #{index + 1}
                              </span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-violet-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
                            {ps.description && (
                              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-normal pt-2">
                                {ps.description}
                              </p>
                            )}

                            {ps.file_url && (
                              <div className="pt-2">
                                <a 
                                  href={ps.file_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                                >
                                  <Download className="w-4 h-4 text-violet-300" />
                                  <span>Download Specification Brief</span>
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
          )}

          {/* TAB 4: RULES & CRITERIA */}
          {(activeTab === "rules" || activeTab === "overview") && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7">
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 uppercase tracking-wide">
                    Rules & Guidelines
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Important Compliance, Participation & Judging Framework
                  </span>
                </div>
              </div>

              {/* 1. Rules & Regulations / Code of Conduct */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <h3 className="font-anton text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                    Rules & Code of Conduct
                  </h3>
                </div>

                {hackathon.rules ? (
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {hackathon.rules}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 block">
                        1. Squad Composition
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        All squads must consist of {minTeamMembers} to {maxTeamMembers} registered students. Inter-departmental squads are encouraged.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 block">
                        2. Originality Policy
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        All core code and digital prototypes must be built fresh during the official hackathon development window.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 block">
                        3. Hardware & BYOD
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Participants should bring personal laptops, chargers, and any specialized IoT hardware kits required for their demo.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 block">
                        4. Final Jury Review
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Submissions will be evaluated on technical depth, problem-solving innovation, UI/UX polish, and business viability.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Participation Guidelines */}
              {hackathon.participation_guidelines && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="font-anton text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Participation Guidelines
                    </h3>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {hackathon.participation_guidelines}
                  </div>
                </div>
              )}

              {/* 3. Submission Guidelines */}
              {hackathon.submission_guidelines && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="font-anton text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <FileCode2 className="w-4 h-4 text-emerald-600" />
                      Submission Guidelines
                    </h3>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {hackathon.submission_guidelines}
                  </div>
                </div>
              )}

              {/* 4. Judging Criteria */}
              {hackathon.judging_criteria && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="font-anton text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      Judging Criteria
                    </h3>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {hackathon.judging_criteria}
                  </div>
                </div>
              )}

              {/* 5. Code of Conduct (if separate) */}
              {hackathon.code_of_conduct && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <h3 className="font-anton text-base sm:text-lg text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Code of Conduct
                    </h3>
                  </div>
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
                    {hackathon.code_of_conduct}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: PRIZES, SCHEDULE, COORDINATORS */}
        <div className="space-y-8">
          
          {/* ===================================================================
              PRIZE POOL SHOWCASE (GOLD, SILVER, BRONZE PODIUM)
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900">
                Prize Pool & Honors
              </h3>
            </div>

            <div className="space-y-3">
              {/* 1st Prize */}
              {hackathon.prize_1st ? (
                <div className="relative overflow-hidden p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-500/10 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-anton text-lg shrink-0 shadow-sm ring-2 ring-amber-300/50">
                      1
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        🥇 1st Place Champion
                      </span>
                      <p className="font-anton text-2xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_1st}
                      </p>
                    </div>
                  </div>
                  <Medal className="w-7 h-7 text-amber-500" />
                </div>
              ) : null}

              {/* 2nd Prize */}
              {hackathon.prize_2nd ? (
                <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-100/60 to-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 text-slate-950 flex items-center justify-center font-anton text-lg shrink-0 shadow-sm">
                      2
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                        🥈 1st Runner Up
                      </span>
                      <p className="font-anton text-2xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_2nd}
                      </p>
                    </div>
                  </div>
                  <Award className="w-7 h-7 text-slate-400" />
                </div>
              ) : null}

              {/* 3rd Prize */}
              {hackathon.prize_3rd ? (
                <div className="p-4 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-orange-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600/70 to-amber-700/80 text-white flex items-center justify-center font-anton text-lg shrink-0 shadow-sm">
                      3
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        🥉 2nd Runner Up
                      </span>
                      <p className="font-anton text-2xl text-slate-900 tracking-wide">
                        ₹{hackathon.prize_3rd}
                      </p>
                    </div>
                  </div>
                  <Award className="w-7 h-7 text-amber-600" />
                </div>
              ) : null}

              {/* Participant Perks */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Verified Certificates for all attendees</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>Exclusive mentorship & industry jury network</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              EVENT TIMELINE / MILESTONES (CREATIVE STAGE ROADMAP DECK)
              =================================================================== */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900 leading-none">
                    Event Roadmap
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live Schedule & Milestones
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/60">
                IST (UTC+5:30)
              </span>
            </div>

            <div className="space-y-3">
              {/* Milestone 1: Registration Opens */}
              <div className="group relative overflow-hidden rounded-2xl border p-3.5 transition-all bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-violet-300 hover:shadow-xs">
                <div className="flex items-center gap-3">
                  
                  {/* Calendar Chip */}
                  <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-violet-200 leading-none">
                      {getMonthShort(hackathon.registration_opens_at)}
                    </span>
                    <span className="font-anton text-lg leading-tight mt-0.5">
                      {getDayNumber(hackathon.registration_opens_at)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
                        Stage 01 • Launch
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Opened
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      Registration Opens
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formatTime(hackathon.registration_opens_at)}</span>
                    </p>
                  </div>

                </div>
              </div>

              {/* Milestone 2: Registration Closes (Active Highlight Card) */}
              <div className={`group relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                isRegistrationOpen
                  ? "bg-gradient-to-r from-violet-50/80 via-white to-amber-50/40 border-violet-300/90 shadow-xs ring-1 ring-violet-200/50"
                  : isRegistrationClosed
                  ? "bg-slate-50/50 border-slate-200/90"
                  : "bg-white border-slate-200/90"
              }`}>
                <div className="flex items-center gap-3">
                  
                  {/* Calendar Chip */}
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 shadow-xs ${
                    isRegistrationOpen 
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" 
                      : "bg-slate-800 text-white"
                  }`}>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-100 leading-none">
                      {getMonthShort(hackathon.registration_closes_at)}
                    </span>
                    <span className="font-anton text-lg leading-tight mt-0.5">
                      {getDayNumber(hackathon.registration_closes_at)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Stage 02 • Deadline
                      </span>
                      {isRegistrationOpen ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Live Now
                        </span>
                      ) : isRegistrationClosed ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-slate-200 text-slate-700">
                          Closed
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-slate-100 text-slate-500">
                          Upcoming
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      Registration Closes
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formatTime(hackathon.registration_closes_at)}</span>
                      {isRegistrationOpen && countdown.days > 0 && (
                        <span className="text-amber-700 font-semibold ml-1">({countdown.days}d left)</span>
                      )}
                    </p>
                  </div>

                </div>
              </div>

              {/* Milestone 3: Kickoff */}
              <div className="group relative overflow-hidden rounded-2xl border p-3.5 transition-all bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-emerald-300 hover:shadow-xs">
                <div className="flex items-center gap-3">
                  
                  {/* Calendar Chip */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200 leading-none">
                      {getMonthShort(hackathon.hackathon_starts_at)}
                    </span>
                    <span className="font-anton text-lg leading-tight mt-0.5">
                      {getDayNumber(hackathon.hackathon_starts_at)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Stage 03 • Action
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Arena Kickoff
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      Hackathon Starts
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{formatTime(hackathon.hackathon_starts_at)}</span>
                      <span className="text-slate-500 font-semibold">• {hackathon.mode || "Offline"}</span>
                    </p>
                  </div>

                </div>
              </div>

              {/* Milestone 4: Grand Finale (if ends_at exists) */}
              {hackathon.hackathon_ends_at && (
                <div className="group relative overflow-hidden rounded-2xl border p-3.5 transition-all bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-indigo-300 hover:shadow-xs">
                  <div className="flex items-center gap-3">
                    
                    {/* Calendar Chip */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-200 leading-none">
                        {getMonthShort(hackathon.hackathon_ends_at)}
                      </span>
                      <span className="font-anton text-lg leading-tight mt-0.5">
                        {getDayNumber(hackathon.hackathon_ends_at)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                          Stage 04 • Grand Finale
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Demo & Awards
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        Hackathon Concludes
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatTime(hackathon.hackathon_ends_at)}</span>
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ===================================================================
              OFFICIAL WHATSAPP GROUP HUB (COMMUNITY)
              =================================================================== */}
          {hackathon.whatsapp_group_link && (
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between pb-3.5 border-b border-emerald-500/20 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-anton text-xl uppercase tracking-wide text-white leading-none">
                      Official WhatsApp Group
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Live Broadcast & Mentors
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal relative z-10">
                Join the official hackathon WhatsApp group to receive stage announcements, schedule updates, and live coordinator support.
              </p>

              <div className="pt-2 relative z-10">
                <a
                  href={hackathon.whatsapp_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Official Group</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          )}

          {/* ===================================================================
              EVENT COORDINATORS HUB
              =================================================================== */}
          {coordinators.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Phone className="w-5 h-5 text-violet-600" />
                <h3 className="font-anton text-xl uppercase tracking-wide text-slate-900">
                  Event Coordinators
                </h3>
              </div>

              <div className="space-y-3">
                {coordinators.map((c: any, i: number) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl hover:bg-white hover:shadow-sm transition-all">
                    <p className="font-bold text-sm text-slate-900">{c.name}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {c.phone && (
                        <a 
                          href={`tel:${c.phone}`} 
                          className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{c.phone}</span>
                        </a>
                      )}
                      {c.email && (
                        <a 
                          href={`mailto:${c.email}`} 
                          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 truncate"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* =========================================================================
          SHARE INVITATION MODAL DIALOG (POLISHED SAAS GRADE)
          ========================================================================= */}
      {isInviteModalOpen && userTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            
            <button 
              onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold shadow-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                  Invite Teammate
                </h3>
                <p className="text-xs font-semibold text-slate-500">Squad: {userTeam.name}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed font-normal">
              Send an invite directly to a student. Once sent, they can accept it from their <strong className="text-slate-900">Invitations</strong> dashboard to immediately join your squad.
            </p>

            <form onSubmit={handleSendInvitation} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Teammate&apos;s Registered Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. teammate@sonatech.ac.in"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20 font-medium transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-normal">
                  Make sure they already have an active student account on Eventrix with this email.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
                  disabled={isSendingInvite}
                  className="border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider h-11 px-5 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSendingInvite || !inviteEmail.trim()}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all border border-violet-400/30"
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
