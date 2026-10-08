"use client";

import React, { useEffect } from "react";
import { X, Calendar, Clock, MapPin, Users, User, ShieldAlert, Trophy, Phone, MessageCircle, ExternalLink } from "lucide-react";

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
  whatsapp_group_link?: string;
  coordinatorDetails?: Array<{ name?: string; phone?: string; email?: string }>;
  coordinatorNames?: string[];
  image_url?: string;
  poster_url?: string;
  banner_url?: string;
}

interface EventDetailsModalProps {
  event: SubEvent | null;
  onClose: () => void;
}

import { getFileIcon, formatFileSize } from "@/components/ui/EventrixResourceUploader";
import { Paperclip, Download, Eye } from "lucide-react";

export function parseEventData(event: SubEvent) {
  const description = event.description || "";

  // Extract team size header if present: [Team Size: 2 to 3 Members]
  let teamSizeHeader: string | null = null;
  const teamSizeMatch = description.match(/\[Team Size:\s*([^\]]+)\]/i);
  if (teamSizeMatch) {
    teamSizeHeader = teamSizeMatch[1].trim();
  }

  // Extract event resources JSON if present
  let eventResourcesList: any[] = (event as any).resources || [];
  const resourcesMatch = description.match(/\[EVENT_RESOURCES:\s*({[\s\S]*?}|\[[\s\S]*?\])\]/i);
  if (resourcesMatch) {
    try {
      const parsedRes = JSON.parse(resourcesMatch[1]);
      if (Array.isArray(parsedRes) && parsedRes.length > 0) {
        eventResourcesList = parsedRes;
      }
    } catch (e) {}
  }

  // Extract whatsapp_group_link
  let whatsappGroupLink = event.whatsapp_group_link || "";
  const waMatch = description.match(/\[WHATSAPP_GROUP:\s*([^\]]+)\]/i);
  if (waMatch) {
    if (!whatsappGroupLink) whatsappGroupLink = waMatch[1].trim();
  }

  // Remove tags from clean description
  let cleanDesc = description
    .replace(/\[Team Size:\s*[^\]]+\]/gi, '')
    .replace(/\[EVENT_RESOURCES:\s*({[\s\S]*?}|\[[\s\S]*?\])\]/gi, '')
    .replace(/\[WHATSAPP_GROUP:\s*[^\]]+\]/gi, '')
    .trim();

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
    whatsapp_group_link: whatsappGroupLink,
    resources: eventResourcesList,
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
  onClose
}: EventDetailsModalProps) {
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
  const posterUrl = event.image_url || event.poster_url || event.banner_url || null;

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

          {/* WhatsApp Group Link */}
          {parsed.whatsapp_group_link && (
            <div className="pt-4 border-t border-[#D9D9DF]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-eventrix-black uppercase tracking-wider flex items-center gap-1.5">
                      Official WhatsApp Group
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-eventrix-muted">
                      Join the participant group for live updates, slot schedules, and announcements
                    </p>
                  </div>
                </div>
                <a
                  href={parsed.whatsapp_group_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm hover:shadow shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Join Group
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(() => {
            const rawCoords = event.coordinatorDetails && event.coordinatorDetails.length > 0
              ? event.coordinatorDetails
              : parsed.contact && (parsed.contact.name || parsed.contact.phone || parsed.contact.email || parsed.contact.raw)
              ? [parsed.contact]
              : [];

            if (rawCoords.length === 0) return null;

            const coords = rawCoords.map((c: any) => ({
              name: c.name || 'Coordinator',
              phone: c.phone || parsed.contact?.phone || '',
              email: c.email || parsed.contact?.email || ''
            }));

            return (
              <div className="space-y-2 pt-4 border-t border-[#D9D9DF]">
                <h3 className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-2">
                  <Phone className="w-4 h-4 text-eventrix-lavender" /> Event Coordinator Contact
                </h3>
                <div className="space-y-2">
                  {coords.map((c: any, i: number) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium bg-[#F8F8FC] p-3.5 rounded-md border border-[#EBEBF0]">
                      <div>
                        <span className="text-[10px] font-bold text-eventrix-muted uppercase block mb-0.5">Coordinator</span>
                        <span className="text-eventrix-black font-semibold">{c.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-eventrix-muted uppercase block mb-0.5">Phone / Contact</span>
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} className="text-eventrix-black hover:text-eventrix-lavender font-semibold underline decoration-dotted flex items-center gap-1">
                            <Phone className="w-3 h-3 text-eventrix-lavender inline" /> {c.phone}
                          </a>
                        ) : (
                          <span className="text-eventrix-muted font-normal">Not Provided</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-eventrix-muted uppercase block mb-0.5">Email</span>
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="text-eventrix-black hover:text-eventrix-lavender font-semibold underline decoration-dotted truncate block">
                            {c.email}
                          </a>
                        ) : (
                          <span className="text-eventrix-muted font-normal">Not Provided</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Event Resources & Attachments */}
          {parsed.resources && parsed.resources.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#D9D9DF]">
              <h3 className="text-xs font-bold text-eventrix-black uppercase tracking-widest flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-eventrix-lavender" /> Event Resources & Attachments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsed.resources.map((res: any, idx: number) => (
                  <div
                    key={res.id || idx}
                    className="flex items-center justify-between gap-2 p-3 bg-white border border-[#EBEBF0] rounded-xl shadow-sm hover:border-eventrix-lavender transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F8F8FC] border border-[#D9D9DF] flex items-center justify-center shrink-0">
                        {getFileIcon(res.original_name || res.file_name, res.file_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-eventrix-black truncate" title={res.original_name || res.file_name}>
                          {res.original_name || res.file_name}
                        </p>
                        <p className="text-[10px] font-semibold text-eventrix-muted uppercase tracking-wider">
                          {formatFileSize(res.file_size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F8F8FC] text-eventrix-black hover:bg-eventrix-lavender transition-colors flex items-center gap-1 border border-[#D9D9DF]"
                      >
                        <Eye className="w-3 h-3" /> View
                      </a>
                      <a
                        href={res.file_url}
                        download
                        className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-eventrix-black text-white hover:bg-eventrix-lavender hover:text-black transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
