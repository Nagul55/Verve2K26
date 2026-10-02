"use client";

import React, { useState, useTransition } from "react";
import { Save, AlertTriangle, CheckCircle } from "lucide-react";
import { updateProfile } from "@/actions/profile.actions";
import { useRouter } from "next/navigation";

export function SettingsProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
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
    ? "w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
    : "w-full border-b border-[#D9D9DF] px-1 py-2 bg-transparent focus:outline-none text-sm font-bold text-eventrix-black disabled:opacity-80";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative">
      {!isEditing && (
        <button 
          type="button" 
          onClick={() => setIsEditing(true)}
          className="absolute -top-12 right-0 text-eventrix-lavender font-bold text-xs uppercase hover:text-eventrix-black transition-colors editorial-label"
        >
          Edit Details
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Full Name</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} required disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Email Address</label>
          <input name="email" value={formData.email} onChange={handleChange} required type="email" disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Mobile Number</label>
          <input name="mobile" value={formData.mobile} onChange={handleChange} disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">College Name</label>
          <input name="college" value={formData.college} onChange={handleChange} disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Register Number</label>
          <input name="register_number" value={formData.register_number} onChange={handleChange} disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Department</label>
          <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g. B.Tech IT" disabled={!isEditing} className={inputClass} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Year of Study</label>
          <input name="year_of_study" value={formData.year_of_study} onChange={handleChange} placeholder="e.g. III Year" disabled={!isEditing} className={inputClass} />
        </div>
      </div>

      {statusMsg.text && (
        <div className={`p-4 rounded-md text-sm font-bold flex gap-3 ${statusMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {statusMsg.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          <p>{statusMsg.text}</p>
        </div>
      )}

      {isEditing && (
        <div className="pt-6 flex gap-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-eventrix-lavender hover:text-eventrix-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(167,139,250,1)] disabled:shadow-none flex items-center gap-2 justify-center"
          >
            {isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
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
            }}
            className="border-2 border-eventrix-black text-eventrix-black px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
}
