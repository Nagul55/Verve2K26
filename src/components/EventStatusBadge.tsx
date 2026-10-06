"use client";

import React, { useEffect, useState } from "react";
import { Users, Timer, XCircle } from "lucide-react";

interface EventStatusBadgeProps {
  date?: string;
  time?: string;
  capacity?: number;
  registeredCount?: number;
  festRegistrationClosesAt?: string | null;
}

export function EventStatusBadge({
  date,
  time,
  capacity,
  registeredCount,
  festRegistrationClosesAt
}: EventStatusBadgeProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();

      // Check Fest-level deadline first if configured
      if (festRegistrationClosesAt) {
        const festClosure = new Date(festRegistrationClosesAt).getTime();
        if (now >= festClosure) {
          setIsClosed(true);
          setTimeLeft(null);
          return;
        }
      }

      // Check event date & time if available
      let closureTime: Date | null = null;
      if (date) {
        try {
          if (time && (time.includes("AM") || time.includes("PM"))) {
            const [timePart, modifier] = time.split(" ");
            let [hours, minutes] = timePart.split(":");
            let hrs = parseInt(hours, 10);
            if (modifier === "PM" && hrs < 12) hrs += 12;
            if (modifier === "AM" && hrs === 12) hrs = 0;
            const eventDateObj = new Date(`${date}T${hrs.toString().padStart(2, '0')}:${minutes}:00`);
            closureTime = new Date(eventDateObj.getTime() - 24 * 60 * 60 * 1000);
          } else if (time) {
            const eventDateObj = new Date(`${date}T${time}:00`);
            closureTime = new Date(eventDateObj.getTime() - 24 * 60 * 60 * 1000);
          } else {
            const eventDateObj = new Date(date);
            closureTime = new Date(eventDateObj.getTime() - 24 * 60 * 60 * 1000);
          }
        } catch (e) {
          // ignore date parse errors
        }
      }

      // Effective closure is either fest deadline or event deadline, whichever is earlier
      let targetTime: number | null = festRegistrationClosesAt ? new Date(festRegistrationClosesAt).getTime() : null;
      if (closureTime) {
        if (!targetTime || closureTime.getTime() < targetTime) {
          targetTime = closureTime.getTime();
        }
      }

      if (!targetTime) {
        setTimeLeft(null);
        setIsClosed(false);
        return;
      }

      const diff = targetTime - now;
      if (diff <= 0) {
        setIsClosed(true);
        setTimeLeft(null);
      } else {
        setIsClosed(false);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [date, time, festRegistrationClosesAt]);

  const hasCapacityLimit = typeof capacity === 'number' && capacity > 0;
  const regCount = typeof registeredCount === 'number' ? registeredCount : 0;
  const availableSeats = hasCapacityLimit ? Math.max(0, capacity - regCount) : null;
  const isSoldOut = hasCapacityLimit && availableSeats === 0;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {/* Seats Badge */}
      {hasCapacityLimit && (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${
          isSoldOut ? 'bg-red-100 text-red-700 border border-red-200' : 
          (availableSeats! <= 5 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200')
        }`}>
          <Users className="w-3 h-3" />
          {isSoldOut ? 'Sold Out (0 Seats Left)' : `${availableSeats} / ${capacity} Seats Available`}
        </span>
      )}

      {/* Closed Badge */}
      {isClosed && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-red-100 text-red-700 px-2.5 py-1 rounded border border-red-200">
          <XCircle className="w-3 h-3" /> Registration Closed
        </span>
      )}
    </div>
  );
}
