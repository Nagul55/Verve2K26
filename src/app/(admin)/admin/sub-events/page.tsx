import React from "react";
import { getSubEvents, deleteSubEvent } from "@/actions/event.actions";
import { DeleteButton } from "@/components/DeleteButton";
import { ApproveButton } from "@/components/ApproveButton";
import { Calendar, Plus, MapPin, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminSubEventsPage({ searchParams }: { searchParams: Promise<{ fest_id?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const festId = resolvedSearchParams?.fest_id || '00000000-0000-0000-0000-000000000001';
  const subEvents = await getSubEvents(festId);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link href="/admin/events" className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Fests
        </Link>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
              Manage Sub-Events
            </h1>
            <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
              Manage all technical and non-technical activities under this Fest.
            </p>
          </div>
          <Link href={`/admin/sub-events/new?fest_id=${festId}`} className="bg-eventrix-black text-eventrix-white px-6 py-3 rounded-md font-bold text-sm tracking-wide uppercase transition-all hover:bg-eventrix-lavender hover:text-eventrix-black shadow-[4px_4px_0px_0px_#A78BFA] flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Sub-Event
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Venue</th>
              <th className="px-6 py-4">Approval Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {(subEvents || []).map((event) => {
              const isApproved = event.status === 'Approved' || !event.status;

              return (
                <tr key={event.id} className="hover:bg-[#F8F8FC] transition-colors">
                  <td className="px-6 py-4 font-bold text-eventrix-black">{event.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${event.category === 'Technical' ? 'bg-eventrix-lavender/20 text-eventrix-lavender' : 'bg-gray-200 text-gray-600'}`}>
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-eventrix-muted">
                    {event.participation_type}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-eventrix-muted font-medium text-xs">
                      <Calendar className="w-3.5 h-3.5" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-eventrix-muted font-medium text-xs mt-1">
                      <Clock className="w-3.5 h-3.5" /> {event.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-eventrix-muted text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ApproveButton id={event.id} isApproved={isApproved} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteButton id={event.id} onDelete={deleteSubEvent} itemType="Sub-Event" />
                  </td>
                </tr>
              );
            })}

            {(!subEvents || subEvents.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
                  No sub-events found for this Fest.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
