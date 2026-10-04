"use client";

import React, { useState, useTransition } from "react";
import { Save, AlertTriangle, CheckCircle, Edit2, X } from "lucide-react";
import { updateProfile } from "@/actions/profile.actions";
import { useRouter } from "next/navigation";

export function SettingsProfileForm({ initialData, userId, showAcademic = true }: { initialData: any, userId: string, showAcademic?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    mobile: initialData?.mobile || "",
    college: initialData?.college || "",
    register_number: initialData?.register_number || "",
    department: initialData?.department || "",
    year_of_study: initialData?.year_of_study || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: "", type: "" });

    startTransition(async () => {
      const { success, error } = await updateProfile(userId, formData);
      if (error) {
        setStatusMsg({ text: error, type: "error" });
      } else {
        setStatusMsg({ text: "Profile updated successfully!", type: "success" });
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  const inputClass = isEditing 
    ? "w-full border-2 border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-black focus:bg-white text-sm font-medium transition-all" 
    : "w-full border-b-2 border-transparent px-1 py-2 bg-transparent focus:outline-none text-sm font-bold text-eventrix-black disabled:opacity-90";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-10">
      
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-eventrix-muted font-medium">Manage your personal information and preferences.</p>
        
        {!isEditing ? (
          <button 
            type="button" 
            onClick={() => setIsEditing(true)}
            className="bg-eventrix-black text-white px-6 py-2.5 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" /> Edit Details
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  full_name: initialData?.full_name || "",
                  email: initialData?.email || "",
                  mobile: initialData?.mobile || "",
                  college: initialData?.college || "",
                  register_number: initialData?.register_number || "",
                  department: initialData?.department || "",
                  year_of_study: initialData?.year_of_study || "",
                });
                setStatusMsg({ text: "", type: "" });
              }}
              className="border border-[#D9D9DF] bg-white text-eventrix-black px-6 py-2.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-white px-6 py-2.5 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Section 1: Personal Info */}
        <div className="bg-white border-2 border-[#D9D9DF] rounded-xl overflow-hidden transition-colors focus-within:border-eventrix-black shadow-sm">
          <div className="bg-gray-50 px-8 py-5 border-b-2 border-[#D9D9DF]">
            <h3 className="font-anton text-2xl uppercase tracking-wide text-eventrix-black">Personal Information</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Full Name</label>
              <input name="full_name" value={formData.full_name} onChange={handleChange} required disabled={!isEditing} className={inputClass} placeholder={isEditing ? "Your Full Name" : "-"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} required type="email" disabled={!isEditing} className={inputClass} placeholder={isEditing ? "john.doe@example.com" : "-"} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Mobile Number</label>
              <input name="mobile" value={formData.mobile} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder={isEditing ? "Your Phone Number" : "-"} />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Info */}
        {showAcademic && (
          <div className="bg-white border-2 border-[#D9D9DF] rounded-xl overflow-hidden transition-colors focus-within:border-eventrix-black shadow-sm">
            <div className="bg-gray-50 px-8 py-5 border-b-2 border-[#D9D9DF]">
              <h3 className="font-anton text-2xl uppercase tracking-wide text-eventrix-black">Academic Details</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">College Name</label>
                <input name="college" value={formData.college} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder={isEditing ? "College Name" : "-"} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Register Number</label>
                <input name="register_number" value={formData.register_number} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder={isEditing ? "Register / Roll Number" : "-"} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Department</label>
                <input name="department" value={formData.department} onChange={handleChange} placeholder={isEditing ? "Information Technology" : "-"} disabled={!isEditing} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Year of Study</label>
                <input name="year_of_study" value={formData.year_of_study} onChange={handleChange} placeholder={isEditing ? "e.g. 1st Year / 3rd Year" : "-"} disabled={!isEditing} className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-md border-2 font-bold flex gap-3 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {statusMsg.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
          <p>{statusMsg.text}</p>
        </div>
      )}
    </form>
  );
}

