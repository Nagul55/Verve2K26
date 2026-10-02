"use client";

import React, { useState, useTransition, Suspense } from "react";
import { Plus, Calendar, MapPin, Clock, Save, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSubEvent } from "@/actions/event.actions";

function SubEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const festId = searchParams.get('fest_id') || '00000000-0000-0000-0000-000000000001';
  
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    participation_type: "Individual",
    date: "",
    time: "",
    location: "",
    capacity: "50"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: "", type: "" });

    startTransition(async () => {
      const { success, error } = await createSubEvent({
        fest_id: festId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        participation_type: formData.participation_type,
        date: formData.date || 'TBD',
        time: formData.time || 'TBD',
        location: formData.location,
        capacity: parseInt(formData.capacity)
      });

      if (error) {
        setStatusMsg({ text: error, type: "error" });
      } else {
        setStatusMsg({ text: "Sub-Event created successfully!", type: "success" });
        setTimeout(() => {
          router.push(`/admin/sub-events?fest_id=${festId}`);
          router.refresh();
        }, 1000);
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-10">
      
      <div className="flex flex-col gap-4">
        <Link href={`/admin/sub-events?fest_id=${festId}`} className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Sub-Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Create Sub-Event
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Add a new technical or non-technical activity to this Fest.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Sub-Event Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Code Clash" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="Describe the event..." className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#D9D9DF]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium">
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Participation Type</label>
              <select name="participation_type" value={formData.participation_type} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium">
                <option value="Individual">Individual</option>
                <option value="Team">Team</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#D9D9DF]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3" /> Event Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#D9D9DF]">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</label>
              <input name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Main Auditorium" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Max Capacity</label>
              <input type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
          </div>

          {statusMsg.text && (
            <div className={`p-4 rounded-md text-sm font-bold flex gap-3 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {statusMsg.text}
            </div>
          )}

          <div className="pt-6 border-t border-[#D9D9DF]">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-eventrix-lavender hover:text-eventrix-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] disabled:shadow-none flex items-center gap-2 w-full justify-center"
            >
              {isPending ? "Saving..." : <><Save className="w-4 h-4" /> Create Sub-Event</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateSubEventPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubEventForm />
    </Suspense>
  );
}
