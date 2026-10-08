"use client";

import React, { useState, useEffect, useTransition, use } from "react";
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
  IndianRupee,
  Loader2,
  AlertTriangle,
  MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSubEventById, updateSubEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import { EventrixSelect } from "@/components/ui/EventrixSelect";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixTimePicker } from "@/components/ui/EventrixTimePicker";
import { EventrixTextarea } from "@/components/ui/EventrixTextarea";
import EventrixResourceUploader, { EventResourceItem } from "@/components/ui/EventrixResourceUploader";

export default function CoordinatorEditSubEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [resources, setResources] = useState<EventResourceItem[]>([]);

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
    whatsapp_group_link: "",
    contact_info: ""
  });

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      const data = await getSubEventById(id);
      if (!data) {
        toast.error("Sub-event not found.");
        router.push("/coordinator/events");
        return;
      }
      setEventData(data);
      setFormData({
        title: data.title || "",
        description: data.cleanDescription || "",
        category: data.category || "Technical",
        participation_type: data.participation_type || "Individual",
        min_candidates: String(data.min_candidates || 1),
        max_candidates: String(data.max_candidates || 1),
        capacity: String(data.capacity || 100),
        date: data.date && data.date !== 'TBD' ? data.date : "",
        time: data.time && data.time !== 'TBD' ? data.time : "",
        location: data.location || "",
        rules: data.rules || "",
        prize_pool: data.prize_pool || "",
        fee: data.fee || "Free",
        whatsapp_group_link: data.whatsapp_group_link || "",
        contact_info: data.contact_info || ""
      });
      if (data.resources && Array.isArray(data.resources)) {
        setResources(data.resources);
      }
      setIsLoading(false);
    }
    loadEvent();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
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
      const res = await updateSubEvent(id, {
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
        whatsapp_group_link: formData.whatsapp_group_link,
        contact_info: formData.contact_info,
        resources: resources
      });

      if (!res.success) {
        toast.error(res.error || "Failed to update sub-event");
      } else {
        if (res.statusChangedToPending) {
          toast.warning("Sub-event edited! Changes submitted to Admin for re-approval.");
        } else {
          toast.success("Sub-event updated successfully!");
        }
        setTimeout(() => {
          router.push("/coordinator/events");
          router.refresh();
        }, 1200);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-eventrix-lavender animate-spin" />
        <p className="text-eventrix-muted font-bold text-sm">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/coordinator/events" 
          className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Manage Events
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
              Edit Sub-Event: {eventData?.title}
            </h1>
            <p className="text-eventrix-muted font-medium text-sm">
              Coordinator Panel: Update event schedule, rules, guidelines, and attachments.
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${
            eventData?.status === 'LIVE' ? 'bg-green-100 text-green-700 border border-green-300' :
            eventData?.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
            'bg-gray-100 text-gray-700 border border-gray-300'
          }`}>
            {eventData?.status}
          </span>
        </div>
      </div>

      {eventData?.status === 'LIVE' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3 text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Important Approval Notice</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This event is currently LIVE. Saving updates will send your changes for Admin review before republication.
            </p>
          </div>
        </div>
      )}

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

          {/* Section 4: Rules & Prizes */}
          <div>
            <h2 className="text-sm font-bold text-eventrix-black uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[#D9D9DF] pb-3">
              <Trophy className="w-4 h-4 text-eventrix-lavender" /> 4. Rules & Prizes
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
                placeholder="1. Report 15 mins prior..."
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
                placeholder="e.g. 1st Prize: ₹5,000"
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

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Group Link (Optional)
                </label>
                <input 
                  name="whatsapp_group_link" 
                  value={formData.whatsapp_group_link} 
                  onChange={handleChange} 
                  placeholder="https://chat.whatsapp.com/..." 
                  className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                />
              </div>
            </div>
          </div>

          {/* Section 5: Event Resources & Attachments */}
          <div className="pt-2">
            <EventrixResourceUploader
              subEventId={id}
              resources={resources}
              onChange={setResources}
            />
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-[#D9D9DF] flex items-center justify-between gap-4">
            <Link
              href="/coordinator/events"
              className="px-6 py-4 rounded-md font-bold text-xs tracking-wider uppercase border border-[#D9D9DF] text-eventrix-muted hover:text-eventrix-black hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>

            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? "Saving Changes..." : <><Save className="w-4 h-4" /> Save Sub-Event Changes</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
