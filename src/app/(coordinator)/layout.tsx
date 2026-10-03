import React from "react";
import { CoordinatorSidebar } from "@/components/CoordinatorSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  const role = user.app_metadata?.role;
  if (role !== 'coordinator' && role !== 'admin' && role !== 'Super Admin') {
    // If not a coordinator or admin, redirect back to their dashboard
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F8FC]">
      <CoordinatorSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth">
        <TopNavbar />
        <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10 pb-24 max-w-[1700px] mx-auto w-full transition-all duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}
