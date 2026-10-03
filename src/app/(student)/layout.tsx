import React from "react";
import { EventrixSidebar } from "@/components/EventrixSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Allow admins and coordinators to view the student dashboard if they want,
  // but guarantee that unauthenticated users are kicked out.
  
  return (
    <>
      <EventrixSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth">
        <TopNavbar />
        <div className="p-4 sm:p-8 lg:p-10 space-y-8 lg:space-y-10 pb-24 max-w-[1700px] mx-auto w-full transition-all duration-300">
          {children}
        </div>
      </main>
    </>
  );
}
