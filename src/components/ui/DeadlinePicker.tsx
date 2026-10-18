"use client";

import React, { useState, useEffect } from "react";
import { parseISTDeadlineParts, buildISTDeadlineISO, formatDeadlineDisplay } from "@/lib/utils/date-utils";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixTimePicker } from "@/components/ui/EventrixTimePicker";
import { Clock, CheckCircle } from "lucide-react";

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
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      const [t, p] = timeStr.split(" ");
      const newPeriod = (p === "PM" ? "PM" : "AM") as "AM" | "PM";
      handleUpdate(date, t, newPeriod);
    } else {
      handleUpdate(date, timeStr, period);
    }
  };

  const handlePresetTime = (presetTime: string, presetPeriod: "AM" | "PM") => {
    handleUpdate(date || new Date().toISOString().slice(0, 10), presetTime, presetPeriod);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest block">
          Registration Closes At (Deadline)
        </label>
        <span className="text-[11px] font-semibold text-eventrix-muted">
          IST (UTC+05:30)
        </span>
      </div>
      
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

      {/* Quick Time Presets */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-bold text-eventrix-muted uppercase tracking-wider mr-1">
          Quick Time:
        </span>
        <button
          type="button"
          onClick={() => handlePresetTime("11:59", "PM")}
          className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
            time === "11:59" && period === "PM"
              ? "bg-[#080A12] text-white border-[#080A12]"
              : "bg-[#F8F8FC] text-eventrix-black border-[#D9D9DF] hover:bg-gray-100"
          }`}
        >
          End of Day (11:59 PM)
        </button>
        <button
          type="button"
          onClick={() => handlePresetTime("12:00", "AM")}
          className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
            time === "12:00" && period === "AM"
              ? "bg-[#080A12] text-white border-[#080A12]"
              : "bg-[#F8F8FC] text-eventrix-black border-[#D9D9DF] hover:bg-gray-100"
          }`}
        >
          Midnight (12:00 AM)
        </button>
        <button
          type="button"
          onClick={() => handlePresetTime("11:00", "PM")}
          className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
            time === "11:00" && period === "PM"
              ? "bg-[#080A12] text-white border-[#080A12]"
              : "bg-[#F8F8FC] text-eventrix-black border-[#D9D9DF] hover:bg-gray-100"
          }`}
        >
          11:00 PM
        </button>
        <button
          type="button"
          onClick={() => handlePresetTime("09:00", "AM")}
          className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
            time === "09:00" && period === "AM"
              ? "bg-[#080A12] text-white border-[#080A12]"
              : "bg-[#F8F8FC] text-eventrix-black border-[#D9D9DF] hover:bg-gray-100"
          }`}
        >
          09:00 AM
        </button>
      </div>

      {/* Selected Deadline Confirmation Preview */}
      {value ? (
        <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-900">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Registration closes on:</span>
          <span className="font-bold text-emerald-950 font-mono">
            {formatDeadlineDisplay(value)}
          </span>
          <span className="text-[11px] text-emerald-700">
            {period === "AM" && (time === "12:00" || time === "00:00") ? "(Midnight / Start of Day)" : (period === "PM" && time === "11:59" ? "(End of Day)" : "")}
          </span>
        </div>
      ) : (
        <p className="text-xs text-eventrix-muted mt-1.5 flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-eventrix-lavender" />
          Timezone: India Standard Time (IST / UTC+05:30). Once this deadline passes, registration for all sub-events will automatically close.
        </p>
      )}

      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
