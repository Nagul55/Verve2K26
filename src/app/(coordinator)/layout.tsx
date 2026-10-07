import React from "react";
import { CoordinatorSidebar } from "@/components/CoordinatorSidebar";
import { TopNavbar } from "@/components/TopNavbar";
import { FooterNav } from "@/components/FooterNav";
import { getCurrentUser } from "@/lib/auth/get-user";
import { redirect } from "next/navigation";

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  if (role === 'admin' || role === 'Super Admin') {
    redirect('/admin');
  }
  if (role !== 'coordinator') {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F8FC]">
      <CoordinatorSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto scroll-smooth flex flex-col justify-between">
          <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10 pb-8 max-w-[1700px] mx-auto w-full transition-all duration-300 flex-1">
            {children}
          </div>
          <FooterNav />
        </main>
      </div>
    </div>
  );
}
