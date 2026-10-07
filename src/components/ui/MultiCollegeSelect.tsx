"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, X, Search, Building2 } from "lucide-react";
import { TAMILNADU_COLLEGES } from "@/data/colleges";

interface MultiCollegeSelectProps {
  value: string; // Comma separated e.g. "Sona College of Technology, Salem, PSG College of Technology, Coimbatore"
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiCollegeSelect({
  value = "",
  onChange,
  label,
  placeholder = "Select allowed colleges or click 'All Colleges'...",
  disabled = false,
  className = "",
}: MultiCollegeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
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

  const toggleCollege = (collegeName: string) => {
    let nextList: string[];
    if (selectedList.includes(collegeName)) {
      nextList = selectedList.filter((c) => c !== collegeName);
    } else {
      nextList = [...selectedList, collegeName];
    }
    onChange(nextList.join(", "));
  };

  const isAllCollegesSelected =
    selectedList.includes("All Colleges") ||
    selectedList.includes("All Engineering Colleges") ||
    selectedList.length === TAMILNADU_COLLEGES.length;

  const handleSelectAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAllCollegesSelected) {
      onChange("");
    } else {
      onChange("All Engineering Colleges, All Colleges");
    }
  };

  const removeCollege = (e: React.MouseEvent, collegeName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const nextList = selectedList.filter((c) => c !== collegeName);
    onChange(nextList.join(", "));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TAMILNADU_COLLEGES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.shortName && c.shortName.toLowerCase().includes(q)) ||
        c.city.toLowerCase().includes(q)
    );
  }, [search]);

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
          ) : isAllCollegesSelected ? (
            <span className="inline-flex items-center gap-1.5 bg-eventrix-lavender/10 text-eventrix-lavender border border-eventrix-lavender/30 text-xs font-bold px-2.5 py-1 rounded-md">
              <Building2 className="w-3.5 h-3.5" /> All Colleges (Open to All Institutions)
            </span>
          ) : (
            selectedList.map((col) => {
              const matched = TAMILNADU_COLLEGES.find((c) => c.name === col);
              const displayLabel = matched && matched.shortName ? `${matched.shortName} (${matched.city})` : col;
              return (
                <span
                  key={col}
                  className="inline-flex items-center gap-1 bg-white border border-[#D9D9DF] shadow-xs text-xs font-semibold text-eventrix-black px-2 py-0.5 rounded-md max-w-[260px] truncate"
                  title={col}
                >
                  <span className="truncate">{displayLabel}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => removeCollege(e, col)}
                      className="hover:text-red-500 rounded p-0.5 cursor-pointer shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              );
            })
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
                {isAllCollegesSelected ? "Clear Selection" : "Allow All Colleges (Open to All)"}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-eventrix-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Tamil Nadu colleges (e.g. Sona, PSG, CEG, Salem)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8F8FC] border border-[#D9D9DF] rounded-lg focus:outline-none focus:border-eventrix-lavender focus:bg-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Colleges Options List */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {filtered.map((college) => {
                const isChecked = selectedList.includes(college.name);
                return (
                  <div
                    key={college.name}
                    onClick={() => toggleCollege(college.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-eventrix-lavender/10 text-eventrix-lavender font-semibold"
                        : "hover:bg-[#F8F8FC] text-eventrix-black"
                    }`}
                  >
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-eventrix-lavender border-eventrix-lavender text-white"
                            : "border-[#D9D9DF] bg-white"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{college.name}</span>
                    </div>
                    <span className="text-[10px] font-bold text-eventrix-muted bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                      {college.city}
                    </span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-4 text-center text-xs text-eventrix-muted">
                  No colleges found matching &quot;{search}&quot;
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
