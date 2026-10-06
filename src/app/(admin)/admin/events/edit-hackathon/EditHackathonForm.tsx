"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { Plus, Save, ArrowLeft, FileText, Upload, RefreshCw, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateHackathon, addHackathonPDF, replaceHackathonPDF, removeHackathonPDF } from "@/actions/hackathon.actions";
import { getCachedCoordinators } from "@/actions/event.actions";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/DateTimePicker";

const parseDateString = (dateString?: string) => {
  if (!dateString) return { date: "", time: "" };
  try {
    const d = new Date(dateString);
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    return { date, time };
  } catch (e) {
    return { date: "", time: "" };
  }
};

export function EditHackathonForm({ hackathon, festId }: { hackathon: any; festId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [coordinators, setCoordinators] = useState<any[]>([]);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [loadingPsId, setLoadingPsId] = useState<string | null>(null);

  useEffect(() => {
    getCachedCoordinators().then(setCoordinators);
  }, []);

  const hd = hackathon.hackathonDetails || {};
  
  const regOpens = parseDateString(hd.registration_opens_at);
  const regCloses = parseDateString(hd.registration_closes_at);
  const startAt = parseDateString(hd.hackathon_starts_at);
  const endAt = parseDateString(hd.hackathon_ends_at);

  const [formData, setFormData] = useState({
    name: hackathon.name || "",
    tagline: hd.tagline || "",
    description: hd.description || "",
    logo_url: hackathon.logo_url || "",
    registration_opens_date: regOpens.date,
    registration_opens_time: regOpens.time,
    registration_closes_date: regCloses.date,
    registration_closes_time: regCloses.time,
    hackathon_starts_date: startAt.date,
    hackathon_starts_time: startAt.time,
    hackathon_ends_date: endAt.date,
    hackathon_ends_time: endAt.time,
    maximum_teams: hd.maximum_teams?.toString() || "",
    minimum_team_size: hd.minimum_team_size?.toString() || "1",
    maximum_team_size: hd.maximum_team_size?.toString() || "4",
    venue: hd.venue || "",
    coordinator_id: hd.coordinator_id || ""
  });

  const [problemStatements, setProblemStatements] = useState<any[]>(
    hackathon.problem_statements || []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedCoordinator = coordinators.find(c => c.id === formData.coordinator_id);

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      toast.error(`${file.name} is not a PDF.`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10MB limit.`);
      return;
    }

    const payload = new FormData();
    payload.append('file', file);
    
    const toastId = toast.loading("Uploading new problem statement...");
    const result = await addHackathonPDF(hd.id, payload);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else if (result.record) {
      toast.success("Problem statement added successfully", { id: toastId });
      setProblemStatements(prev => [...prev, result.record]);
    }

    if (addFileInputRef.current) addFileInputRef.current.value = '';
  };

  const handleReplaceClick = (id: string) => {
    setReplacingId(id);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;
    
    if (file.type !== "application/pdf") {
      toast.error(`${file.name} is not a PDF.`);
      setReplacingId(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name} exceeds 10MB limit.`);
      setReplacingId(null);
      return;
    }

    setLoadingPsId(replacingId);
    const payload = new FormData();
    payload.append('file', file);
    
    const toastId = toast.loading("Replacing problem statement...");
    const result = await replaceHackathonPDF(replacingId, payload);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else if (result.record) {
      toast.success("Problem statement replaced successfully", { id: toastId });
      setProblemStatements(prev => prev.map(ps => ps.id === replacingId ? result.record : ps));
    }

    setReplacingId(null);
    setLoadingPsId(null);
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this problem statement?")) return;

    setLoadingPsId(id);
    const toastId = toast.loading("Removing problem statement...");
    const result = await removeHackathonPDF(id);

    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Problem statement removed.", { id: toastId });
      setProblemStatements(prev => prev.filter(ps => ps.id !== id));
    }
    setLoadingPsId(null);
  };

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
      const { success, error } = await updateHackathon(festId, formData);

      if (error) {
        toast.error(error);
      } else {
        toast.success("Hackathon updated successfully!");
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1000);
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
            Edit Hackathon
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Update hackathon settings, schedule, and problem statements.
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
              {problemStatements.map((ps, index) => (
                <div key={ps.id} className="border border-[#D9D9DF] rounded-md p-6 bg-[#F8F8FC] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-eventrix-lavender" />
                    <div>
                      <h4 className="font-bold text-eventrix-black text-sm">Problem Statement {index + 1}</h4>
                      <p className="text-xs text-eventrix-muted mt-1 break-all">{ps.file_name}</p>
                    </div>
                  </div>
                  
                  {loadingPsId === ps.id ? (
                    <span className="text-xs font-bold tracking-widest uppercase text-eventrix-muted flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <div className="flex items-center gap-3 flex-wrap justify-end">
                      <a href={ps.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-widest uppercase text-eventrix-black hover:text-eventrix-lavender transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <button type="button" onClick={() => handleReplaceClick(ps.id)} className="text-xs font-bold tracking-widest uppercase text-eventrix-black hover:text-eventrix-lavender transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Replace
                      </button>
                      <button type="button" onClick={() => handleRemove(ps.id)} className="text-xs font-bold tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {problemStatements.length === 0 && (
                <div className="text-center p-6 border border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
                  <p className="text-sm font-bold text-eventrix-muted">No problem statements uploaded yet.</p>
                </div>
              )}
            </div>

            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={addFileInputRef} 
              onChange={handleAddFile} 
            />
            
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={replaceFileInputRef} 
              onChange={handleReplaceFile} 
            />
            
            <button 
              type="button" 
              onClick={() => addFileInputRef.current?.click()}
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
