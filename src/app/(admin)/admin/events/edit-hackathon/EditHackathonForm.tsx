"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { Plus, Save, ArrowLeft, FileText, Upload, RefreshCw, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateHackathon, addHackathonPDF, replaceHackathonPDF, removeHackathonPDF } from "@/actions/hackathon.actions";
import { getCachedCoordinators } from "@/actions/event.actions";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/DateTimePicker";
import { DepartmentSelect } from "@/components/ui/DepartmentSelect";
import { MultiDepartmentSelect } from "@/components/ui/MultiDepartmentSelect";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixSelect } from "@/components/ui/EventrixSelect";
import { MultiCollegeSelect } from "@/components/ui/MultiCollegeSelect";
import { MultiYearSelect } from "@/components/ui/MultiYearSelect";
import { ALLOWED_FILE_ACCEPT } from "@/lib/mimeUtils";
import { getFileIcon } from "@/components/ui/EventrixResourceUploader";
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
    const parts = parseISTDeadlineParts(str);
    if (parts) return parts.date;
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
    whatsapp_group_link: hd.whatsapp_group_link || "",
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
    coordinator_id: hd.coordinator_id || (hackathon.coordinatorDetails?.[0]?.id || ""),
    status: hackathon.status || "DRAFT"
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
    
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} exceeds 100MB limit.`);
      return;
    }

    const payload = new FormData();
    payload.append('file', file);
    
    const toastId = toast.loading("Uploading problem statement document...");
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
    
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} exceeds 100MB limit.`);
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
      const result = await updateHackathon(festId, {
        ...formData,
        problemStatements
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Hackathon updated successfully!");
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 800);
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
                <DepartmentSelect
                  label="Organizing Department"
                  name="organizing_department"
                  value={formData.organizing_department}
                  onChange={(val) => setFormData(prev => ({ ...prev, organizing_department: val }))}
                  placeholder="Select Organizing Department"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Venue</label>
                <input name="venue" value={formData.venue} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <EventrixSelect
                  label="Mode"
                  name="mode"
                  value={formData.mode}
                  onChange={(val) => setFormData(prev => ({ ...prev, mode: val }))}
                  options={[
                    { value: "Offline", label: "Offline" },
                    { value: "Online", label: "Online" },
                    { value: "Hybrid", label: "Hybrid" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">External Link / Website (Optional)</label>
                <input name="external_link" value={formData.external_link} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">WhatsApp Group Link (Optional)</label>
                <input name="whatsapp_group_link" value={formData.whatsapp_group_link} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Banner / Logo URL (Optional)</label>
                <input name="logo_url" value={formData.logo_url} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <EventrixSelect
                  label="Event Status (Visibility)"
                  name="status"
                  value={formData.status}
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  options={[
                    { value: "DRAFT", label: "DRAFT (Hidden from Student Portal)" },
                    { value: "LIVE", label: "LIVE (Visible on Student Portal)" },
                  ]}
                />
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
                <EventrixDatePicker
                  value={formData.abstract_submission_date}
                  onChange={(val) => setFormData(prev => ({ ...prev, abstract_submission_date: val }))}
                  placeholder="Select Date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Project Submission Deadline (Optional)</label>
                <EventrixDatePicker
                  value={formData.project_submission_date}
                  onChange={(val) => setFormData(prev => ({ ...prev, project_submission_date: val }))}
                  placeholder="Select Date"
                />
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
                <EventrixSelect
                  label="Eligibility Type"
                  name="eligibility_type"
                  value={formData.eligibility_type}
                  onChange={(val) => setFormData(prev => ({ ...prev, eligibility_type: val }))}
                  options={[
                    { value: "College Students", label: "College Students" },
                    { value: "Sona Students", label: "Sona Students Only" },
                    { value: "Open to All", label: "Open to All" },
                    { value: "Custom", label: "Custom Criteria" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <MultiDepartmentSelect
                  label="Allowed Departments"
                  value={formData.allowed_departments}
                  onChange={(val) => setFormData(prev => ({ ...prev, allowed_departments: val }))}
                  placeholder="Select allowed departments or click 'Select All'"
                />
              </div>
              <div className="space-y-2">
                <MultiYearSelect
                  label="Allowed Years"
                  value={formData.allowed_years}
                  onChange={(val) => setFormData(prev => ({ ...prev, allowed_years: val }))}
                  placeholder="Select allowed years or click 'All Years'"
                />
              </div>
              <div className="space-y-2">
                <MultiCollegeSelect
                  label="Allowed Colleges"
                  value={formData.allowed_colleges}
                  onChange={(val) => setFormData(prev => ({ ...prev, allowed_colleges: val }))}
                  placeholder="Select allowed Tamil Nadu colleges or click 'All Colleges'"
                />
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

          {/* SECTION F — PROBLEM STATEMENT & DOCUMENTS */}
          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm pb-2 border-b border-[#D9D9DF]">
              Section F — Problem Statements & Documents
            </h3>
            
            {/* Hidden file inputs for adding and replacing files */}
            <input 
              ref={addFileInputRef} 
              type="file" 
              accept={ALLOWED_FILE_ACCEPT} 
              className="hidden" 
              onChange={handleAddFile} 
            />
            <input 
              ref={replaceFileInputRef} 
              type="file" 
              accept={ALLOWED_FILE_ACCEPT} 
              className="hidden" 
              onChange={handleReplaceFile} 
            />

            <div className="space-y-4 mb-6">
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Problem Statement / Challenge Description</label>
                <textarea name="problem_statement_description" value={formData.problem_statement_description} onChange={handleChange} className={textareaClass} />
              </div>

              {problemStatements.map((ps, index) => (
                <div key={ps.id} className="border border-[#D9D9DF] rounded-md overflow-hidden bg-[#F8F8FC]">
                  <div className="p-6 flex items-center justify-between border-b border-[#D9D9DF]">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 bg-white rounded-lg border border-[#D9D9DF] shrink-0">
                        {getFileIcon(ps.file_name || 'document.pdf')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-eventrix-black text-sm truncate">{ps.title || `Problem Statement ${index + 1}`}</h4>
                        {ps.file_name ? (
                          <p className="text-xs text-eventrix-muted mt-1 truncate max-w-[280px] md:max-w-[420px]">{ps.file_name}</p>
                        ) : (
                          <p className="text-xs text-eventrix-muted mt-1 italic">Text-Only Problem Statement</p>
                        )}
                      </div>
                    </div>
                    
                    {loadingPsId === ps.id ? (
                      <span className="text-xs font-bold tracking-widest uppercase text-eventrix-muted flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        {ps.file_url && (
                          <>
                            <a href={ps.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-widest uppercase text-eventrix-black hover:text-eventrix-lavender transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" /> View File
                            </a>
                            <button type="button" onClick={() => handleReplaceClick(ps.id)} className="text-xs font-bold tracking-widest uppercase text-eventrix-black hover:text-eventrix-lavender transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1 cursor-pointer">
                              <RefreshCw className="w-3.5 h-3.5" /> Replace File
                            </button>
                          </>
                        )}
                        {!ps.file_url && (
                           <button type="button" onClick={() => handleReplaceClick(ps.id)} className="text-xs font-bold tracking-widest uppercase text-eventrix-black hover:text-eventrix-lavender transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1 cursor-pointer">
                             <Upload className="w-3.5 h-3.5" /> Attach File
                           </button>
                        )}
                        <button type="button" onClick={() => handleRemoveFile(ps.id)} className="text-xs font-bold tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors bg-white px-3 py-2 rounded border border-[#D9D9DF] flex items-center gap-1 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 bg-white space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Title</label>
                      <input 
                        value={ps.title || ""} 
                        onChange={(e) => {
                          setProblemStatements(prev => prev.map(p => p.id === ps.id ? { ...p, title: e.target.value } : p));
                        }}
                        placeholder="e.g. Smart Traffic Management"
                        className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Description</label>
                      <textarea 
                        value={ps.description || ""} 
                        onChange={(e) => {
                          setProblemStatements(prev => prev.map(p => p.id === ps.id ? { ...p, description: e.target.value } : p));
                        }}
                        placeholder="Brief description of the problem..."
                        rows={3}
                        className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" 
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button 
                        type="button" 
                        onClick={async () => {
                          setLoadingPsId(ps.id);
                          const { updateProblemStatementDetails } = await import("@/actions/hackathon.actions");
                          const result = await updateProblemStatementDetails(ps.id, ps.title || "", ps.description || "");
                          if (result.error) toast.error(result.error);
                          else toast.success("Details saved!");
                          setLoadingPsId(null);
                        }}
                        disabled={loadingPsId === ps.id}
                        className="bg-eventrix-black text-eventrix-white px-4 py-2 rounded-md font-bold text-xs tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" /> Save Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {problemStatements.length === 0 && (
                <div className="text-center p-6 border border-[#D9D9DF] rounded-md bg-[#F8F8FC]">
                  <p className="text-sm font-bold text-eventrix-muted">No problem statements uploaded yet.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                type="button" 
                onClick={() => addFileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-[#D9D9DF] rounded-xl py-6 hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-lavender transition-colors" />
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-eventrix-muted group-hover:text-eventrix-black transition-colors">
                    Upload Problem Statement / Document
                  </span>
                  <span className="text-[11px] text-eventrix-muted mt-0.5">
                    PDF, DOCX, PPTX, XLSX, PNG, JPG, ZIP — up to 100MB
                  </span>
                </div>
              </button>
              
              <button 
                type="button" 
                onClick={async () => {
                  setLoadingPsId("new");
                  const { addTextProblemStatement } = await import("@/actions/hackathon.actions");
                  const result = await addTextProblemStatement(hd.id);
                  if (result.error) toast.error(result.error);
                  else if (result.record) {
                    toast.success("Text Problem Statement added!");
                    setProblemStatements(prev => [...prev, result.record]);
                  }
                  setLoadingPsId(null);
                }}
                disabled={loadingPsId === "new"}
                className="flex items-center justify-center gap-2 w-full border-2 border-[#D9D9DF] bg-white rounded-md py-4 hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-colors group cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-lavender transition-colors" />
                <span className="text-sm font-bold uppercase tracking-widest text-eventrix-muted group-hover:text-eventrix-black transition-colors">
                  {loadingPsId === "new" ? "Creating..." : "Add Text-Only Problem Statement"}
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
                <EventrixSelect
                  label="Select Coordinator"
                  name="coordinator_id"
                  value={formData.coordinator_id}
                  onChange={(val) => setFormData(prev => ({ ...prev, coordinator_id: val }))}
                  placeholder="Unassigned (Optional)"
                  searchable={true}
                  searchPlaceholder="Search coordinator..."
                  options={[
                    { value: "", label: "Unassigned" },
                    ...coordinators.map(c => ({
                      value: c.id,
                      label: c.name,
                      description: c.email
                    }))
                  ]}
                />
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
