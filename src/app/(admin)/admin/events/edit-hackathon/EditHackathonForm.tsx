"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { Plus, Save, ArrowLeft, FileText, Upload, RefreshCw, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateHackathon, addHackathonPDF, replaceHackathonPDF, removeHackathonPDF } from "@/actions/hackathon.actions";
import { getCachedCoordinators } from "@/actions/event.actions";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/DateTimePicker";
import { parseISTDeadlineParts } from "@/utils/date-utils";

const parseDateString = (dateString?: string) => {
  if (!dateString) return { date: "", time: "" };
  const parts = parseISTDeadlineParts(dateString);
  if (parts) {
    let hour = parseInt(parts.time.split(':')[0], 10);
    const min = parts.time.split(':')[1];
    if (parts.period === 'PM' && hour < 12) hour += 12;
    if (parts.period === 'AM' && hour === 12) hour = 0;
    return { date: parts.date, time: `${hour.toString().padStart(2, '0')}:${min}` };
  }
  try {
    const d = new Date(dateString);
    const date = d.toISOString().split('T')[0];
    const time = d.toTimeString().split(' ')[0].substring(0, 5);
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
  
  const regOpens = parseDateString(hd.registration_opens_at || hackathon.registration_opens_at);
  const regCloses = parseDateString(hd.registration_closes_at || hackathon.registration_closes_at);
  const startAt = parseDateString(hd.hackathon_starts_at);
  const endAt = parseDateString(hd.hackathon_ends_at);

  const formatDateOnly = (str?: string) => {
    if (!str) return "";
    try { return str.split('T')[0]; } catch(e) { return ""; }
  };

  const [formData, setFormData] = useState({
    name: hackathon.name || "",
    tagline: hd.tagline || hackathon.description || "",
    description: hd.description || "",
    theme: hd.theme || "",
    domain: hd.domain || "",
    organizing_department: hd.organizing_department || "",
    venue: hd.venue || "",
    mode: hd.mode || "Offline",
    external_link: hd.external_link || "",
    logo_url: hackathon.logo_url || "",
    registration_opens_date: regOpens.date,
    registration_opens_time: regOpens.time,
    registration_closes_date: regCloses.date,
    registration_closes_time: regCloses.time,
    hackathon_starts_date: startAt.date,
    hackathon_starts_time: startAt.time,
    hackathon_ends_date: endAt.date,
    hackathon_ends_time: endAt.time,
    abstract_submission_date: formatDateOnly(hd.abstract_submission_deadline),
    project_submission_date: formatDateOnly(hd.project_submission_deadline),
    demo_pitch_date: formatDateOnly(hd.demo_pitch_date),
    maximum_teams: hd.maximum_teams?.toString() || "50",
    minimum_team_size: hd.minimum_team_size?.toString() || "1",
    maximum_team_size: hd.maximum_team_size?.toString() || "4",
    maximum_participants: hd.maximum_participants?.toString() || "",
    eligibility_type: hd.eligibility_type || "College Students",
    allowed_departments: hd.allowed_departments || "",
    allowed_years: hd.allowed_years || "",
    allowed_colleges: hd.allowed_colleges || "",
    rules: hd.rules || "",
    participation_guidelines: hd.participation_guidelines || "",
    submission_guidelines: hd.submission_guidelines || "",
    judging_criteria: hd.judging_criteria || "",
    code_of_conduct: hd.code_of_conduct || "",
    problem_statement_description: hd.problem_statement_description || "",
    required_tech_stack: hd.required_tech_stack || "",
    github_url_required: !!hd.github_url_required,
    demo_video_required: !!hd.demo_video_required,
    ppt_required: !!hd.ppt_required,
    report_required: !!hd.report_required,
    live_demo_required: !!hd.live_demo_required,
    prize_1st: hd.prize_1st || "",
    prize_2nd: hd.prize_2nd || "",
    prize_3rd: hd.prize_3rd || "",
    special_prizes: hd.special_prizes || "",
    coordinator_id: hd.coordinator_id || (hackathon.coordinatorDetails?.[0]?.id || "")
  });

  const [problemStatements, setProblemStatements] = useState<any[]>(
    hackathon.problem_statements || []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
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

    const payload = new FormData();
    payload.append('file', file);
    
    const toastId = toast.loading("Replacing problem statement...");
    setLoadingPsId(replacingId);
    
    const result = await replaceHackathonPDF(replacingId, payload);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else if (result.record) {
      toast.success("Problem statement replaced successfully", { id: toastId });
      setProblemStatements(prev => prev.map(item => item.id === replacingId ? result.record : item));
    }

    setLoadingPsId(null);
    setReplacingId(null);
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  const handleRemoveFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem statement PDF?")) return;
    
    const toastId = toast.loading("Deleting problem statement...");
    setLoadingPsId(id);
    
    const result = await removeHackathonPDF(id);
    
    if (result.error) {
      toast.error(result.error, { id: toastId });
    } else {
      toast.success("Problem statement deleted successfully", { id: toastId });
      setProblemStatements(prev => prev.filter(item => item.id !== id));
    }
    
    setLoadingPsId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Hackathon Name is required.");
      return;
    }

    if (parseInt(formData.minimum_team_size) > parseInt(formData.maximum_team_size)) {
      toast.error("Minimum team size cannot be greater than maximum team size.");
      return;
    }

    startTransition(async () => {
      const result = await updateHackathon(festId, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Hackathon updated successfully!");
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1200);
      }
    });
  };

  const inputClass = "w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium";
  const textareaClass = "w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-y min-h-[100px]";

  return (
    <div className="max-w-5xl space-y-10">
      <div className="flex flex-col gap-4">
        <Link href="/admin/events" className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Edit Hackathon: {hackathon.name}
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Update hackathon settings, rules, team bounds, judging criteria, and PDF problem statements.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* SECTION A — BASIC HACKATHON INFORMATION */}
          <div>
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section A — Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Short Description / Tagline</label>
                <input name="tagline" value={formData.tagline} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Detailed Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Theme</label>
                <input name="theme" value={formData.theme} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Domain / Track</label>
                <input name="domain" value={formData.domain} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Organizing Department</label>
                <input name="organizing_department" value={formData.organizing_department} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Venue</label>
                <input name="venue" value={formData.venue} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Mode</label>
                <select name="mode" value={formData.mode} onChange={handleChange} className={inputClass}>
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">External Link / Website (Optional)</label>
                <input name="external_link" value={formData.external_link} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Banner / Logo URL (Optional)</label>
                <input name="logo_url" value={formData.logo_url} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECTION B — HACKATHON SCHEDULE */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section B — Hackathon Schedule & Timestamps
            </h3>
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
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Abstract Submission Deadline (Optional)</label>
                <input type="date" name="abstract_submission_date" value={formData.abstract_submission_date} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Project Submission Deadline (Optional)</label>
                <input type="date" name="project_submission_date" value={formData.project_submission_date} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECTION C — TEAM REQUIREMENTS & CAPACITY */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section C — Team Requirements & Capacities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Maximum Teams *</label>
                <input type="number" min="1" name="maximum_teams" value={formData.maximum_teams} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Min Team Size *</label>
                <input type="number" min="1" name="minimum_team_size" value={formData.minimum_team_size} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Max Team Size *</label>
                <input type="number" min="1" name="maximum_team_size" value={formData.maximum_team_size} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Max Participants (Optional)</label>
                <input type="number" min="1" name="maximum_participants" value={formData.maximum_participants} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECTION D — ELIGIBILITY */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section D — Eligibility Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Eligibility Type</label>
                <select name="eligibility_type" value={formData.eligibility_type} onChange={handleChange} className={inputClass}>
                  <option value="College Students">College Students</option>
                  <option value="Sona Students">Sona Students Only</option>
                  <option value="Open to All">Open to All</option>
                  <option value="Custom">Custom Criteria</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Allowed Departments (Comma Separated)</label>
                <input name="allowed_departments" value={formData.allowed_departments} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Allowed Years (Comma Separated)</label>
                <input name="allowed_years" value={formData.allowed_years} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Allowed Colleges (Comma Separated)</label>
                <input name="allowed_colleges" value={formData.allowed_colleges} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECTION E — RULES & GUIDELINES */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section E — Rules & Guidelines
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Rules & Regulations</label>
                <textarea name="rules" value={formData.rules} onChange={handleChange} className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Participation Guidelines</label>
                <textarea name="participation_guidelines" value={formData.participation_guidelines} onChange={handleChange} className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Submission Guidelines</label>
                <textarea name="submission_guidelines" value={formData.submission_guidelines} onChange={handleChange} className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Judging Criteria</label>
                <textarea name="judging_criteria" value={formData.judging_criteria} onChange={handleChange} className={textareaClass} />
              </div>
            </div>
          </div>

          {/* SECTION F — PROBLEM STATEMENT & ATTACHMENTS */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section F — Problem Statement & PDF Documents
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Problem Statement / Challenge Description</label>
                <textarea name="problem_statement_description" value={formData.problem_statement_description} onChange={handleChange} className={textareaClass} />
              </div>

              <div className="space-y-4 pt-2">
                {problemStatements.map((item, index) => (
                  <div key={item.id} className="border border-[#D9D9DF] rounded-md p-4 bg-[#F8F8FC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <FileText className="w-6 h-6 text-eventrix-lavender shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-eventrix-black text-xs">Problem Statement PDF {item.display_order || index + 1}</h4>
                        <p className="text-[11px] text-eventrix-muted truncate">{item.file_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white text-eventrix-black px-3 py-1.5 rounded border border-[#D9D9DF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F8F8FC]">
                        <Eye className="w-3 h-3" /> View
                      </a>
                      <button type="button" onClick={() => handleReplaceClick(item.id)} disabled={loadingPsId === item.id} className="flex items-center gap-1 bg-white text-eventrix-black px-3 py-1.5 rounded border border-[#D9D9DF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#F8F8FC]">
                        <RefreshCw className={`w-3 h-3 ${loadingPsId === item.id ? 'animate-spin' : ''}`} /> Replace
                      </button>
                      <button type="button" onClick={() => handleRemoveFile(item.id)} disabled={loadingPsId === item.id} className="flex items-center gap-1 bg-white text-red-500 px-3 py-1.5 rounded border border-[#D9D9DF] text-[10px] font-bold uppercase tracking-widest hover:bg-red-50">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <input type="file" accept="application/pdf" className="hidden" ref={addFileInputRef} onChange={handleAddFile} />
              <input type="file" accept="application/pdf" className="hidden" ref={replaceFileInputRef} onChange={handleReplaceFile} />

              <button 
                type="button" 
                onClick={() => addFileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#D9D9DF] rounded-md py-6 hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-lavender" />
                <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted group-hover:text-eventrix-black">
                  Add New Problem Statement PDF
                </span>
              </button>
            </div>
          </div>

          {/* SECTION G — TECH & SUBMISSION REQUIREMENTS */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section G — Technology & Submission Requirements
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Required Tech Stack (Comma Separated)</label>
                <input name="required_tech_stack" value={formData.required_tech_stack} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <label className="flex items-center gap-2 p-3 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-bold cursor-pointer">
                  <input type="checkbox" name="github_url_required" checked={formData.github_url_required} onChange={handleChange} className="w-4 h-4 text-eventrix-lavender rounded" />
                  GitHub URL
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-bold cursor-pointer">
                  <input type="checkbox" name="demo_video_required" checked={formData.demo_video_required} onChange={handleChange} className="w-4 h-4 text-eventrix-lavender rounded" />
                  Demo Video
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-bold cursor-pointer">
                  <input type="checkbox" name="ppt_required" checked={formData.ppt_required} onChange={handleChange} className="w-4 h-4 text-eventrix-lavender rounded" />
                  PPT Deck
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-bold cursor-pointer">
                  <input type="checkbox" name="report_required" checked={formData.report_required} onChange={handleChange} className="w-4 h-4 text-eventrix-lavender rounded" />
                  Project Report
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#F8F8FC] border border-[#D9D9DF] rounded-md text-xs font-bold cursor-pointer">
                  <input type="checkbox" name="live_demo_required" checked={formData.live_demo_required} onChange={handleChange} className="w-4 h-4 text-eventrix-lavender rounded" />
                  Live Demo
                </label>
              </div>
            </div>
          </div>

          {/* SECTION H — PRIZES & REWARDS */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section H — Prizes & Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">1st Prize</label>
                <input name="prize_1st" value={formData.prize_1st} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">2nd Prize</label>
                <input name="prize_2nd" value={formData.prize_2nd} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">3rd Prize</label>
                <input name="prize_3rd" value={formData.prize_3rd} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Special Prizes (Optional)</label>
                <input name="special_prizes" value={formData.special_prizes} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* SECTION I — COORDINATOR ASSIGNMENT */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section I — Assigned Coordinator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Select Coordinator</label>
                <select name="coordinator_id" value={formData.coordinator_id} onChange={handleChange} className={inputClass}>
                  <option value="">Unassigned</option>
                  {coordinators.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {selectedCoordinator && (
                <div className="space-y-1.5 flex flex-col justify-center bg-[#F8F8FC] p-4 rounded-md border border-[#D9D9DF]">
                  <p className="text-xs font-bold text-eventrix-black">{selectedCoordinator.name}</p>
                  <p className="text-xs text-eventrix-muted">Mobile: {selectedCoordinator.phone || 'Not Provided'}</p>
                  <p className="text-xs text-eventrix-muted">Email: {selectedCoordinator.email}</p>
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
              {isPending ? "Updating Hackathon..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
