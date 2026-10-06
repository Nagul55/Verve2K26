"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface EventrixDatePickerProps {
  value: string; // ISO date YYYY-MM-DD or DD-MM-YYYY
  onChange: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function EventrixDatePicker({
  value,
  onChange,
  placeholder = "Select Date (DD-MM-YYYY)",
  className = "",
  error
}: EventrixDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date value into Date object or default to current date
  const parseValueToDate = (val: string): Date => {
    if (!val) return new Date();
    // Check if DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
      const [d, m, y] = val.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    // Check if YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const selectedDate = value ? parseValueToDate(value) : null;
  const [currentMonth, setCurrentMonth] = useState<number>(selectedDate ? selectedDate.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());

  useEffect(() => {
    if (value) {
      const d = parseValueToDate(value);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    // Standard YYYY-MM-DD format output
    const formatted = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Calculate days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  // Display text in input button
  const displayFormatted = selectedDate
    ? `${selectedDate.getDate().toString().padStart(2, "0")}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}-${selectedDate.getFullYear()}`
    : "";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-[#D9D9DF] rounded-md px-3.5 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium text-eventrix-black transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <CalendarIcon className="w-4 h-4 text-eventrix-lavender shrink-0" />
          <span className={displayFormatted ? "text-eventrix-black font-semibold" : "text-eventrix-muted"}>
            {displayFormatted || placeholder}
          </span>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-eventrix-muted hover:text-black shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 w-72 bg-white border border-[#D9D9DF] rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0F0F5]">
            <h4 className="font-bold text-sm text-eventrix-black">
              {MONTHS[currentMonth]} {currentYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-[#F8F8FC] rounded-md text-eventrix-black transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-[#F8F8FC] rounded-md text-eventrix-black transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[11px] font-bold text-eventrix-muted uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank padding cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const sel = isSelected(dayNum);
              const tod = isToday(dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${
                    sel
                      ? "bg-[#080A12] text-white shadow-md scale-105"
                      : tod
                      ? "bg-[#A98BFF]/20 text-[#080A12] border border-[#A98BFF] font-bold"
                      : "hover:bg-[#F8F8FC] text-eventrix-black"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
