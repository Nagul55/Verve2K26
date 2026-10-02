import React from "react";
import { EventrixSidebar } from "@/components/EventrixSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <EventrixSidebar />
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <TopNavbar />
        <div className="p-8 lg:p-10 space-y-10 pb-24 max-w-[1700px] mx-auto w-full">
          {children}
        </div>
      </main>
    </>
  );
}
