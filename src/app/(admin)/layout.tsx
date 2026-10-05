import React from "react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const role = user.app_metadata?.role;
  const isMasterAdmin = user.email?.toLowerCase() === 'admin@eventrix.com';
  if (!isMasterAdmin && role !== 'admin' && role !== 'Super Admin') {
    // If not an admin, redirect based on their actual role
    if (role === 'coordinator') redirect('/coordinator');
    else redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10 pb-24 max-w-[1700px] mx-auto w-full transition-all duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
