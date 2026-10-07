"use client";

import React, { useState } from "react";
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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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

  const isLeader = Boolean(
    userTeam && (
      (currentUserId && userTeam.leader_id === currentUserId) ||
      (!currentUserId && userTeam.members?.some((m: any) => m.participant_id === userTeam.leader_id))
    )
  );

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

  const isRegistrationOpen = new Date() >= new Date(hackathon.registration_opens_at) && new Date() <= new Date(hackathon.registration_closes_at);
  const registrationStatus = isRegistrationOpen 
    ? "Registration Open" 
    : new Date() < new Date(hackathon.registration_opens_at) 
      ? "Not Yet Started" 
      : "Registration Closed";

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white pt-24 pb-32 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/90 z-0"></div>
        <div className="absolute top-0 right-0 p-32 opacity-20 transform translate-x-1/3 -translate-y-1/3">
          <Code className="w-96 h-96 text-indigo-400" />
        </div>
        
        <div className="container relative z-10 mx-auto px-6 max-w-5xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/30 backdrop-blur-sm">
            {registrationStatus}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
            {fest.name}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl leading-relaxed">
            {hackathon.tagline || fest.description}
          </p>
          
          <div className="flex flex-wrap gap-4 mb-10">
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-4 py-3 border border-slate-700/50 backdrop-blur-sm">
              <CalendarDays className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs text-slate-400">Hackathon Dates</p>
                <p className="text-sm font-semibold">{formatDate(hackathon.hackathon_starts_at)} - {formatDate(hackathon.hackathon_ends_at)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-4 py-3 border border-slate-700/50 backdrop-blur-sm">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-slate-400">Venue</p>
                <p className="text-sm font-semibold">{hackathon.venue || "TBA"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-4 py-3 border border-slate-700/50 backdrop-blur-sm">
              <Users className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Team Size</p>
                <p className="text-sm font-semibold">{hackathon.minimum_team_size} - {hackathon.maximum_team_size} Members</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {userTeam ? (
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-14 text-lg shadow-lg shadow-emerald-900/20 transition-all cursor-default">
                Registered: {userTeam.name}
              </Button>
            ) : (
              <Link href={`/hackathons/${fest.id}/register`}>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 h-14 text-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-105" disabled={!isRegistrationOpen}>
                  {isRegistrationOpen 
                    ? "Register Team Now" 
                    : (new Date() < new Date(hackathon.registration_opens_at) 
                        ? "Not Yet Started" 
                        : "Registration Closed")}
                </Button>
              </Link>
            )}
            <a href="#problem-statements">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:text-white transition-all text-white backdrop-blur-sm">
                View Problem Statements
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            
            {userTeam && (
              <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden ring-2 ring-emerald-500/50">
                <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold dark:text-white">Your Team: {userTeam.name}</h2>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">You are successfully registered!</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase">
                        Team Members ({userTeam.members?.length || 1} / {hackathon.maximum_team_size})
                      </p>
                      {userTeam.pendingInvitations && userTeam.pendingInvitations.length > 0 && (
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40">
                          {userTeam.pendingInvitations.length} Pending
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {userTeam.members?.map((member: any) => (
                        <div key={member.participant_id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                            {member.participants?.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-white">{member.participants?.full_name || "Unknown User"}</p>
                            {member.participant_id === userTeam.leader_id && (
                              <span className="text-xs text-emerald-500 font-medium">Team Leader</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Pending invitations */}
                      {userTeam.pendingInvitations?.map((inv: any) => (
                        <div key={inv.participant_id} className="flex items-center justify-between p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-dashed border-amber-300 dark:border-amber-800/60">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs">
                              {inv.participants?.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {inv.participants?.full_name || inv.participants?.email || "Invited Student"}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Invitation Pending</span>
                              </div>
                            </div>
                          </div>
                          {Boolean(userTeam) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-7 px-2"
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-semibold tracking-wider uppercase">Invite Members with Passcode</p>
                    <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <code className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-widest">{userTeam.passcode}</code>
                      <div className="flex items-center gap-2">
                        {Boolean(userTeam) && (
                          <Button 
                            size="sm" 
                            onClick={() => setIsInviteModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm active:translate-y-[1px]"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Share Invitation
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => {
                          navigator.clipboard.writeText(userTeam.passcode);
                          toast.success("Passcode copied to clipboard!");
                        }}>
                          Copy Code
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Share Invitation Modal */}
            {isInviteModalOpen && userTeam && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                  <button 
                    onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold dark:text-white">Share Team Invitation</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Team: {userTeam.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
                    Send an invitation directly to a registered student. The invite will appear in their <strong className="text-indigo-600 dark:text-indigo-400">Invitations</strong> section where they can accept it to join your team.
                  </p>
                  <form onSubmit={handleSendInvitation} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        Teammate&apos;s Registered Email
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="e.g. teammate@sonatech.ac.in"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                        Make sure they have already signed up on Eventrix with this email address.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setIsInviteModalOpen(false); setInviteEmail(""); }}
                        disabled={isSendingInvite}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSendingInvite || !inviteEmail.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                      >
                        {isSendingInvite ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">About The Hackathon</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line text-slate-600 dark:text-slate-300 leading-relaxed">
                    {hackathon.description || "Get ready for an intense coding experience. Form your team, select a problem statement, and build innovative solutions within the timeframe!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Problem Statements */}
            <div id="problem-statements" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold dark:text-white">Problem Statements</h2>
              </div>
              
              {problemStatements.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center bg-white/50 dark:bg-slate-900/50">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">Problem statements will be revealed soon.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {problemStatements.map((ps, index) => (
                    <div 
                      key={ps.id} 
                      className={`border rounded-xl overflow-hidden transition-all duration-300 ${expandedStatement === ps.id ? 'border-indigo-500 shadow-lg dark:bg-slate-800/80 bg-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                    >
                      <button 
                        className="w-full p-6 text-left flex items-center justify-between focus:outline-none"
                        onClick={() => setExpandedStatement(expandedStatement === ps.id ? null : ps.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                            #{index + 1}
                          </div>
                          <h3 className="font-bold text-lg dark:text-slate-200">{ps.title || (ps.file_name ? ps.file_name.replace(/\.[^/.]+$/, '') : `Problem Statement #${index + 1}`)}</h3>
                        </div>
                        {expandedStatement === ps.id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                      </button>
                      
                      {expandedStatement === ps.id && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                          {ps.description && (
                            <p className="text-slate-600 dark:text-slate-300 mb-4 mt-4 whitespace-pre-line">
                              {ps.description}
                            </p>
                          )}
                          
                          {ps.file_url && (
                            <div className="mt-4 flex gap-3">
                              <a href={ps.file_url} target="_blank" rel="noreferrer">
                                <Button className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-none gap-2">
                                  <Download className="w-4 h-4" />
                                  Download Attachment
                                </Button>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Rules Section */}
            {hackathon.rules && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Rules & Guidelines</h2>
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <CardContent className="p-8 prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">
                      {hackathon.rules}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden sticky top-8">
              <div className="h-1 bg-indigo-500"></div>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Prize Pool
                </h3>
                
                <div className="space-y-4">
                  {hackathon.prize_1st && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-bold text-xs">1</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">1st Prize</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hackathon.prize_1st}</p>
                      </div>
                    </div>
                  )}
                  {hackathon.prize_2nd && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold text-xs">2</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">2nd Prize</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hackathon.prize_2nd}</p>
                      </div>
                    </div>
                  )}
                  {hackathon.prize_3rd && (
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold text-xs">3</div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">3rd Prize</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{hackathon.prize_3rd}</p>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-6 border-slate-100 dark:border-slate-800" />
                
                <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-slate-500" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  <div className="relative pl-6 border-l-2 border-indigo-200 dark:border-indigo-900 pb-4">
                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1"></div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">Registration Opens</p>
                    <p className="text-sm font-medium dark:text-slate-300">{formatPPP(hackathon.registration_opens_at)}</p>
                    <p className="text-xs text-slate-500">{formatTime(hackathon.registration_opens_at)}</p>
                  </div>
                  <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 pb-4">
                    <div className="absolute w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-full -left-[7px] top-1"></div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Registration Closes</p>
                    <p className="text-sm font-medium dark:text-slate-300">{formatPPP(hackathon.registration_closes_at)}</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[7px] top-1"></div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Hackathon Begins</p>
                    <p className="text-sm font-medium dark:text-slate-300">{formatPPP(hackathon.hackathon_starts_at)}</p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

