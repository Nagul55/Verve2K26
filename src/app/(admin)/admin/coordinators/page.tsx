"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Plus, Users, ShieldCheck, Mail, ShieldAlert } from "lucide-react";
import { getCoordinators, createCoordinator } from "@/actions/auth.actions";
import { getSubEvents } from "@/actions/event.actions";

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    subEventId: ""
  });
  const [subEvents, setSubEvents] = useState<any[]>([]);

  useEffect(() => {
    loadCoordinators();
  }, []);

  const loadCoordinators = async () => {
    const data = await getCoordinators();
    setCoordinators(data);
    const events = await getSubEvents();
    setSubEvents(events);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ text: "", type: "" });
    
    startTransition(async () => {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('subEventId', formData.subEventId);
      
      const res = await createCoordinator(data);
      
      if (res.error) {
        setStatus({ text: res.error, type: "error" });
      } else {
        setStatus({ text: "Coordinator account created successfully!", type: "success" });
        setFormData({ fullName: "", email: "", password: "", subEventId: "" });
        loadCoordinators(); // Refresh the list
      }
    });
  };

  return (
    <div className="space-y-10">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-anton text-[40px] text-eventrix-black leading-none uppercase tracking-wide mb-2">
            Manage Coordinators
          </h1>
          <p className="text-eventrix-muted font-medium max-w-2xl text-sm">
            Create and manage access for Event Coordinators who can scan tickets and oversee events.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Create Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-[#D9D9DF] p-6 rounded-md shadow-sm sticky top-10">
            <h2 className="text-lg font-bold text-eventrix-black mb-6 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-eventrix-lavender" /> Add Coordinator
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="e.g. John Doe" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="coordinator@college.edu" className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Temporary Password</label>
                <input type="text" name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" minLength={6} className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest">Assign to Event</label>
                <select name="subEventId" value={formData.subEventId} onChange={(e) => setFormData(prev => ({...prev, subEventId: e.target.value}))} required className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium">
                  <option value="">Select Event...</option>
                  {subEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              {status.text && (
                <div className={`p-3 rounded-md text-xs font-bold flex gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {status.type === 'error' ? <ShieldAlert className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
                  <p>{status.text}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isPending}
                className="bg-eventrix-black text-eventrix-white px-6 py-4 rounded-md font-bold text-sm tracking-wide uppercase hover:bg-eventrix-lavender hover:text-eventrix-black transition-colors disabled:opacity-50 shadow-[4px_4px_0px_0px_#A78BFA] disabled:shadow-none flex items-center justify-center gap-2 w-full mt-4"
              >
                {isPending ? "Creating..." : <><Plus className="w-4 h-4" /> Create Account</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: List */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-[#D9D9DF] rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8F8FC] border-b border-[#D9D9DF] text-eventrix-muted font-bold text-xs uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Coordinator Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Event</th>
                  <th className="px-6 py-4">Role Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9DF]">
                {coordinators.map((coord) => (
                  <tr key={coord.id} className="hover:bg-[#F8F8FC] transition-colors">
                    <td className="px-6 py-4 font-bold text-eventrix-black flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-eventrix-lavender/20 flex items-center justify-center text-eventrix-lavender font-anton text-lg">
                        {coord.fullName.charAt(0)}
                      </div>
                      {coord.fullName}
                    </td>
                    <td className="px-6 py-4 text-eventrix-muted text-xs">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> {coord.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-eventrix-black font-medium text-xs">
                      {subEvents.find(e => e.id === coord.subEventId)?.title || <span className="text-red-500 font-bold">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-eventrix-lavender/20 text-eventrix-lavender px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
                
                {coordinators.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-eventrix-muted font-bold text-sm">
                      No coordinators found. Add one from the form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
