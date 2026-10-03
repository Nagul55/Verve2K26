import React from "react";
import { CoordinatorSidebar } from "@/components/CoordinatorSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F8FC]">
      <CoordinatorSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <TopNavbar />
        <div className="p-8 lg:p-10 space-y-10 pb-24 max-w-[1700px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
