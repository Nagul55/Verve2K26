"use client";

import React, { useState, useTransition, Suspense } from "react";
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Save, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Trophy, 
  FileText, 
  PhoneCall, 
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSubEvent } from "@/actions/event.actions";

function CoordinatorSubEventForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    participation_type: "Individual",
    min_candidates: "1",
    max_candidates: "1",
    capacity: "100",
    date: "",
    time: "",
    location: "",
    rules: "",
    prize_pool: "",
    fee: "Free",
    contact_info: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto adjust max_candidates if participation_type is Individual
      if (name === "participation_type" && value === "Individual") {
        updated.min_candidates = "1";
        updated.max_candidates = "1";
      } else if (name === "participation_type" && value === "Team" && prev.max_candidates === "1") {
        updated.min_candidates = "2";
        updated.max_candidates = "4";
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: "", type: "" });

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setStatusMsg({ text: "Please fill out all required fields.", type: "error" });
      return;
    }

    startTransition(async () => {
      // Append rules and contact info to description if not in dedicated schema columns
      let fullDescription = formData.description;
      if (formData.rules.trim()) {
        fullDescription += `\n\nRULES & GUIDELINES:\n${formData.rules}`;
      }
      if (formData.prize_pool.trim()) {
        fullDescription += `\n\nPRIZES:\n${formData.prize_pool}`;
      }
      if (formData.contact_info.trim()) {
        fullDescription += `\n\nCONTACT: ${formData.contact_info}`;
      }

      const { success, error } = await createSubEvent({
        fest_id: '00000000-0000-0000-0000-000000000001',
        title: formData.title,
        description: fullDescription,
        category: formData.category,
        participation_type: formData.participation_type,
        date: formData.date || 'TBD',
        time: formData.time || 'TBD',
        location: formData.location,
        capacity: parseInt(formData.capacity) || 100,
        min_candidates: parseInt(formData.min_candidates) || 1,
        max_candidates: parseInt(formData.max_candidates) || 1,
      });

      if (error) {
        setStatusMsg({ text: error, type: "error" });
      } else {
        setStatusMsg({ text: "Sub-Event created successfully!", type: "success" });
        setTimeout(() => {
          router.push('/coordinator/events');
          router.refresh();
        }, 1200);
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/coordinator/events" 
          className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Manage Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Create Sub-Event
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Coordinator Panel: Add a new technical or non-technical activity, set team requirements, seat limits, and schedule details.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Event Details */}
          <div>
            <h2 className="text-sm font-bold text-eventrix-black uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D9D9DF] pb-3">
              <PlusCircle className="w-4 h-4 text-eventrix-lavender" /> 1. Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                  Sub-Event Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Code Clash 2026 / HackSprint" 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                  Event Description <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  rows={3} 
                  placeholder="Describe the objective, format, and overview of this activity..." 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium"
                >
                  <option value="Technical">Technical</option>
                  <option value="Non-Technical">Non-Technical</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Participation Format</label>
                <select 
                  name="participation_type" 
                  value={formData.participation_type} 
                  onChange={handleChange} 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium"
                >
                  <option value="Individual">Individual Entry</option>
                  <option value="Team">Team Participation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Candidate Requirements & Seat Limits */}
          <div>
            <h2 className="text-sm font-bold text-eventrix-black uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D9D9DF] pb-3">
              <Users className="w-4 h-4 text-eventrix-lavender" /> 2. Candidate Requirements & Capacity Limits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Min Candidates / Team
                </label>
                <input 
                  type="number" 
                  min="1" 
                  name="min_candidates" 
                  value={formData.min_candidates} 
                  onChange={handleChange} 
                  disabled={formData.participation_type === 'Individual'}
                  required 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium disabled:opacity-60" 
                />
                <span className="text-[11px] text-eventrix-muted">Min members required</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Max Candidates / Team
                </label>
                <input 
                  type="number" 
                  min="1" 
                  name="max_candidates" 
                  value={formData.max_candidates} 
                  onChange={handleChange} 
                  disabled={formData.participation_type === 'Individual'}
                  required 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium disabled:opacity-60" 
                />
                <span className="text-[11px] text-eventrix-muted">Max members allowed per team</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                  Max Seats / Total Capacity
                </label>
                <input 
                  type="number" 
                  min="1" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
                <span className="text-[11px] text-eventrix-muted">Overall registration cap</span>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule & Location */}
          <div>
            <h2 className="text-sm font-bold text-eventrix-black uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D9D9DF] pb-3">
              <Calendar className="w-4 h-4 text-eventrix-lavender" /> 3. Schedule & Venue Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Event Date
                </label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Start Time
                </label>
                <input 
                  type="time" 
                  name="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Venue / Room <span className="text-red-500">*</span>
                </label>
                <input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Lab Complex 302 / Main Block" 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>
            </div>
          </div>

          {/* Section 4: Rules, Prizes & Additional Options */}
          <div>
            <h2 className="text-sm font-bold text-eventrix-black uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D9D9DF] pb-3">
              <Trophy className="w-4 h-4 text-eventrix-lavender" /> 4. Rules, Prizes & Coordinator Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Rules & Instructions
                </label>
                <textarea 
                  name="rules" 
                  value={formData.rules} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="e.g. Bring valid college ID card. Laptops required. Max 2 rounds..." 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Prize Pool & Cash Awards
                </label>
                <textarea 
                  name="prize_pool" 
                  value={formData.prize_pool} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="e.g. 1st Prize: ₹5,000 | 2nd Prize: ₹3,000 + Certificates for all" 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Entry Pass / Fee
                </label>
                <input 
                  name="fee" 
                  value={formData.fee} 
                  onChange={handleChange} 
                  placeholder="e.g. Free or ₹100 per team" 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" /> Coordinator Contact Person
                </label>
                <input 
                  name="contact_info" 
                  value={formData.contact_info} 
                  onChange={handleChange} 
                  placeholder="e.g. Imran (+91 9876543210)" 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>
            </div>
          </div>

          {/* Error / Success Status Notice */}
          {statusMsg.text && (
            <div className={`p-4 rounded-md text-sm font-bold flex items-center gap-3 ${
              statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 w-full justify-center cursor-pointer"
            >
              {isPending ? "Creating Sub-Event..." : <><Save className="w-4 h-4" /> Publish Sub-Event</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function CoordinatorCreateSubEventPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-eventrix-muted font-bold">Loading form...</div>}>
      <CoordinatorSubEventForm />
    </Suspense>
  );
}
