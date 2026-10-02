import React from "react";
import { getFests, deleteFest } from "@/actions/event.actions";
import { DeleteButton } from "@/components/DeleteButton";
import { Plus, List, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminEventsPage() {
  const fests = await getFests();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Manage Fests
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Create and manage parent events (like Verve26) and define their global registration rules.
          </p>
        </div>
        <Link href="/admin/events/new" className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Fest
        </Link>
      </div>

      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Fest Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Registration Rules</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {(fests || []).map((fest) => (
              <tr key={fest.id} className="hover:bg-[#F8F8FC] transition-colors">
                <td className="px-6 py-4 font-bold text-eventrix-black text-lg font-anton tracking-wide uppercase">{fest.name}</td>
                <td className="px-6 py-4 text-eventrix-muted">{fest.description}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-eventrix-muted">
                      Min Technical: <span className="text-eventrix-black">{fest.min_technical}</span>
                    </span>
                    <span className="text-xs font-bold text-eventrix-muted">
                      Min Non-Tech: <span className="text-eventrix-black">{fest.min_non_technical}</span>
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/sub-events?fest_id=${fest.id}`} className="flex items-center gap-1 text-eventrix-lavender font-bold text-xs uppercase hover:text-eventrix-black transition-colors editorial-label">
                      <List className="w-3.5 h-3.5" /> Sub-Events
                    </Link>
                    <DeleteButton id={fest.id} onDelete={deleteFest} itemType="Fest" />
                  </div>
                </td>
              </tr>
            ))}

            {(!fests || fests.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
                  No Fests found. Click "Create Fest" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
