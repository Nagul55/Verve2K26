"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, Users, User, Check, ShieldAlert, Trophy, Phone, ArrowRight, Loader2 } from "lucide-react";
import { registerForEvents } from "@/actions/event.actions";
import { toast } from "sonner";

export interface SubEvent {
  id: string;
  fest_id: string;
  title: string;
  description: string;
  category: "Technical" | "Non-Technical" | string;
  participation_type: "Individual" | "Team" | string;
  date: string;
  time: string;
  location: string;
  capacity?: number;
  min_candidates?: number;
  max_candidates?: number;
  status?: string;
  rules?: string;
  prize_pool?: string;
  contact_info?: string;
  image_url?: string;
  poster_url?: string;
  banner_url?: string;
}

interface EventDetailsModalProps {
  event: SubEvent | null;
  festId: string;
  isRegistered?: boolean;
  registeredCount?: number;
  onClose: () => void;
  onRegisterSuccess?: (eventId: string) => void;
}

export function parseEventData(event: SubEvent) {
  const description = event.description || "";

  // Extract team size header if present: [Team Size: 2 to 3 Members]
  let teamSizeHeader: string | null = null;
  const teamSizeMatch = description.match(/\[Team Size:\s*([^\]]+)\]/i);
  if (teamSizeMatch) {
    teamSizeHeader = teamSizeMatch[1].trim();
  }

  // Remove [Team Size: ...] tag from clean description
  let cleanDesc = description.replace(/\[Team Size:\s*[^\]]+\]/gi, '').trim();

  let rulesSection: string[] = [];
  let prizesSection: string | null = null;
  let contactSection: { name?: string; phone?: string; email?: string; raw?: string } | null = null;

  // 1. RULES & GUIDELINES
  if (event.rules && typeof event.rules === 'string' && event.rules.trim()) {
    rulesSection = event.rules.split('\n').map(r => r.trim()).filter(Boolean);
  } else if (cleanDesc.includes('RULES & GUIDELINES:')) {
    const parts = cleanDesc.split(/RULES & GUIDELINES:/i);
    cleanDesc = parts[0].trim();
    let remaining = parts[1] || '';

    let rulesText = remaining;
    if (remaining.includes('PRIZES:')) {
      const rParts = remaining.split(/PRIZES:/i);
      rulesText = rParts[0];
      remaining = 'PRIZES:' + rParts[1];
    } else if (remaining.includes('CONTACT:')) {
      const rParts = remaining.split(/CONTACT:/i);
      rulesText = rParts[0];
      remaining = 'CONTACT:' + rParts[1];
    } else {
      remaining = '';
    }

    rulesSection = rulesText
      .split('\n')
      .map(line => line.replace(/^[•\-\*\s]+/, '').trim())
      .filter(Boolean);

    if (remaining) {
      if (remaining.includes('PRIZES:')) {
        const pParts = remaining.split(/PRIZES:/i);
        let prizeText = pParts[1] || '';
        if (prizeText.includes('CONTACT:')) {
          const cParts = prizeText.split(/CONTACT:/i);
          prizesSection = cParts[0].trim();
          contactSection = parseContactStr(cParts[1]?.trim() || '');
        } else {
          prizesSection = prizeText.trim();
        }
      } else if (remaining.includes('CONTACT:')) {
        const cParts = remaining.split(/CONTACT:/i);
        contactSection = parseContactStr(cParts[1]?.trim() || '');
      }
    }
  }

  // 2. PRIZES
  if (!prizesSection) {
    if (event.prize_pool && typeof event.prize_pool === 'string' && event.prize_pool.trim()) {
      prizesSection = event.prize_pool.trim();
    } else if (cleanDesc.includes('PRIZES:')) {
      const parts = cleanDesc.split(/PRIZES:/i);
      cleanDesc = parts[0].trim();
      let remaining = parts[1] || '';
      if (remaining.includes('CONTACT:')) {
        const pParts = remaining.split(/CONTACT:/i);
        prizesSection = pParts[0].trim();
        contactSection = parseContactStr(pParts[1]?.trim() || '');
      } else {
        prizesSection = remaining.trim();
      }
    }
  }

  // 3. CONTACT
  if (!contactSection) {
    if (event.contact_info && typeof event.contact_info === 'string' && event.contact_info.trim()) {
      contactSection = parseContactStr(event.contact_info.trim());
    } else if (cleanDesc.includes('CONTACT:')) {
      const parts = cleanDesc.split(/CONTACT:/i);
      cleanDesc = parts[0].trim();
      const contactText = parts[1]?.trim() || '';
      contactSection = parseContactStr(contactText);
    }
  }

  // Determine Team Size text
  let teamSizeText = "1 Member";
  if (event.participation_type === "Team") {
    if (event.min_candidates && event.max_candidates) {
      teamSizeText = event.min_candidates === event.max_candidates
        ? `${event.min_candidates} Members`
        : `${event.min_candidates}–${event.max_candidates} Members`;
    } else if (teamSizeHeader) {
      teamSizeText = teamSizeHeader;
    } else {
      teamSizeText = "Team Event";
    }
  }

  return {
    cleanDescription: cleanDesc.trim(),
    rules: rulesSection.length > 0 ? rulesSection : null,
    prizes: prizesSection || null,
    contact: contactSection,
    teamSizeText
  };
}

