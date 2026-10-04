import React from "react";
import { getSubEventsWithCoordinators, deleteSubEvent } from "@/actions/event.actions";
import { DeleteButton } from "@/components/DeleteButton";
import { ApproveButton } from "@/components/ApproveButton";
import { Calendar, Plus, MapPin, Clock, ArrowLeft, Download, UserX } from "lucide-react";
import Link from "next/link";

export default async function AdminSubEventsPage({ searchParams }: { searchParams: Promise<{ fest_id?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const { fest, subEvents } = await getSubEventsWithCoordinators(resolvedSearchParams?.fest_id);

  const festId = fest?.id || '5a567e01-9c0f-47aa-8960-c09dd88afae5';

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4">
        <Link href="/admin/events" className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft className="w-3 h-3" /> Back to Fests
        </Link>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
              Manage Sub-Events ({fest?.name || 'Verve26'})
            </h1>
            <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
              Manage all technical and non-technical activities under {fest?.name || 'Verve26'}.
            </p>
          </div>
          <Link href={`/admin/sub-events/new?fest_id=${festId}`} className="bg-eventrix-black text-eventrix-white px-6 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Sub-Event
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[1150px]">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Parent Fest</th>
              <th className="px-6 py-4">Coordinator</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Venue</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {(subEvents || []).map((event) => {
              const isApproved = event.status === 'Approved' || !event.status;

              return (
                <tr key={event.id} className="hover:bg-[#F8F8FC] transition-colors">
                  <td className="px-6 py-4 font-bold text-eventrix-black whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest ${event.category === 'Technical' ? 'bg-eventrix-lavender/20 text-eventrix-lavender' : 'bg-gray-200 text-gray-700'}`}>
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-eventrix-black whitespace-nowrap">
                    {event.parentFestName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.coordinatorName === 'Unassigned' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded">
                        <UserX className="w-3 h-3 text-gray-400" /> Unassigned
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-eventrix-black">{event.coordinatorName}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-eventrix-muted whitespace-nowrap">
                    {event.participation_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-eventrix-muted font-medium text-xs">
                      <Calendar className="w-3.5 h-3.5" /> {event.date}
                    </div>
                    <div className="flex items-center gap-2 text-eventrix-muted font-medium text-xs mt-1">
                      <Clock className="w-3.5 h-3.5" /> {event.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-eventrix-muted text-xs whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> {event.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ApproveButton id={event.id} isApproved={isApproved} />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/sub-events/${event.id}/edit`}
                        title="Edit Sub-Event"
                        className="text-eventrix-muted hover:text-eventrix-black font-bold text-xs uppercase tracking-wider border border-[#D9D9DF] px-2.5 py-1 rounded hover:border-eventrix-black transition-colors"
                      >
                        Edit
                      </Link>
                      <a 
                        href={`/api/admin/export?sub_event_id=${event.id}`}
                        download
                        title="Download Participants CSV"
                        className="text-eventrix-muted hover:text-eventrix-black transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <DeleteButton id={event.id} onDelete={deleteSubEvent} itemType="Sub-Event" />
                    </div>
                  </td>
                </tr>
              );
            })}

            {(!subEvents || subEvents.length === 0) && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
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
