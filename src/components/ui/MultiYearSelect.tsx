"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, X, GraduationCap } from "lucide-react";

interface MultiYearSelectProps {
  value: string; // Comma separated e.g. "1st Year, 2nd Year, 3rd Year"
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const YEAR_OPTIONS = [
  { value: "1st Year", label: "1st Year (Freshmen)" },
  { value: "2nd Year", label: "2nd Year (Sophomores)" },
  { value: "3rd Year", label: "3rd Year (Pre-Final)" },
  { value: "4th Year", label: "4th Year (Final Year)" },
  { value: "PG / Other", label: "PG / Research Scholar / Other" },
];

export function MultiYearSelect({
  value = "",
  onChange,
  label,
  placeholder = "Select allowed years or click 'All Years'...",
  disabled = false,
  className = "",
}: MultiYearSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedList = useMemo(() => {
    if (!value || !value.trim()) return [];
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleYear = (yearVal: string) => {
    let nextList: string[];
    if (selectedList.includes(yearVal)) {
      nextList = selectedList.filter((y) => y !== yearVal);
    } else {
      nextList = [...selectedList, yearVal];
    }
    onChange(nextList.join(", "));
  };

  const isAllYearsSelected =
    selectedList.includes("All Years") || selectedList.length === YEAR_OPTIONS.length;

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAllYearsSelected) {
      onChange("");
    } else {
      const all = YEAR_OPTIONS.map((y) => y.value);
      onChange(all.join(", "));
    }
  };

  const removeYear = (e: React.MouseEvent, yearVal: string) => {
    e.preventDefault();
    e.stopPropagation();
    const nextList = selectedList.filter((y) => y !== yearVal);
    onChange(nextList.join(", "));
  };

  return (
    <div ref={containerRef} className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-bold text-eventrix-muted uppercase tracking-widest block">
          {label}
        </label>
      )}

      {/* Main trigger container */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] border border-[#D9D9DF] rounded-md px-3 py-2 bg-[#F8F8FC] cursor-pointer flex items-center justify-between gap-2 transition-colors ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "hover:border-eventrix-lavender focus-within:border-eventrix-lavender focus-within:bg-white"
        }`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedList.length === 0 ? (
            <span className="text-xs text-eventrix-muted font-normal">{placeholder}</span>
          ) : isAllYearsSelected ? (
            <span className="inline-flex items-center gap-1.5 bg-eventrix-lavender/10 text-eventrix-lavender border border-eventrix-lavender/30 text-xs font-bold px-2.5 py-1 rounded-md">
              <GraduationCap className="w-3.5 h-3.5" /> All Years Eligible
            </span>
          ) : (
            selectedList.map((y) => (
              <span
                key={y}
                className="inline-flex items-center gap-1 bg-white border border-[#D9D9DF] shadow-xs text-xs font-semibold text-eventrix-black px-2 py-0.5 rounded-md"
              >
                <span>{y}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeYear(e, y)}
                    className="hover:text-red-500 rounded p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-eventrix-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="relative z-50">
          <div className="absolute left-0 top-1 w-full bg-white border border-[#D9D9DF] rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F0F0F5]">
              <span className="text-xs font-bold text-eventrix-muted uppercase tracking-wider">
                {selectedList.length} Selected
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-eventrix-lavender hover:underline cursor-pointer"
              >
                {isAllYearsSelected ? "Clear Selection" : "Select All Years"}
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-1">
              {YEAR_OPTIONS.map((opt) => {
                const isChecked = selectedList.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleYear(opt.value)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-eventrix-lavender/10 text-eventrix-lavender font-semibold"
                        : "hover:bg-[#F8F8FC] text-eventrix-black"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-eventrix-lavender border-eventrix-lavender text-white"
                            : "border-[#D9D9DF] bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-eventrix-muted bg-gray-100 px-1.5 py-0.5 rounded">
                      {opt.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
