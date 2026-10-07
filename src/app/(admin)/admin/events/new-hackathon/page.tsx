"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { Plus, Save, ArrowLeft, Trash2, FileText, Upload, Code, CheckSquare, Trophy, ShieldAlert, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createHackathon } from "@/actions/hackathon.actions";
import { getCachedCoordinators } from "@/actions/event.actions";
import { toast } from "sonner";
import { DateTimePicker } from "@/components/DateTimePicker";
import { DepartmentSelect } from "@/components/ui/DepartmentSelect";
import { MultiDepartmentSelect } from "@/components/ui/MultiDepartmentSelect";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";

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
    theme: "",
    domain: "",
    organizing_department: "",
    venue: "",
    mode: "Offline",
    external_link: "",
    logo_url: "",
    registration_opens_date: "",
    registration_opens_time: "",
    registration_closes_date: "",
    registration_closes_time: "",
    hackathon_starts_date: "",
    hackathon_starts_time: "",
    hackathon_ends_date: "",
    hackathon_ends_time: "",
    abstract_submission_date: "",
    project_submission_date: "",
    demo_pitch_date: "",
    maximum_teams: "50",
    minimum_team_size: "2",
    maximum_team_size: "4",
    maximum_participants: "",
    eligibility_type: "College Students",
    allowed_departments: "",
    allowed_years: "",
    allowed_colleges: "",
    rules: "",
    participation_guidelines: "",
    submission_guidelines: "",
    judging_criteria: "",
    code_of_conduct: "",
    problem_statement_description: "",
    required_tech_stack: "",
    github_url_required: false,
    demo_video_required: false,
    ppt_required: false,
    report_required: false,
    live_demo_required: false,
    prize_1st: "",
    prize_2nd: "",
    prize_3rd: "",
    special_prizes: "",
    coordinator_id: ""
  });

  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({ ...prev, [target.name]: value }));
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

    if (!formData.name.trim()) {
      toast.error("Hackathon Name is required.");
      return;
    }

    if (parseInt(formData.minimum_team_size) > parseInt(formData.maximum_team_size)) {
      toast.error("Minimum team size cannot be greater than maximum team size.");
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
            Create Hackathon
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Configure a dedicated hackathon with custom themes, team requirements, rules, judging criteria, and PDF problem statements.
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
                <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. CodeStorm 2026" className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Short Description / Tagline</label>
                <input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. Build. Innovate. Impact." className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Detailed Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Comprehensive description of the hackathon..." className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Hackathon Theme</label>
                <input name="theme" value={formData.theme} onChange={handleChange} placeholder="e.g. AI for Social Good" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Domain / Track</label>
                <input name="domain" value={formData.domain} onChange={handleChange} placeholder="e.g. Web Development, AI/ML, Cloud" className={inputClass} />
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
                <input name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Innovation Centre / Main Auditorium" className={inputClass} />
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
                <input name="external_link" value={formData.external_link} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Banner / Logo URL (Optional)</label>
                <input name="logo_url" value={formData.logo_url} onChange={handleChange} placeholder="https://..." className={inputClass} />
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
                <input type="number" min="1" name="maximum_participants" value={formData.maximum_participants} onChange={handleChange} placeholder="e.g. 200" className={inputClass} />
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
                <MultiDepartmentSelect
                  label="Allowed Departments"
                  value={formData.allowed_departments}
                  onChange={(val) => setFormData(prev => ({ ...prev, allowed_departments: val }))}
                  placeholder="Select allowed departments or click 'Select All'"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Allowed Years (Comma Separated)</label>
                <input name="allowed_years" value={formData.allowed_years} onChange={handleChange} placeholder="e.g. 1st Year, 2nd Year, 3rd Year" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Allowed Colleges (Comma Separated)</label>
                <input name="allowed_colleges" value={formData.allowed_colleges} onChange={handleChange} placeholder="e.g. Sona College of Technology, All Engineering Colleges" className={inputClass} />
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
                <textarea name="rules" value={formData.rules} onChange={handleChange} placeholder="1. Original work required..." className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Participation Guidelines</label>
                <textarea name="participation_guidelines" value={formData.participation_guidelines} onChange={handleChange} placeholder="Bring your own laptops..." className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Submission Guidelines</label>
                <textarea name="submission_guidelines" value={formData.submission_guidelines} onChange={handleChange} placeholder="Submit GitHub repository link..." className={textareaClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Judging Criteria</label>
                <textarea name="judging_criteria" value={formData.judging_criteria} onChange={handleChange} placeholder="Innovation (30%), Technical execution (40%)..." className={textareaClass} />
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
                <textarea name="problem_statement_description" value={formData.problem_statement_description} onChange={handleChange} placeholder="Detailed problem statement summary..." className={textareaClass} />
              </div>

              <div className="space-y-4 pt-2">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="border border-[#D9D9DF] rounded-md p-4 bg-[#F8F8FC] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-6 h-6 text-eventrix-lavender" />
                      <div>
                        <h4 className="font-bold text-eventrix-black text-xs">Problem Statement PDF {index + 1}</h4>
                        <p className="text-[11px] text-eventrix-muted">{file.name}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-red-700 bg-white px-3 py-1.5 rounded border border-[#D9D9DF]">
                      Remove
                    </button>
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
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#D9D9DF] rounded-md py-6 hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-colors group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-eventrix-muted group-hover:text-eventrix-lavender" />
                <span className="text-xs font-bold uppercase tracking-widest text-eventrix-muted group-hover:text-eventrix-black">
                  Upload Problem Statement PDF
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
                <input name="required_tech_stack" value={formData.required_tech_stack} onChange={handleChange} placeholder="e.g. React, Next.js, Python, PostgreSQL" className={inputClass} />
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
                <input name="prize_1st" value={formData.prize_1st} onChange={handleChange} placeholder="e.g. ₹25,000 + Trophy" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">2nd Prize</label>
                <input name="prize_2nd" value={formData.prize_2nd} onChange={handleChange} placeholder="e.g. ₹15,000" className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">3rd Prize</label>
                <input name="prize_3rd" value={formData.prize_3rd} onChange={handleChange} placeholder="e.g. ₹10,000" className={inputClass} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Special Prizes (Optional)</label>
                <input name="special_prizes" value={formData.special_prizes} onChange={handleChange} placeholder="e.g. Best UI/UX: ₹5,000 | Best AI Innovation: ₹5,000" className={inputClass} />
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
              {isPending ? "Saving Hackathon..." : "Create Hackathon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
