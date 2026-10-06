import React from "react";
import { getFests, deleteFest } from "@/actions/event.actions";
import { DeleteButton } from "@/components/DeleteButton";
import { Plus, List, Edit } from "lucide-react";
import Link from "next/link";
import { CreateEventButton } from "./CreateEventButton";

export default async function AdminEventsPage() {
  const fests = await getFests();

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Manage Events
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Create and manage parent events (like Fests and Hackathons) and define their global rules.
          </p>
        </div>
        <CreateEventButton />
      </div>

      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[800px]">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Event Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Description / Tagline</th>
              <th className="px-6 py-4">Registration Deadline & Rules</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {(fests || []).map((fest) => (
              <tr key={fest.id} className="hover:bg-[#F8F8FC] transition-colors">
                <td className="px-6 py-4 font-bold text-eventrix-black text-lg font-anton tracking-wide uppercase">{fest.name}</td>
                <td className="px-6 py-4 text-eventrix-muted font-bold text-xs uppercase tracking-widest">{fest.event_type || 'Fest'}</td>
                <td className="px-6 py-4 text-eventrix-muted">{fest.description}</td>
                <td className="px-6 py-4">
                  {fest.event_type === 'hackathon' ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-eventrix-muted">
                        Teams Required
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-eventrix-muted">
                        Deadline: <span className="text-eventrix-black">
                          {fest.registration_closes_at 
                            ? new Date(fest.registration_closes_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) 
                            : 'No deadline set'}
                        </span>
                      </span>
                      <span className="text-xs font-bold text-eventrix-muted">
                        Min Technical: <span className="text-eventrix-black">{fest.min_technical}</span>
                      </span>
                      <span className="text-xs font-bold text-eventrix-muted">
                        Min Non-Tech: <span className="text-eventrix-black">{fest.min_non_technical}</span>
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-4">
                    {fest.event_type === 'hackathon' ? (
                      <Link href={`/admin/events/edit-hackathon?id=${fest.id}`} className="flex items-center gap-1 text-eventrix-black font-bold text-xs uppercase hover:text-eventrix-lavender transition-colors editorial-label">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                    ) : (
                      <>
                        <Link href={`/admin/events/${fest.id}/edit`} className="flex items-center gap-1 text-eventrix-black font-bold text-xs uppercase hover:text-eventrix-lavender transition-colors editorial-label">
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <Link href={`/admin/sub-events?fest_id=${fest.id}`} className="flex items-center gap-1 text-eventrix-lavender font-bold text-xs uppercase hover:text-eventrix-black transition-colors editorial-label">
                          <List className="w-3.5 h-3.5" /> Sub-Events
                        </Link>
                      </>
                    )}
                    <DeleteButton id={fest.id} onDelete={deleteFest} itemType="Fest" />
                  </div>
                </td>
              </tr>
            ))}

            {(!fests || fests.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
                  No events found. Click "Create Event" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
