"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { Plus, Save, ArrowLeft, Trash2, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createHackathon } from "@/actions/hackathon.actions";
import { getCachedCoordinators } from "@/actions/event.actions";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/DateTimePicker";

export default function CreateHackathonPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCachedCoordinators().then(setCoordinators);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    logo_url: "",
    registration_opens_date: "",
    registration_opens_time: "",
    registration_closes_date: "",
    registration_closes_time: "",
    hackathon_starts_date: "",
    hackathon_starts_time: "",
    hackathon_ends_date: "",
    hackathon_ends_time: "",
    maximum_teams: "",
    minimum_team_size: "1",
    maximum_team_size: "4",
    venue: "",
    coordinator_id: ""
  });

  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      const validFiles = newFiles.filter(file => {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} is not a PDF.`);
          return false;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit.`);
          return false;
        }
        return true;
      });

      setPdfFiles(prev => [...prev, ...validFiles]);
    }
    // reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCoordinator = coordinators.find(c => c.id === formData.coordinator_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(formData.minimum_team_size) > parseInt(formData.maximum_team_size)) {
      toast.error("Minimum team size cannot be greater than maximum team size.");
      return;
    }

    const regOpenDT = new Date(`${formData.registration_opens_date}T${formData.registration_opens_time}`);
    const regCloseDT = new Date(`${formData.registration_closes_date}T${formData.registration_closes_time}`);
    const startDT = new Date(`${formData.hackathon_starts_date}T${formData.hackathon_starts_time}`);
    const endDT = new Date(`${formData.hackathon_ends_date}T${formData.hackathon_ends_time}`);
    
    if (endDT < startDT) {
      toast.error("Hackathon end time cannot be before start time.");
      return;
    }

    if (formData.registration_opens_date && formData.registration_closes_date && regCloseDT < regOpenDT) {
      toast.error("Registration close cannot be before registration open.");
      return;
    }

    if (formData.registration_closes_date && regCloseDT > startDT) {
      toast.error("Registration close cannot be after hackathon start.");
      return;
    }

    startTransition(async () => {
      const payload = new FormData();
      payload.append('data', JSON.stringify(formData));
      
      pdfFiles.forEach((file, index) => {
        payload.append(`pdf_${index}`, file);
      });

      const result = await createHackathon(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        if (result.warning) {
          toast.warning(result.warning);
        } else {
          toast.success("Hackathon created successfully!");
        }
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col gap-4">
        <Link href="/admin/events" className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Create Hackathon
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Configure a new hackathon with PDF problem statements and schedule.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BASIC DETAILS */}
          <div>
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Title / Tagline</label>
                <input name="tagline" value={formData.tagline} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" />
              </div>
            </div>
          </div>

          {/* HACKATHON SCHEDULE */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Hackathon Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Registration Opens</label>
                <DateTimePicker 
                  dateName="registration_opens_date" 
                  timeName="registration_opens_time"
                  dateValue={formData.registration_opens_date}
                  timeValue={formData.registration_opens_time}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Registration Closes</label>
                <DateTimePicker 
                  dateName="registration_closes_date" 
                  timeName="registration_closes_time"
                  dateValue={formData.registration_closes_date}
                  timeValue={formData.registration_closes_time}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Starts *</label>
                <DateTimePicker 
                  dateName="hackathon_starts_date" 
                  timeName="hackathon_starts_time"
                  dateValue={formData.hackathon_starts_date}
                  timeValue={formData.hackathon_starts_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Ends *</label>
                <DateTimePicker 
                  dateName="hackathon_ends_date" 
                  timeName="hackathon_ends_time"
                  dateValue={formData.hackathon_ends_date}
                  timeValue={formData.hackathon_ends_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* TEAM SETTINGS & VENUE */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Team Settings & Venue</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Maximum Teams *</label>
                <input type="number" min="1" name="maximum_teams" value={formData.maximum_teams} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Min Team Size *</label>
                <input type="number" min="1" name="minimum_team_size" value={formData.minimum_team_size} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Max Team Size *</label>
                <input type="number" min="1" name="maximum_team_size" value={formData.maximum_team_size} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Venue</label>
                <input name="venue" value={formData.venue} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
            </div>
          </div>

          {/* PROBLEM STATEMENTS (PDFs) */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Problem Statements</h3>
            
            <div className="space-y-4 mb-6">
              {pdfFiles.map((file, index) => (
                <div key={index} className="border border-[#D9D9DF] rounded-md p-6 bg-[#F8F8FC] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-eventrix-lavender" />
                    <div>
                      <h4 className="font-bold text-eventrix-black text-sm">Problem Statement {index + 1}</h4>
                      <p className="text-xs text-eventrix-muted mt-1">{file.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => removeFile(index)} className="text-xs font-bold tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF]">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <input 
              type="file" 
              accept="application/pdf" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
            />
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#D9D9DF] rounded-md py-8 hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-colors group cursor-pointer"
            >
              <Upload className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-lavender transition-colors" />
              <span className="text-sm font-bold uppercase tracking-widest text-eventrix-muted group-hover:text-eventrix-black transition-colors">
                Upload Problem Statement
              </span>
            </button>
          </div>

          {/* COORDINATOR */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Coordinator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Select Coordinator ▼</label>
                <select name="coordinator_id" value={formData.coordinator_id} onChange={handleChange} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium">
                  <option value="">None</option>
                  {coordinators.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedCoordinator && (
                <div className="space-y-2 flex flex-col justify-center bg-[#F8F8FC] p-4 rounded-md border border-[#D9D9DF]">
                  <p className="text-sm"><span className="font-bold text-eventrix-muted uppercase tracking-widest text-xs">Name:</span> {selectedCoordinator.name}</p>
                  <p className="text-sm"><span className="font-bold text-eventrix-muted uppercase tracking-widest text-xs">Email:</span> {selectedCoordinator.email}</p>
                  <p className="text-sm"><span className="font-bold text-eventrix-muted uppercase tracking-widest text-xs">Phone:</span> {selectedCoordinator.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-[#D9D9DF] flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => router.push('/admin/events')}
              className="bg-white border-2 border-eventrix-black text-eventrix-black px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-[#F8F8FC]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? "Uploading & Saving..." : "Create Hackathon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