function parseContactStr(str: string) {
  if (!str) return null;
  const phoneMatch = str.match(/(\+?\d[\d\s\-]{8,14}\d)/);
  const emailMatch = str.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  let name = str;

  if (phoneMatch) {
    name = name.replace(phoneMatch[0], '');
  }
  if (emailMatch) {
    name = name.replace(emailMatch[0], '');
  }

  name = name.replace(/[()\-|\s:]+/g, ' ').trim();

  return {
    name: name || undefined,
    phone: phoneMatch ? phoneMatch[0].trim() : undefined,
    email: emailMatch ? emailMatch[0].trim() : undefined,
    raw: str
  };
}

export function EventDetailsModal({
  event,
  festId,
  isRegistered = false,
  registeredCount = 0,
  onClose,
  onRegisterSuccess
}: EventDetailsModalProps) {
  const [localRegistered, setLocalRegistered] = useState(isRegistered);
  const [isPending, setIsPending] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");

  useEffect(() => {
    setLocalRegistered(isRegistered);
  }, [isRegistered]);

  // Lock body scroll while modal is open, preserving scroll position on close
  useEffect(() => {
    if (!event) return;
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  const parsed = parseEventData(event);
  const isTeam = event.participation_type === "Team";
  const capacity = event.capacity || 100;
  const isFull = registeredCount >= capacity;
  const isClosed = event.status === "Closed";

  const posterUrl = event.image_url || event.poster_url || event.banner_url || null;

  const handleRegisterClick = () => {
    if (localRegistered || isFull || isClosed || isPending) return;

    if (isTeam && !showTeamForm) {
      setShowTeamForm(true);
      return;
    }

    executeRegistration();
  };

  const executeRegistration = async () => {
    if (isTeam && !teamName.trim()) {
      toast.error("Please enter a team name to register.");
      return;
    }

    setIsPending(true);
    try {
      const teamNamesMap = isTeam ? { [event.id]: teamName.trim() } : undefined;
      const teamMembersMap = isTeam && teamMembers.trim() ? { [event.id]: teamMembers.trim() } : undefined;

      const res = await registerForEvents(festId, [event.id], teamNamesMap, teamMembersMap);

      if (res.success) {
        toast.success(`Successfully registered for ${event.title}!`);
        setLocalRegistered(true);
        setShowTeamForm(false);
        if (onRegisterSuccess) {
          onRegisterSuccess(event.id);
        }
      } else {
        toast.error(res.error || "Failed to register for event.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="relative w-full max-w-3xl bg-white border border-[#D9D9DF] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#D9D9DF] bg-[#F8F8FC]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-eventrix-lavender uppercase tracking-widest bg-eventrix-lavender/10 px-2.5 py-1 rounded-sm border border-eventrix-lavender/20">
                {event.category} • {event.participation_type}
              </span>
            </div>
            <h2 id="event-modal-title" className="font-anton text-2xl sm:text-3xl text-eventrix-black uppercase tracking-wide">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-eventrix-muted hover:text-eventrix-black hover:bg-[#EBEBF0] rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Layout: Poster (if present) + Info */}
          <div className={`grid grid-cols-1 ${posterUrl ? 'md:grid-cols-12' : ''} gap-6`}>
            
            {posterUrl && (
              <div className="md:col-span-5 flex justify-center items-start">
                <img
                  src={posterUrl}
                  alt={`${event.title} Poster`}
                  className="w-full max-h-[350px] object-cover rounded-md border border-[#D9D9DF] shadow-sm"
                />
              </div>
            )}

            <div className={posterUrl ? 'md:col-span-7 space-y-6' : 'space-y-6'}>
              {/* Event Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F8F8FC] p-4 rounded-md border border-[#EBEBF0]">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-eventrix-lavender" /> Date
                  </span>
                  <p className="text-xs font-bold text-eventrix-black">{event.date || 'TBD'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3 text-eventrix-lavender" /> Time
                  </span>
                  <p className="text-xs font-bold text-eventrix-black">{event.time || 'TBD'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-eventrix-lavender" /> Venue
                  </span>
                  <p className="text-xs font-bold text-eventrix-black line-clamp-1">{event.location || 'TBD'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <Users className="w-3 h-3 text-eventrix-lavender" /> Type
                  </span>
                  <p className="text-xs font-bold text-eventrix-black">{event.participation_type}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <User className="w-3 h-3 text-eventrix-lavender" /> Team Size
                  </span>
                  <p className="text-xs font-bold text-eventrix-black">{parsed.teamSizeText}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                  Description
                </h3>
                <p className="text-xs text-eventrix-black/80 leading-relaxed font-medium whitespace-pre-line">
                  {parsed.cleanDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Rules & Guidelines */}
          {parsed.rules && parsed.rules.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-[#D9D9DF]">
              <h3 className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-eventrix-lavender" /> Rules & Guidelines
              </h3>
              <ul className="space-y-1.5 text-xs text-eventrix-black/80 list-disc pl-5 font-medium">
                {parsed.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prizes & Rewards */}
          {parsed.prizes && (
            <div className="space-y-2 pt-4 border-t border-[#D9D9DF]">
              <h3 className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-eventrix-lavender" /> Prizes & Rewards
              </h3>
              <div className="text-xs text-eventrix-black/90 whitespace-pre-line font-medium bg-[#F8F8FC] p-3 rounded-md border border-[#EBEBF0]">
                {parsed.prizes}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {parsed.contact && (parsed.contact.name || parsed.contact.phone || parsed.contact.email || parsed.contact.raw) && (
            <div className="space-y-2 pt-4 border-t border-[#D9D9DF]">
              <h3 className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4 text-eventrix-lavender" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium bg-[#F8F8FC] p-3 rounded-md border border-[#EBEBF0]">
                {parsed.contact.name && (
                  <div>
                    <span className="text-[10px] font-bold text-eventrix-muted uppercase block">Contact Person</span>
                    <span className="text-eventrix-black font-semibold">{parsed.contact.name}</span>
                  </div>
                )}
                {parsed.contact.phone && (
                  <div>
                    <span className="text-[10px] font-bold text-eventrix-muted uppercase block">Phone</span>
                    <a href={`tel:${parsed.contact.phone}`} className="text-eventrix-black hover:text-eventrix-lavender font-semibold underline decoration-dotted">
                      {parsed.contact.phone}
                    </a>
                  </div>
                )}
                {parsed.contact.email && (
                  <div>
                    <span className="text-[10px] font-bold text-eventrix-muted uppercase block">Email</span>
                    <a href={`mailto:${parsed.contact.email}`} className="text-eventrix-black hover:text-eventrix-lavender font-semibold underline decoration-dotted">
                      {parsed.contact.email}
                    </a>
                  </div>
                )}
                {!parsed.contact.name && !parsed.contact.phone && !parsed.contact.email && parsed.contact.raw && (
                  <div className="col-span-full">
                    <span className="text-eventrix-black font-semibold">{parsed.contact.raw}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Registration Inline Form */}
          {showTeamForm && !localRegistered && (
            <div className="space-y-4 p-4 bg-eventrix-lavender/10 border border-eventrix-lavender/30 rounded-md animate-in fade-in duration-200">
              <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-widest">
                Team Details Required
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-eventrix-muted uppercase block mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name"
                    className="w-full text-xs px-3 py-2 border border-[#D9D9DF] rounded-md bg-white focus:outline-none focus:border-eventrix-lavender font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-eventrix-muted uppercase block mb-1">
                    Team Member Emails (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={(e) => setTeamMembers(e.target.value)}
                    placeholder="e.g. member1@example.com, member2@example.com"
                    className="w-full text-xs px-3 py-2 border border-[#D9D9DF] rounded-md bg-white focus:outline-none focus:border-eventrix-lavender font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Registration Action Bar */}
        <div className="p-6 border-t border-[#D9D9DF] bg-white">
          {localRegistered ? (
            <button
              disabled
              className="w-full bg-emerald-600 text-white font-bold text-sm tracking-wide uppercase py-3.5 rounded-md flex items-center justify-center gap-2 cursor-default opacity-90 shadow-sm"
            >
              <Check className="w-4 h-4" /> Registered ✓
            </button>
          ) : isClosed ? (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 font-bold text-sm tracking-wide uppercase py-3.5 rounded-md flex items-center justify-center gap-2 cursor-not-allowed"
            >
              Registration Closed
            </button>
          ) : isFull ? (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-500 font-bold text-sm tracking-wide uppercase py-3.5 rounded-md flex items-center justify-center gap-2 cursor-not-allowed"
            >
              Event Full
            </button>
          ) : showTeamForm ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowTeamForm(false)}
                className="px-4 py-3.5 border border-[#D9D9DF] rounded-md font-bold text-xs uppercase text-eventrix-muted hover:text-eventrix-black hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={executeRegistration}
                disabled={isPending}
                className="flex-1 bg-eventrix-black text-white px-8 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_#A78BFA] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                  </>
                ) : (
                  <>
                    Confirm Registration <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRegisterClick}
              disabled={isPending}
              className="w-full bg-eventrix-black text-white px-8 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-eventrix-lavender hover:text-black transition-all shadow-[4px_4px_0px_0px_#A78BFA] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Register Now <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
