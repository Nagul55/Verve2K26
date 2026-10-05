"use client";

import React, { useState, useEffect } from "react";
import { Users, Clock } from "lucide-react";
import { SubEvent } from "./EventDetailsModal";

interface EventStatusBadgeProps {
  event: SubEvent;
  registrationCount: number;
}

export function EventStatusBadge({ event, registrationCount }: EventStatusBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{ str: string; closed: boolean } | null>(null);

  useEffect(() => {
    if (!event.date || !event.time) return;

    const eventDateStr = `${event.date}T${event.time}:00`;
    let eventDate = new Date(eventDateStr);
    
    // Fallback parsing if ISO string fails (e.g. if time is in AM/PM format)
    if (isNaN(eventDate.getTime())) {
      const parsedDate = new Date(`${event.date} ${event.time}`);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate;
      }
    }

    if (isNaN(eventDate.getTime())) return;

    // Registration closes 24 hours (1 day) before the event
    const closingDate = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = new Date();
      const diffMs = closingDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft({ str: "Closed", closed: true });
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 1) {
        setTimeLeft({ str: `${days}d left`, closed: false });
      } else if (days === 1) {
        setTimeLeft({ str: `1d ${hours}h left`, closed: false });
      } else if (hours > 0) {
        setTimeLeft({ str: `${hours}h ${minutes}m left`, closed: false });
      } else {
        setTimeLeft({ str: `${minutes}m left`, closed: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute

    return () => clearInterval(interval);
  }, [event.date, event.time]);

  const capacity = event.capacity || 0;
  const isLimited = capacity > 0;
  const seatsAvailable = Math.max(0, capacity - registrationCount);
  const isFull = isLimited && seatsAvailable <= 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      {isLimited && (
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${isFull ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
          <Users className="w-3 h-3" />
          {isFull ? 'Sold Out' : `${seatsAvailable} Seats Left`}
        </span>
      )}
      
      {timeLeft && (
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${timeLeft.closed ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
          <Clock className="w-3 h-3" />
          {timeLeft.closed ? 'Reg Closed' : `Closes in ${timeLeft.str}`}
        </span>
      )}
    </div>
  );
}
