"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search, ShieldCheck, Sparkles } from "lucide-react";

interface SubEventItem {
  id: string;
  title: string;
  category: string;
  participation_type?: string;
  status?: string;
}

interface CoordinatorEventSelectorProps {
  coordinatorId: string;
  coordinatorName: string;
  assignedSubEventIds: string[];
  allSubEvents: SubEventItem[];
  onSave: (coordinatorId: string, selectedIds: string[]) => Promise<void>;
  isPending?: boolean;
}

export function CoordinatorEventSelector({
  coordinatorId,
  coordinatorName,
  assignedSubEventIds = [],
  allSubEvents = [],
  onSave,
  isPending = false,
}: CoordinatorEventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedSubEventIds);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIds(assignedSubEventIds);
  }, [assignedSubEventIds]);

  // Close dropdown on outside click
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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRemoveTag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
    onSave(coordinatorId, updated);
  };

  const handleSelectAll = () => {
    const allIds = filteredEvents.map((e) => e.id);
    const combined = Array.from(new Set([...selectedIds, ...allIds]));
    setSelectedIds(combined);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    await onSave(coordinatorId, selectedIds);
    setIsOpen(false);
  };

  const filteredEvents = allSubEvents.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const assignedEvents = allSubEvents.filter((ev) => selectedIds.includes(ev.id));

  return (
    <div className="relative w-full max-w-sm" ref={dropdownRef}>
      {/* Assigned Events Display / Toggle Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] border border-[#D9D9DF] rounded-md px-3 py-1.5 bg-[#F8F8FC] hover:bg-white hover:border-eventrix-lavender transition-all cursor-pointer flex flex-wrap items-center gap-1.5 justify-between ${
          isOpen ? "border-eventrix-lavender ring-2 ring-eventrix-lavender/20 bg-white" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {assignedEvents.length > 0 ? (
            assignedEvents.map((ev) => (
              <span
                key={ev.id}
                className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-eventrix-lavender/15 text-eventrix-black px-2 py-0.5 rounded border border-eventrix-lavender/30"
              >
                <span className="truncate max-w-[120px]">{ev.title}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(ev.id, e)}
                  className="hover:text-red-600 transition-colors p-0.5"
                  title="Remove event"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-eventrix-muted font-medium italic">
              Unassigned (No event permitted)
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-eventrix-muted transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full sm:w-[320px] right-0 bg-white border border-[#D9D9DF] rounded-md shadow-xl p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header & Controls */}
          <div className="flex items-center justify-between border-b border-[#D9D9DF] pb-2">
            <span className="text-[10px] font-bold text-eventrix-black uppercase tracking-wider">
              Permitted Events ({selectedIds.length} Selected)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] font-bold text-eventrix-lavender hover:underline uppercase"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[10px] font-bold text-red-500 hover:underline uppercase"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-eventrix-muted absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-[#D9D9DF] rounded bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender font-medium"
            />
          </div>

          {/* List of Sub-Events with Checkboxes */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-gray-100">
            {filteredEvents.map((ev) => {
              const isChecked = selectedIds.includes(ev.id);
              return (
                <label
                  key={ev.id}
                  className={`flex items-center justify-between p-2 rounded text-xs font-medium cursor-pointer transition-colors ${
                    isChecked ? "bg-eventrix-lavender/10 text-eventrix-black" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(ev.id)}
                      className="rounded border-gray-300 text-eventrix-lavender focus:ring-eventrix-lavender cursor-pointer"
                    />
                    <span className="truncate font-semibold">{ev.title}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                      ev.category === "Technical"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {ev.category}
                  </span>
                </label>
              );
            })}

            {filteredEvents.length === 0 && (
              <p className="text-xs text-eventrix-muted p-3 text-center">No events found matching search.</p>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 border-t border-[#D9D9DF] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded text-xs font-bold text-eventrix-muted uppercase hover:text-black"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-1.5 bg-eventrix-black text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-eventrix-lavender hover:text-black transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              Save Permitted Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
