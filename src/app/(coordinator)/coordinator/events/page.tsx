import React from "react";
import { getFests, getSubEvents, deleteSubEvent } from "@/actions/event.actions";
import { DeleteButton } from "@/components/DeleteButton";
import { Calendar, Plus, MapPin, Clock, Users, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Download } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CoordinatorEventsPage({ searchParams }: { searchParams: Promise<{ fest_id?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const festId = resolvedSearchParams?.fest_id;
  const fests = await getFests();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no fest_id selected, show AVAILABLE FESTS view (matching student portal)
  if (!festId) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            AVAILABLE FESTS
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Select an active festival to manage your assigned technical and non-technical sub-events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(fests || []).map((fest) => (
            <Link href={`/coordinator/events?fest_id=${fest.id}`} key={fest.id} className="group block">
              <div className="border border-[#D9D9DF] rounded-md overflow-hidden bg-white hover:border-eventrix-black transition-colors relative h-full flex flex-col">
                <div className="h-32 bg-[#F8F8FC] relative flex items-center justify-center border-b border-[#D9D9DF] overflow-hidden group-hover:bg-[#EBEBF2] transition-colors">
                  <span className="font-anton text-4xl text-eventrix-lavender/30 absolute tracking-widest">{fest.name.toUpperCase()}</span>
                  <h3 className="font-anton text-3xl text-eventrix-black z-10">{fest.name}</h3>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-sm text-eventrix-muted font-medium mb-6 line-clamp-3 flex-1">
                    {fest.description}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-[#D9D9DF]">
                    <div className="space-y-1">
                      <span className="block text-[10px] font-bold text-eventrix-muted uppercase tracking-widest">Requirements</span>
                      <span className="block text-xs font-bold text-eventrix-black">
                        {fest.min_technical} Tech / {fest.min_non_technical} Non-Tech
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-eventrix-black text-white flex items-center justify-center group-hover:bg-eventrix-lavender group-hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(167,139,250,1)] group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {(!fests || fests.length === 0) && (
            <div className="col-span-full p-16 text-center border-2 border-dashed border-[#D9D9DF] rounded-md">
              <p className="text-eventrix-muted font-bold">No active fests found in system.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // View 2: Sub-Events inside selected Fest
  const selectedFest = fests.find(f => f.id === festId);
  const subEvents = await getSubEvents(festId, true);

  // Get coordinator assigned sub-event IDs & role
  const userRole = user?.app_metadata?.role || 'coordinator';
  const assignedEventIds: string[] = Array.isArray(user?.app_metadata?.coordinating_event_ids)
    ? user.app_metadata.coordinating_event_ids
    : user?.app_metadata?.coordinating_event_id ? [user.app_metadata.coordinating_event_id] : [];

  // Filter sub-events so coordinator ONLY sees events assigned to them by Admin
  const visibleSubEvents = (subEvents || []).filter((event) => {
    if (userRole === 'admin') return true;
    if (assignedEventIds.length === 0) return false;
    return assignedEventIds.includes(event.id);
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4">
        <Link 
          href="/coordinator/events" 
          className="text-eventrix-muted font-bold text-xs uppercase tracking-widest hover:text-eventrix-lavender flex items-center gap-1 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Available Fests
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-eventrix-lavender uppercase tracking-widest mb-1 block">
              Fest: {selectedFest ? selectedFest.name : 'Verve26'}
            </span>
            <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
              MANAGE SUB-EVENTS
            </h1>
            <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
              Manage your assigned technical and non-technical activities under this Fest.
            </p>
          </div>

          <Link 
            href={`/coordinator/events/new?fest_id=${festId}`} 
            className="bg-eventrix-black text-eventrix-white px-6 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 w-fit cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Sub-Event
          </Link>
        </div>
      </div>

      <div className="bg-white border border-[#D9D9DF] rounded-md overflow-x-auto shadow-sm">
        <table className="w-full text-left text-sm min-w-[1050px]">
          <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Format</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Venue</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9DF]">
            {visibleSubEvents.map((event) => {
              const isAssigned = assignedEventIds.includes(event.id);

              return (
                <tr key={event.id} className="hover:bg-[#F8F8FC] transition-colors bg-purple-50/30">
                  <td className="px-6 py-4 font-bold text-eventrix-black">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{event.title}</span>
                      <span className="bg-eventrix-lavender text-eventrix-black text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                        Permitted Event
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                      event.category === 'Technical' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {event.category}
                    </span>
                  </td>

                  <td className="px-6 py-4 font-medium text-eventrix-muted text-xs">
                    {event.participation_type || 'Individual'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-eventrix-black font-medium text-xs">
                      <Calendar className="w-3.5 h-3.5 text-eventrix-muted" /> {event.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-eventrix-muted font-medium text-xs mt-1">
                      <Clock className="w-3.5 h-3.5" /> {event.time}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-eventrix-black text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-eventrix-muted" /> {event.location}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {event.status === 'LIVE' ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Live
                      </span>
                    ) : event.status === 'PENDING_APPROVAL' ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pending Admin Approval
                      </span>
                    ) : event.status === 'REJECTED' ? (
                      <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                        Draft
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/coordinator/events/${event.id}/edit`}
                        title="Edit Sub-Event"
                        className="text-eventrix-black hover:text-eventrix-lavender font-bold text-xs uppercase tracking-wider border border-[#D9D9DF] px-2.5 py-1 rounded bg-white hover:border-eventrix-black transition-colors"
                      >
                        Edit
                      </Link>
                      <Link 
                        href="/coordinator/participants" 
                        className="text-xs font-bold text-eventrix-lavender hover:text-eventrix-black uppercase tracking-wider transition-colors flex items-center gap-1"
                      >
                        Roster <ArrowRight className="w-3 h-3" />
                      </Link>
                      <a 
                        href={`/api/admin/export?sub_event_id=${event.id}`}
                        download
                        title="Download Participants CSV"
                        className="text-eventrix-muted hover:text-eventrix-black transition-colors mr-2"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <DeleteButton id={event.id} onDelete={deleteSubEvent} itemType="Sub-Event" />
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibleSubEvents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-eventrix-muted font-bold text-sm">
                  {assignedEventIds.length > 0 ? (
                    <span>No sub-events found matching your assigned event permissions.</span>
                  ) : (
                    <span className="text-amber-700 font-semibold">
                      You have not been granted permission to manage any sub-event by the Admin yet. Please contact your administrator.
                    </span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
