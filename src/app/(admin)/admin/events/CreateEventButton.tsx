"use client";

import React, { useState } from "react";
import { Plus, Calendar, Code, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateEventButton() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-eventrix-black text-eventrix-white px-6 py-3.5 rounded-md font-bold text-sm tracking-wide uppercase transition-all duration-200 shadow-[4px_4px_0px_0px_#A78BFA] hover:bg-eventrix-lavender hover:text-eventrix-black hover:shadow-[4px_4px_0px_0px_#080B18] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Create Event
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-[#D9D9DF]">
              <h2 className="font-anton text-[32px] text-eventrix-black leading-none uppercase tracking-wide">
                Create New Event
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-eventrix-muted hover:text-eventrix-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8">
              <p className="text-eventrix-muted font-bold text-sm mb-6 uppercase tracking-widest text-center">
                What type of event do you want to create?
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin/events/new');
                  }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-[#D9D9DF] rounded-xl hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-all group group-hover:shadow-md cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F8F8FC] group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
                    <Calendar className="w-8 h-8 text-eventrix-black group-hover:text-eventrix-lavender transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-eventrix-black uppercase tracking-wide mb-2">Fest</h3>
                  <p className="text-sm text-eventrix-muted text-center">Create a multi-event cultural or technical festival.</p>
                </button>
                
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin/events/new-hackathon');
                  }}
                  className="flex flex-col items-center justify-center p-8 border-2 border-[#D9D9DF] rounded-xl hover:border-eventrix-lavender hover:bg-[#F8F8FC] transition-all group group-hover:shadow-md cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[#F8F8FC] group-hover:bg-white flex items-center justify-center mb-4 transition-colors">
                    <Code className="w-8 h-8 text-eventrix-black group-hover:text-eventrix-lavender transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-eventrix-black uppercase tracking-wide mb-2">Hackathon</h3>
                  <p className="text-sm text-eventrix-muted text-center">Create a competitive coding or building hackathon.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
