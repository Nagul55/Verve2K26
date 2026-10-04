"use client";

import React, { useTransition } from "react";
import { Save } from "lucide-react";
import { updateAdminProfile } from "@/actions/profile.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFormDraft } from "@/hooks/useFormDraft";

interface AdminProfileFormProps {
  initialData: {
    full_name: string;
    email: string;
  };
  userId: string;
}

export function AdminProfileForm({ initialData, userId }: AdminProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialValues = {
    full_name: initialData?.full_name || "",
    email: initialData?.email || "",
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    key: `eventrix_admin_profile_draft_${userId}`,
    initialValues,
    showRestoredToast: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancel = () => {
    clearDraft();
    setFormData(initialValues);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      toast.error("Full Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email Address is required.");
      return;
    }

    startTransition(async () => {
      const result = await updateAdminProfile(userId, {
        full_name: formData.full_name,
        email: formData.email,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        clearDraft();
        toast.success("Profile updated successfully!");
        router.refresh();
      }
    });
  };

  const hasChanges =
    formData.full_name !== initialValues.full_name ||
    formData.email !== initialValues.email;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="bg-white border-2 border-[#D9D9DF] rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-8 py-5 border-b-2 border-[#D9D9DF] flex items-center gap-4">
          <img
            src="/images/user-avatar.png"
            alt="Admin Profile Avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-eventrix-lavender shadow-sm shrink-0"
          />
          <div>
            <h3 className="font-anton text-2xl uppercase tracking-wide text-eventrix-black">
              Personal Information
            </h3>
            <p className="text-xs text-eventrix-muted font-medium mt-0.5">
              Manage your administrator account details.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full border-2 border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-black focus:bg-white text-sm font-bold text-eventrix-black transition-all"
              placeholder="Admin Full Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest flex items-center gap-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isPending}
              className="w-full border-2 border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-black focus:bg-white text-sm font-bold text-eventrix-black transition-all"
              placeholder="admin@eventrix.com"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#D9D9DF]">
            {hasChanges && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="border border-[#D9D9DF] bg-white text-eventrix-black px-6 py-2.5 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="bg-eventrix-black text-white px-8 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                "SAVING..."
              ) : (
                <>
                  <Save className="w-4 h-4" /> SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
