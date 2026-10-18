"use client";

import React, { useState, useTransition } from "react";
import { Save, Edit2 } from "lucide-react";
import { updateProfile } from "@/actions/profile.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { UserAvatar } from "@/components/UserAvatar";
import { DepartmentSelect } from "@/components/ui/DepartmentSelect";

export function SettingsProfileForm({ initialData, userId, showAcademic = true }: { initialData: any, userId: string, showAcademic?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const initialValues = {
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
    mobile: initialData?.mobile || "",
    college: initialData?.college || "",
    register_number: initialData?.register_number || "",
    department: initialData?.department || "",
    year_of_study: initialData?.year_of_study || "",
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    key: `eventrix_profile_form_draft_${userId}`,
    initialValues,
    showRestoredToast: isEditing,
  });

  // Sync formData with server data when not editing, effectively clearing stale drafts
  React.useEffect(() => {
    if (!isEditing) {
      setFormData({
        full_name: initialData?.full_name || "",
        email: initialData?.email || "",
        mobile: initialData?.mobile || "",
        college: initialData?.college || "",
        register_number: initialData?.register_number || "",
        department: initialData?.department || "",
        year_of_study: initialData?.year_of_study || "",
      });
    }
  }, [
    initialData?.full_name,
    initialData?.email,
    initialData?.mobile,
    initialData?.college,
    initialData?.register_number,
    initialData?.department,
    initialData?.year_of_study,
    isEditing,
    setFormData
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.name === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.mobile && formData.mobile.length !== 10) {
      toast.error("10 digits required");
      return;
    }

    startTransition(async () => {
      const { success, error } = await updateProfile(userId, formData);
      if (error) {
        toast.error(error);
      } else {
        clearDraft();
        toast.success("Profile updated successfully!");
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
                clearDraft();
                setIsEditing(false);
                setFormData(initialValues);
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
        <div className="bg-white border-2 border-[#D9D9DF] rounded-xl transition-colors focus-within:border-eventrix-black shadow-sm">
          <div className="bg-gray-50 px-8 py-5 border-b-2 border-[#D9D9DF] rounded-t-[10px] flex items-center gap-4">
            <UserAvatar
              user={initialData}
              alt="User Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-eventrix-lavender shadow-sm shrink-0"
            />
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
              <input name="mobile" type="tel" maxLength={10} inputMode="numeric" pattern="[0-9]{10}" title="10 digits required" onInvalid={(e) => e.currentTarget.setCustomValidity('10 digits required')} onInput={(e) => e.currentTarget.setCustomValidity('')} value={formData.mobile} onChange={handleChange} disabled={!isEditing} className={inputClass} placeholder={isEditing ? "Your Phone Number" : "-"} />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Info */}
        {showAcademic && (
          <div className="bg-white border-2 border-[#D9D9DF] rounded-xl transition-colors focus-within:border-eventrix-black shadow-sm">
            <div className="bg-gray-50 px-8 py-5 border-b-2 border-[#D9D9DF] rounded-t-[10px]">
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
                <DepartmentSelect
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                  disabled={!isEditing}
                  placeholder={isEditing ? "Select Department" : "-"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Year of Study</label>
                <input name="year_of_study" value={formData.year_of_study} onChange={handleChange} placeholder={isEditing ? "e.g. 1st Year / 3rd Year" : "-"} disabled={!isEditing} className={inputClass} />
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

