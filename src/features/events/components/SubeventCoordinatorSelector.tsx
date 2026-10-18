"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Users, X } from "lucide-react";

interface CoordinatorItem {
  id: string;
  fullName: string;
  email: string;
}

interface SubeventCoordinatorSelectorProps {
  subEventId: string;
  coordinators: CoordinatorItem[];
  selectedCoordinatorIds: string[];
  onChange: (subEventId: string, selectedIds: string[]) => void;
}

export function SubeventCoordinatorSelector({
  subEventId,
  coordinators = [],
  selectedCoordinatorIds = [],
  onChange,
}: SubeventCoordinatorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelect = (id: string) => {
    const updated = selectedCoordinatorIds.includes(id)
      ? selectedCoordinatorIds.filter((item) => item !== id)
      : [...selectedCoordinatorIds, id];
    onChange(subEventId, updated);
  };

  const handleRemoveTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedCoordinatorIds.filter((item) => item !== id);
    onChange(subEventId, updated);
  };

  const filteredCoordinators = coordinators.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedCoords = coordinators.filter((c) => selectedCoordinatorIds.includes(c.id));

  return (
    <div className="relative w-full max-w-xs" ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[38px] border border-[#D9D9DF] rounded px-3 py-1 bg-[#F8F8FC] hover:bg-white hover:border-eventrix-lavender transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
          isOpen ? "border-eventrix-lavender ring-2 ring-eventrix-lavender/20 bg-white" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {assignedCoords.length > 0 ? (
            assignedCoords.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded border border-purple-200"
              >
                <span className="truncate max-w-[100px]">{c.fullName}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(c.id, e)}
                  className="hover:text-red-600 transition-colors p-0.5"
                  title="Remove coordinator"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-amber-700 font-bold italic">
              Unassigned (Select Coordinator)
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-eventrix-muted transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[280px] right-0 bg-white border border-[#D9D9DF] rounded-md shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-[#D9D9DF] pb-1.5">
            <span className="text-[10px] font-bold text-eventrix-black uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-eventrix-lavender" /> Select Coordinators ({selectedCoordinatorIds.length})
            </span>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-eventrix-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coordinator..."
              className="w-full text-xs pl-7 pr-3 py-1 border border-[#D9D9DF] rounded bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender font-medium"
            />
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
            {filteredCoordinators.map((c) => {
              const isChecked = selectedCoordinatorIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                    isChecked ? "bg-purple-50 font-bold text-purple-900" : "hover:bg-gray-50 text-gray-700 font-medium"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelect(c.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="truncate">
                    <p className="leading-tight">{c.fullName}</p>
                    <p className="text-[9px] text-gray-400 font-normal truncate">{c.email}</p>
                  </div>
                </label>
              );
            })}

            {filteredCoordinators.length === 0 && (
              <p className="text-xs text-eventrix-muted p-2 text-center">No coordinators found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
