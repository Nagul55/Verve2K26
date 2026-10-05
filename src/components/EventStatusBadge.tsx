"use client";

import React, { useEffect, useState } from "react";
import { Users, Timer, XCircle } from "lucide-react";

interface EventStatusBadgeProps {
  date: string;
  time: string;
  capacity?: number;
  registeredCount?: number;
}

export function EventStatusBadge({ date, time, capacity, registeredCount }: EventStatusBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Parse event date and time
    // format is typically "YYYY-MM-DD" and "HH:MM AM/PM" or "HH:MM"
    if (!date) return;
    
    try {
      let eventDateObj: Date;
      if (time && time.includes("AM") || time.includes("PM")) {
        const [timePart, modifier] = time.split(" ");
        let [hours, minutes] = timePart.split(":");
        let hrs = parseInt(hours, 10);
        if (modifier === "PM" && hrs < 12) hrs += 12;
        if (modifier === "AM" && hrs === 12) hrs = 0;
        eventDateObj = new Date(`${date}T${hrs.toString().padStart(2, '0')}:${minutes}:00`);
      } else if (time) {
        eventDateObj = new Date(`${date}T${time}:00`);
      } else {
        eventDateObj = new Date(date);
      }

      // Closure time is 24 hours BEFORE event date
      const closureTime = new Date(eventDateObj.getTime() - 24 * 60 * 60 * 1000);

      const updateTimer = () => {
        const now = new Date();
        const diff = closureTime.getTime() - now.getTime();

        if (diff <= 0) {
          setIsClosed(true);
          setTimeLeft(null);
        } else {
          setIsClosed(false);
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          setTimeLeft({ days, hours, minutes });
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000); // update every minute
      return () => clearInterval(interval);
    } catch (e) {
      console.error("Error parsing date/time for countdown:", e);
    }
  }, [date, time]);

  const hasCapacityLimit = typeof capacity === 'number' && capacity > 0;
  const regCount = typeof registeredCount === 'number' ? registeredCount : 0;
  const availableSeats = hasCapacityLimit ? Math.max(0, capacity - regCount) : null;
  const isSoldOut = hasCapacityLimit && availableSeats === 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {/* Seats Badge */}
      {hasCapacityLimit && (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
          isSoldOut ? 'bg-red-100 text-red-700' : 
          (availableSeats! <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700')
        }`}>
          <Users className="w-3 h-3" />
          {isSoldOut ? 'Sold Out' : `${availableSeats} Seats Left`}
        </span>
      )}

      {/* Timer Badge */}
      {isClosed ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 px-2 py-1 rounded">
          <XCircle className="w-3 h-3" /> Registration Closed
        </span>
      ) : timeLeft ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">
          <Timer className="w-3 h-3" />
          Closes in: {timeLeft.days > 0 && `${timeLeft.days}d `}{timeLeft.hours}h {timeLeft.minutes}m
        </span>
      ) : null}
    </div>
  );
}
