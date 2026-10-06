"use client";

import React from "react";
import { Calendar, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react";
import { TeamManager } from "./TeamManager";

interface RegistrationEventCardProps {
  number: string;
  category: string;
  title: string;
  date: string;
  location: string;
  participationType: string;
  teamDetails: any | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function RegistrationEventCard({ 
  number, 
  category, 
  title, 
  date, 
  location, 
  participationType, 
  teamDetails,
  isExpanded = false,
  onToggleExpand
}: RegistrationEventCardProps) {
  const isTeam = participationType === 'Team';

  const handleClick = () => {
    if (onToggleExpand) {
      onToggleExpand();
    }
  };

  return (
    <div className="flex flex-col gap-0 border border-[#D9D9DE] rounded-[4px] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow h-auto self-start">
      
      {/* Event Header Card (Clickable) */}
      <div 
        onClick={handleClick}
        className={`relative w-full p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-[#f8f8fc] transition-colors`}
      >
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#080A12]"></div>
        
        <div className="flex-1 pl-2">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-['Inter'] text-[10px] font-bold tracking-[0.15em] uppercase text-[#A98BFF] px-2 py-0.5 bg-[#A98BFF]/10 rounded-sm">
              {category}
            </span>
            {isTeam && (
              <span className="font-['Inter'] text-[10px] font-bold tracking-[0.1em] uppercase text-[#080A12] flex items-center gap-1">
                <Users className="w-3 h-3" /> Team Event
              </span>
            )}
          </div>
          <h4 className="font-['Roboto_Condensed','Anton',sans-serif] font-[800] text-[24px] uppercase text-[#080A12] leading-none mt-2 mb-3">
            {title}
          </h4>
          <div className="flex flex-wrap items-center gap-4 font-['Inter'] text-[12px] text-[#596078]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#080A12]" /> {date}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#080A12]" /> {location}
            </div>
          </div>
        </div>

        {/* Right Indicator */}
        <div className="shrink-0 flex items-center gap-4 pl-2">
          <div className="text-right hidden md:block">
            <span className="block text-[10px] text-[#596078] font-bold uppercase tracking-widest mb-1">Entry</span>
            <span className="block text-[18px] font-['Roboto_Condensed'] font-bold text-[#080A12]">#{number}</span>
          </div>
          
          {isTeam && (
            <div className="w-8 h-8 rounded-full bg-[#f0f0f5] flex items-center justify-center text-[#080A12]">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Team Details Section */}
      {isTeam && isExpanded && (
        <div className="border-t border-[#D9D9DE] bg-[#fafafa] p-4 animate-in slide-in-from-top-2">
          {teamDetails ? (
            <TeamManager teamDetails={teamDetails} />
          ) : (
            <div className="bg-white border border-red-200 p-4 rounded-[4px] text-red-600 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-bold text-[11px] uppercase tracking-wider">Action Required</span>
              </div>
              <p className="text-[12px] text-gray-600">You registered for this team event but haven't joined or created a team yet. Please check your invitations or create a team from the event page.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
