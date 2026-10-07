import React from "react";
import { EventrixSidebar } from "@/components/EventrixSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { FooterNav } from "@/components/FooterNav";
import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  // Allow admins and coordinators to view the student dashboard if they want,
  // but guarantee that unauthenticated users are kicked out.
  
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <EventrixSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col justify-between">
          <div className="p-4 sm:p-8 lg:p-10 space-y-8 lg:space-y-10 pb-8 max-w-[1700px] mx-auto w-full transition-all duration-300 flex-1">
            {children}
          </div>
          <FooterNav />
        </main>
      </div>
    </div>
  );
}
