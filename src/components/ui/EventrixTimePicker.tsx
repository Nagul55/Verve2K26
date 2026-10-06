"use client";

import React, { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface EventrixTimePickerProps {
  value: string; // e.g. "09:30", "14:00", "09:30 AM"
  onChange: (timeStr: string) => void;
  placeholder?: string;
  className?: string;
  outputFormat?: "12h" | "24h" | "timeOnly"; // 12h: "09:30 AM", 24h: "14:30", timeOnly: "09:30"
  error?: string;
}

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

export function EventrixTimePicker({
  value,
  onChange,
  placeholder = "Select Time",
  className = "",
  outputFormat = "timeOnly",
  error
}: EventrixTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse input string
  const parseTimeString = (val: string) => {
    let hour = "09";
    let minute = "30";
    let period: "AM" | "PM" = "AM";

    if (val) {
      if (val.includes("AM") || val.includes("PM")) {
        const [t, p] = val.trim().split(" ");
        if (p === "AM" || p === "PM") period = p;
        if (t) {
          const parts = t.split(":");
          if (parts.length >= 2) {
            hour = parts[0].padStart(2, "0");
            minute = parts[1].padStart(2, "0");
          }
        }
      } else {
        const parts = val.trim().split(":");
        if (parts.length >= 2) {
          let h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h)) {
            if (h >= 12) {
              period = "PM";
              if (h > 12) h -= 12;
            } else {
              period = "AM";
              if (h === 0) h = 12;
            }
            hour = h.toString().padStart(2, "0");
          }
          if (!isNaN(m)) {
            minute = (Math.round(m / 5) * 5 % 60).toString().padStart(2, "0");
          }
        }
      }
    }

    return { hour, minute, period };
  };

  const parsed = parseTimeString(value);
  const [selectedHour, setSelectedHour] = useState(parsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(parsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(parsed.period);

  useEffect(() => {
    if (value) {
      const p = parseTimeString(value);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
      setSelectedPeriod(p.period);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const emitChange = (h: string, m: string, p: "AM" | "PM") => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);

    if (outputFormat === "12h") {
      onChange(`${h}:${m} ${p}`);
    } else if (outputFormat === "24h") {
      let hrs = parseInt(h, 10);
      if (p === "PM" && hrs < 12) hrs += 12;
      if (p === "AM" && hrs === 12) hrs = 0;
      const formatted24 = `${hrs.toString().padStart(2, "0")}:${m}`;
      onChange(formatted24);
    } else {
      // timeOnly format HH:MM in 12-hour view
      onChange(`${h}:${m}`);
    }
  };

  const displayString = value
    ? `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    : "";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-[#D9D9DF] rounded-md px-3.5 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium text-eventrix-black transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-eventrix-lavender shrink-0" />
          <span className={displayString ? "text-eventrix-black font-semibold" : "text-eventrix-muted"}>
            {displayString || placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-eventrix-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-[#D9D9DF] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0F0F5]">
            <span className="text-xs font-bold text-eventrix-black uppercase tracking-wider">Select Time</span>
            <div className="flex border border-[#D9D9DF] rounded-md overflow-hidden bg-[#F8F8FC]">
              <button
                type="button"
                onClick={() => emitChange(selectedHour, selectedMinute, "AM")}
                className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                  selectedPeriod === "AM" ? "bg-[#080A12] text-white" : "text-eventrix-black hover:bg-gray-200"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => emitChange(selectedHour, selectedMinute, "PM")}
                className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                  selectedPeriod === "PM" ? "bg-[#080A12] text-white" : "text-eventrix-black hover:bg-gray-200"
                }`}
              >
                PM
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Hours Column */}
            <div>
              <span className="block text-[10px] font-bold text-eventrix-muted uppercase tracking-widest mb-1.5 text-center">Hour</span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-[#F0F0F5] rounded-md p-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => emitChange(h, selectedMinute, selectedPeriod)}
                    className={`w-full py-1 text-xs font-semibold rounded transition-colors ${
                      selectedHour === h
                        ? "bg-[#080A12] text-white"
                        : "hover:bg-[#F8F8FC] text-eventrix-black"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <span className="block text-[10px] font-bold text-eventrix-muted uppercase tracking-widest mb-1.5 text-center">Minute</span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-[#F0F0F5] rounded-md p-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => emitChange(selectedHour, m, selectedPeriod)}
                    className={`w-full py-1 text-xs font-semibold rounded transition-colors ${
                      selectedMinute === m
                        ? "bg-[#080A12] text-white"
                        : "hover:bg-[#F8F8FC] text-eventrix-black"
                    }`}
                  >
                    :{m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
