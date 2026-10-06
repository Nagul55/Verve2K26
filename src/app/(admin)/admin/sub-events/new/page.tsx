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
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSubEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { EventrixSelect } from "@/components/ui/EventrixSelect";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixTimePicker } from "@/components/ui/EventrixTimePicker";
import { EventrixTextarea } from "@/components/ui/EventrixTextarea";

import EventrixResourceUploader, { EventResourceItem } from "@/components/ui/EventrixResourceUploader";

function AdminSubEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const festId = searchParams.get('fest_id') || '00000000-0000-0000-0000-000000000001';
  
  const [isPending, startTransition] = useTransition();
  const [resources, setResources] = useState<EventResourceItem[]>([]);

  const { formData, setFormData, resetForm } = useFormDraft({
    key: "eventrix_sub_event_form_draft",
    initialValues: {
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
    }
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

    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    startTransition(async () => {
      const { success, error } = await createSubEvent({
        fest_id: festId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        participation_type: formData.participation_type,
        min_candidates: parseInt(formData.min_candidates) || 1,
        max_candidates: parseInt(formData.max_candidates) || 1,
        capacity: parseInt(formData.capacity) || 100,
        date: formData.date || 'TBD',
        time: formData.time || 'TBD',
        location: formData.location,
        rules: formData.rules,
        prize_pool: formData.prize_pool,
        fee: formData.fee,
        contact_info: formData.contact_info,
        resources: resources
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success("Sub-Event created successfully!");
        resetForm();
        setResources([]);
        setTimeout(() => {
          router.push(`/admin/sub-events?fest_id=${festId}`);
          router.refresh();
        }, 1200);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/admin/sub-events?fest_id=${festId}`} 
          className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Sub-Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Create Sub-Event
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Admin Portal: Add a new technical or non-technical activity, set team requirements, seat limits, and schedule details.
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

              <div className="md:col-span-2">
                <EventrixTextarea
                  label="Event Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  minHeight="120px"
                  placeholder="Describe the objective, format, and overview of this activity..."
                />
              </div>

              <EventrixSelect
                label="Category"
                name="category"
                value={formData.category}
                onChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                options={[
                  { value: "Technical", label: "Technical", description: "Technical sub-events and competitions" },
                  { value: "Non-Technical", label: "Non-Technical", description: "Cultural, creative, and non-technical activities" },
                ]}
              />

              <EventrixSelect
                label="Participation Format"
                name="participation_type"
                value={formData.participation_type}
                onChange={(val) => setFormData((prev) => ({ ...prev, participation_type: val }))}
                options={[
                  { value: "Individual", label: "Individual Entry", description: "One participant per registration" },
                  { value: "Team", label: "Team Participation", description: "Multiple participants per team" },
                ]}
              />
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
                <EventrixDatePicker
                  value={formData.date}
                  onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                  placeholder="Select Date"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Start Time
                </label>
                <EventrixTimePicker
                  value={formData.time}
                  onChange={(val) => setFormData(prev => ({ ...prev, time: val }))}
                  outputFormat="12h"
                  placeholder="Select Time"
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
              <EventrixTextarea
                label={
                  <span className="flex items-center gap-1.5 text-eventrix-muted">
                    <FileText className="w-3.5 h-3.5" /> Rules & Instructions
                  </span>
                }
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={8}
                minHeight="260px"
                helperText="Add rules, guidelines, eligibility conditions, judging criteria, or other instructions for participants."
                placeholder={`1. Participants must report 15 minutes prior to event start time.
2. College ID card is mandatory for verification.
3. Plagiarism or copying another participant's work will result in immediate disqualification.
4. The decisions of the event judges and coordinators will be final.`}
                className="col-span-1 md:col-span-2"
              />

              <EventrixTextarea
                label={
                  <span className="flex items-center gap-1.5 text-eventrix-muted">
                    <Trophy className="w-3.5 h-3.5" /> Prize Pool & Cash Awards
                  </span>
                }
                name="prize_pool"
                value={formData.prize_pool}
                onChange={handleChange}
                rows={4}
                minHeight="140px"
                placeholder="e.g. 1st Prize: ₹5,000 | 2nd Prize: ₹3,000 + Certificates for all participants"
                className="col-span-1 md:col-span-2"
              />

              <div className="space-y-2 col-span-1 md:col-span-2">
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
            </div>
          </div>

          {/* Section 5: Event Resources & Attachments */}
          <div className="pt-2">
            <EventrixResourceUploader
              subEventId={formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'new'}
              resources={resources}
              onChange={setResources}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 w-full justify-center cursor-pointer"
            >
              {isPending ? "Publishing Sub-Event..." : <><Save className="w-4 h-4" /> Publish Sub-Event</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function AdminCreateSubEventPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-eventrix-muted font-bold">Loading form...</div>}>
      <AdminSubEventForm />
    </Suspense>
  );
}
