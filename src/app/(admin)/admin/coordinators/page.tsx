"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Plus, 
  Users, 
  ShieldCheck, 
  Mail, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Key, 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles,
  UserPlus,
  Phone,
  Building2,
  GraduationCap
} from "lucide-react";
import { 
  getCoordinators, 
  createCoordinator, 
  updateCoordinatorAssignment, 
  deleteCoordinator 
} from "@/actions/auth.actions";
import { getSubEvents, approveAndPermitSubEvent } from "@/actions/event.actions";
import { toast } from "sonner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { UserAvatar } from "@/components/UserAvatar";

export default function CoordinatorsPage() {
  const [activeTab, setActiveTab] = useState<"manage" | "add">("manage");
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [subEvents, setSubEvents] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  // Add Coordinator form draft persistence (excluding passwords)
  const { formData, setFormData, resetForm } = useFormDraft({
    key: "eventrix_coordinator_form_draft",
    initialValues: {
      fullName: "",
      mobile: "",
      email: "",
      gender: "",
      college: "",
      department: "",
      yearOfStudy: "1st Year",
      password: "",
      confirmPassword: ""
    },
    excludeKeys: ["password", "confirmPassword"]
  });

  // Track selected coordinator for event permission approvals
  const [permitAssignments, setPermitAssignments] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const coordsData = await getCoordinators();
    setCoordinators(coordsData);
    const eventsData = await getSubEvents(undefined, true);
    setSubEvents(eventsData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.name === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleCreateCoordinator = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (
      !formData.fullName.trim() ||
      !formData.mobile.trim() ||
      !formData.email.trim() ||
      !formData.college.trim() ||
      !formData.department.trim() ||
      !formData.yearOfStudy.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toast.error("All fields are required. Please complete all fields to create a coordinator.");
      return;
    }

    if (!formData.gender.trim()) {
      toast.error("Please select your gender.");
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error("10 digits required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please ensure Password and Confirm Password are identical.");
      return;
    }

    startTransition(async () => {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('mobile', formData.mobile);
      data.append('email', formData.email);
      data.append('gender', formData.gender);
      data.append('college', formData.college);
      data.append('department', formData.department);
      data.append('yearOfStudy', formData.yearOfStudy);
      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);
      
      const res = await createCoordinator(data);
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Coordinator account created successfully!");
        resetForm();
        await loadData();
      }
    });
  };

  const handleCancelForm = () => {
    const hasValues = Object.entries(formData).some(
      ([k, v]) => k !== "password" && k !== "confirmPassword" && k !== "yearOfStudy" && Boolean(v)
    );
    if (hasValues) {
      if (confirm("You have unsaved form information. Are you sure you want to discard this draft?")) {
        resetForm();
        setActiveTab("manage");
      }
    } else {
      setActiveTab("manage");
    }
  };

  const handleUpdateAssignment = (coordinatorId: string, subEventId: string) => {
    startTransition(async () => {
      const res = await updateCoordinatorAssignment(coordinatorId, subEventId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Coordinator event permission updated successfully!");
        await loadData();
      }
    });
  };

  const handleDeleteCoordinator = (coordinatorId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove coordinator account for ${name}?`)) return;
    
    startTransition(async () => {
      const res = await deleteCoordinator(coordinatorId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Coordinator removed successfully!");
        await loadData();
      }
    });
  };

  const handlePermitAndApprove = (subEventId: string) => {
    const selectedCoordId = permitAssignments[subEventId] || "";
    
    startTransition(async () => {
      const res = await approveAndPermitSubEvent(subEventId, selectedCoordId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Event permitted and approved successfully!");
        await loadData();
      }
    });
  };

  // Filter requested/pending events
  const pendingRequests = subEvents.filter(e => e.status !== 'Approved');

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9D9DF] pb-6">
        <div>
          <span className="text-xs font-bold text-eventrix-lavender uppercase tracking-widest block mb-1">
            Admin Management Portal
          </span>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide">
            COORDINATOR CONTROL CENTER
          </h1>
          <p className="text-eventrix-muted font-medium text-sm mt-1">
            Review event creation requests, grant permissions, and manage coordinator accounts.
          </p>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex bg-[#F8F8FC] p-1.5 rounded-lg border border-[#D9D9DF] gap-1">
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "manage"
                ? "bg-eventrix-black text-white shadow-sm"
                : "text-eventrix-muted hover:text-eventrix-black hover:bg-white/60"
            }`}
          >
            <Users className="w-4 h-4" />
            Manage Coordinators & Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`px-5 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "add"
                ? "bg-eventrix-black text-white shadow-sm"
                : "text-eventrix-muted hover:text-eventrix-black hover:bg-white/60"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Add Coordinator
          </button>
        </div>
      </div>

      {/* TAB 1: MANAGE EXISTING COORDINATORS & REQUESTS */}
      {activeTab === "manage" && (
        <div className="space-y-10">
          
          {/* SECTION 1: Event Requests & Permits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-eventrix-black uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-eventrix-lavender" /> Event Permission & Approval Requests
                </h2>
                <p className="text-xs text-eventrix-muted font-medium">
                  Review sub-events submitted by coordinators. Grant permissions and approve them live.
                </p>
              </div>
              <span className="text-xs font-bold bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-200">
                {pendingRequests.length} Pending Approval
              </span>
            </div>

            <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Event Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Permit To Coordinator</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D9DF]">
                  {pendingRequests.map((event) => (
                    <tr key={event.id} className="hover:bg-[#F8F8FC] transition-colors bg-amber-50/30">
                      <td className="px-6 py-4 font-bold text-eventrix-black">
                        <div>
                          <p className="text-base">{event.title}</p>
                          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded inline-block mt-1">
                            Pending Approval
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                          event.category === 'Technical' 
                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {event.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-eventrix-muted text-xs">
                        {event.participation_type || 'Individual'}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-eventrix-black font-medium text-xs">
                          <Calendar className="w-3.5 h-3.5 text-eventrix-muted" /> {event.date}
                        </div>
                        <div className="flex items-center gap-1.5 text-eventrix-muted font-medium text-xs mt-1">
                          <Clock className="w-3.5 h-3.5" /> {event.time}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-eventrix-black text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-eventrix-muted" /> {event.location}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={permitAssignments[event.id] || ""}
                          onChange={(e) => setPermitAssignments(prev => ({ ...prev, [event.id]: e.target.value }))}
                          className="border border-[#D9D9DF] rounded px-3 py-1.5 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender text-xs font-medium w-full max-w-[200px]"
                        >
                          <option value="">Keep current / Unassigned</option>
                          {coordinators.map(c => (
                            <option key={c.id} value={c.id}>{c.fullName} ({c.email})</option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handlePermitAndApprove(event.id)}
                          disabled={isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Permit & Approve
                        </button>
                      </td>
                    </tr>
                  ))}

                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <span>No pending event permission requests. All coordinator events are live!</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: Existing Coordinators Roster */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-eventrix-black uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-eventrix-lavender" /> Existing Coordinators & Assigned Event Access
              </h2>
              <p className="text-xs text-eventrix-muted font-medium">
                View all registered event coordinators and change their assigned sub-event permissions in real-time.
              </p>
            </div>

            <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Coordinator Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Assigned Permitted Event</th>
                    <th className="px-6 py-4">Role Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D9DF]">
                  {coordinators.map((coord) => (
                    <tr key={coord.id} className="hover:bg-[#F8F8FC] transition-colors">
                      <td className="px-6 py-4 font-bold text-eventrix-black flex items-center gap-3">
                        <UserAvatar
                          user={coord}
                          alt={coord.fullName}
                          className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#D9D9DF]"
                        />
                        <div>
                          <p className="text-base leading-tight">{coord.fullName}</p>
                          <span className="text-[10px] text-eventrix-muted font-semibold uppercase">ID: {coord.id.slice(0, 8)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-eventrix-muted text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" /> {coord.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={coord.subEventId || ""}
                          onChange={(e) => handleUpdateAssignment(coord.id, e.target.value)}
                          disabled={isPending}
                          className="border border-[#D9D9DF] rounded px-3 py-1.5 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender font-semibold text-xs text-eventrix-black w-full max-w-[220px]"
                        >
                          <option value="">Unassigned (No event permitted)</option>
                          {subEvents.map(ev => (
                            <option key={ev.id} value={ev.id}>
                              {ev.title} ({ev.category})
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <span className="bg-eventrix-lavender/20 text-eventrix-black border border-eventrix-lavender/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-purple-600" /> Active Coordinator
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCoordinator(coord.id, coord.fullName)}
                          disabled={isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors inline-flex items-center gap-1 text-xs font-bold uppercase cursor-pointer"
                          title="Remove Coordinator"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}

                  {coordinators.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                        No coordinator accounts found. Switch to "Add Coordinator" tab to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ADD NEW COORDINATOR */}
      {activeTab === "add" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-[#D9D9DF] p-8 rounded-md shadow-sm space-y-8">
            <div className="border-b border-[#D9D9DF] pb-4">
              <h2 className="text-xl font-bold text-eventrix-black uppercase tracking-wide flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-eventrix-lavender" /> Create New Coordinator Account
              </h2>
              <p className="text-xs text-eventrix-muted font-medium mt-1">
                Fill in all required fields to register a new event coordinator account.
              </p>
            </div>

            <form onSubmit={handleCreateCoordinator} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    required 
                    placeholder="Your Full Name" 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    name="mobile" 
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    title="10 digits required"
                    onInvalid={(e) => e.currentTarget.setCustomValidity('10 digits required')}
                    onInput={(e) => e.currentTarget.setCustomValidity('')}
                    value={formData.mobile} 
                    onChange={handleChange} 
                    required 
                    placeholder="Your Phone Number" 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    placeholder="john.doe@example.com" 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium cursor-pointer"
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                {/* College / Institution Name */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    College / Institution Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="college" 
                    value={formData.college} 
                    onChange={handleChange} 
                    required 
                    placeholder="College Name" 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Department / Branch */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Department / Branch <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    name="department" 
                    value={formData.department} 
                    onChange={handleChange} 
                    required 
                    placeholder="Information Technology" 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Year of Study */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="yearOfStudy" 
                    value={formData.yearOfStudy} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium cursor-pointer" 
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="PG / Other">PG / Other</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Password <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    minLength={6} 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    minLength={6} 
                    className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-[#D9D9DF] flex flex-col sm:flex-row gap-4 items-center justify-between">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs font-bold text-eventrix-muted hover:text-eventrix-black uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  {isPending ? "Creating Account..." : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
