"use client";

import React, { useState, useEffect, useTransition, use } from "react";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getFestById, updateFest } from "@/actions/event.actions";
import { toast } from "sonner";
import { DeadlinePicker } from "@/components/DeadlinePicker";

export default function AdminEditFestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_technical: "1",
    min_non_technical: "1",
    registration_closes_at: ""
  });

  useEffect(() => {
    async function loadFest() {
      setIsLoading(true);
      const fest = await getFestById(id);
      if (!fest) {
        toast.error("Fest not found.");
        router.push("/admin/events");
        return;
      }

      setFormData({
        name: fest.name || "",
        description: fest.description || "",
        min_technical: String(fest.min_technical ?? 1),
        min_non_technical: String(fest.min_non_technical ?? 1),
        registration_closes_at: fest.registration_closes_at || ""
      });
      setIsLoading(false);
    }
    loadFest();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await updateFest(
        id,
        formData.name,
        formData.description,
        parseInt(formData.min_technical) || 0,
        parseInt(formData.min_non_technical) || 0,
        formData.registration_closes_at || null
      );

      if (res.error) {
        toast.error(res.error);
      } else if (res.warning) {
        toast.warning(res.warning, { duration: 6000 });
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1500);
      } else {
        toast.success("Fest updated successfully!");
        setTimeout(() => {
          router.push('/admin/events');
          router.refresh();
        }, 1000);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-eventrix-lavender" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex flex-col gap-4">
        <Link href="/admin/events" className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Main Events
        </Link>
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Edit Main Event (Fest)
          </h1>
          <p className="text-eventrix-muted font-medium text-sm">
            Update Fest settings and registration closing deadline.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] p-8 rounded-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Main Event Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Verve26" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} placeholder="The Ultimate Tech and Cultural Fest" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium resize-none" />
            </div>
          </div>

          <div className="pt-6 border-t border-[#D9D9DF]">
            <h3 className="font-bold text-eventrix-black uppercase tracking-widest mb-4 text-sm">Registration Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Min. Technical Events Required</label>
                <input type="number" min="0" name="min_technical" value={formData.min_technical} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Min. Non-Technical Events Required</label>
                <input type="number" min="0" name="min_non_technical" value={formData.min_non_technical} onChange={handleChange} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="md:col-span-2">
                <DeadlinePicker
                  value={formData.registration_closes_at}
                  onChange={(isoValue) => setFormData(prev => ({ ...prev, registration_closes_at: isoValue || "" }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#D9D9DF]">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-eventrix-black text-eventrix-white px-8 py-4 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 flex items-center gap-2 w-full justify-center cursor-pointer"
            >
              {isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
