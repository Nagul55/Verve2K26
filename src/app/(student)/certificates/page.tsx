import React from "react";
import { getParticipantRegistrations } from "@/actions/event.actions";
import { getCurrentUser } from "@/lib/auth/get-user";
import { CertificatesClient } from "./CertificatesClient";
import Link from "next/link";
import { Calendar, Award, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const [{ profile }, registeredEvents] = await Promise.all([
    getCurrentUser(),
    getParticipantRegistrations()
  ]);

  // Filter completed events where student registered AND participated (attended)
  const completedEvents = (registeredEvents || []).filter(e => e.isCompletedEvent);

  const participant = profile ? {
    name: profile.full_name || 'Participant',
    registerNumber: profile.register_number || 'N/A',
    department: profile.department || 'General',
    college: profile.college || 'Sona College of Technology'
  } : {
    name: 'Participant',
    registerNumber: 'N/A',
    department: 'General',
    college: 'Sona College of Technology'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-[#D9D9DF] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Award className="w-3.5 h-3.5 text-emerald-600" /> Verified Participation
            </span>
            <span className="text-xs font-bold text-eventrix-muted uppercase tracking-wider">
              {completedEvents.length} Issued
            </span>
          </div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            My Certificates
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Official Certificates of Participation for completed events you attended.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-white border border-[#D9D9DF] text-eventrix-black px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <CertificatesClient completedEvents={completedEvents} participant={participant} />
    </div>
  );
}
