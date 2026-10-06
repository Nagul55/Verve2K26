"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import { parseISTDeadlineParts, buildISTDeadlineISO } from "@/utils/date-utils";

interface DeadlinePickerProps {
  value: string; // ISO string or empty
  onChange: (isoValue: string | null) => void;
  error?: string;
}

export function DeadlinePicker({ value, onChange, error }: DeadlinePickerProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:30");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Sync internal state when value prop changes (e.g., when editing an existing fest)
  useEffect(() => {
    if (value) {
      const parts = parseISTDeadlineParts(value);
      if (parts) {
        setDate(parts.date);
        setTime(parts.time);
        setPeriod(parts.period);
      }
    } else {
      setDate("");
      setTime("09:30");
      setPeriod("AM");
    }
  }, [value]);

  const handleUpdate = (newDate: string, newTime: string, newPeriod: "AM" | "PM") => {
    setDate(newDate);
    setTime(newTime);
    setPeriod(newPeriod);

    if (!newDate) {
      onChange(null);
      return;
    }

    const iso = buildISTDeadlineISO(newDate, newTime || "09:30", newPeriod);
    onChange(iso);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest block">
        Registration Closes At (Deadline)
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* A. Date Input */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-eventrix-muted pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={(e) => handleUpdate(e.target.value, time, period)}
            className="w-full border border-[#D9D9DF] rounded-md pl-10 pr-3 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium text-eventrix-black transition-colors"
          />
        </div>

        {/* B. Time Input (12-hour format HH:MM) */}
        <div className="relative">
          <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-eventrix-muted pointer-events-none" />
          <input
            type="text"
            placeholder="09:30"
            value={time}
            onChange={(e) => {
              let val = e.target.value.replace(/[^0-9:]/g, "");
              if (val.length === 2 && !val.includes(":") && time.length < 2) {
                val += ":";
              }
              if (val.length > 5) val = val.slice(0, 5);
              handleUpdate(date, val, period);
            }}
            maxLength={5}
            className="w-full border border-[#D9D9DF] rounded-md pl-10 pr-3 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium text-eventrix-black transition-colors"
          />
        </div>

        {/* C. AM / PM Select Dropdown */}
        <div className="relative">
          <select
            value={period}
            onChange={(e) => handleUpdate(date, time, e.target.value as "AM" | "PM")}
            className="w-full border border-[#D9D9DF] rounded-md px-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-bold text-eventrix-black transition-colors cursor-pointer appearance-none"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-eventrix-muted text-xs font-bold">
            ▼
          </div>
        </div>
      </div>

      <p className="text-xs text-eventrix-muted mt-1.5">
        Timezone: India Standard Time (IST / UTC+05:30). Once this deadline passes, registration for all sub-events will automatically close.
      </p>

      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
