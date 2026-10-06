"use client";

import React, { useState, useEffect } from "react";
import { parseISTDeadlineParts, buildISTDeadlineISO } from "@/utils/date-utils";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixTimePicker } from "@/components/ui/EventrixTimePicker";

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

  const handleTimePickerChange = (timeStr: string) => {
    // timeStr comes as "HH:MM AM" or "HH:MM PM" or "HH:MM"
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      const [t, p] = timeStr.split(" ");
      const newPeriod = (p === "PM" ? "PM" : "AM") as "AM" | "PM";
      handleUpdate(date, t, newPeriod);
    } else {
      handleUpdate(date, timeStr, period);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest block">
        Registration Closes At (Deadline)
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* A. Custom Eventrix Date Picker */}
        <div className="sm:col-span-2">
          <EventrixDatePicker
            value={date}
            onChange={(newDate) => handleUpdate(newDate, time, period)}
            placeholder="Select Registration Closing Date"
          />
        </div>

        {/* B. Custom Eventrix Time & AM/PM Picker */}
        <div>
          <EventrixTimePicker
            value={`${time} ${period}`}
            onChange={handleTimePickerChange}
            outputFormat="12h"
            placeholder="Select Time"
          />
        </div>
      </div>

      <p className="text-xs text-eventrix-muted mt-1.5">
        Timezone: India Standard Time (IST / UTC+05:30). Once this deadline passes, registration for all sub-events will automatically close.
      </p>

      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
