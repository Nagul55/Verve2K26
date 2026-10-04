"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface EventrixSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dark" | "pill";
}

export function EventrixSelect({
  label,
  placeholder = "Select an option...",
  value: controlledValue,
  defaultValue = "",
  onChange,
  options = [],
  name,
  disabled = false,
  required = false,
  error,
  helperText,
  loading = false,
  loadingText = "Loading options...",
  emptyText = "No options available",
  searchable = false,
  searchPlaceholder = "Search options...",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  size = "md",
  variant = "default",
}: EventrixSelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Selected Option Object
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  // Filter options if searchable
  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) return;
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const targetOpt = filteredOptions[highlightedIndex];
        if (!targetOpt.disabled) {
          handleSelect(targetOpt.value);
        }
      }
    }
  };

  // Size styling classes
  const sizeClasses = {
    sm: "py-2 px-3 text-xs rounded-lg min-h-[36px]",
    md: "py-2.5 px-3.5 text-xs sm:text-sm rounded-xl min-h-[44px]",
    lg: "py-3.5 px-4 text-sm sm:text-base rounded-xl min-h-[50px]",
  }[size];

  // Variant classes
  const variantClasses = {
    default:
      "bg-white border-[#D9D9DF] hover:border-eventrix-lavender text-eventrix-black focus-within:ring-2 focus-within:ring-eventrix-lavender/30 focus-within:border-eventrix-lavender",
    dark:
      "bg-[#0D0F1D] border-gray-800 text-white hover:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30",
    pill:
      "bg-[#F8F8FC] border-[#D9D9DF] hover:bg-white rounded-full text-eventrix-black focus-within:ring-2 focus-within:ring-eventrix-lavender/30",
  }[variant];

  return (
    <div className={`relative w-full text-left font-sans ${className}`} ref={containerRef}>
      {/* Hidden input for HTML form submissions */}
      {name && <input type="hidden" name={name} value={selectedValue || ""} />}

      {/* Label */}
      {label && (
        <label className="text-xs font-extrabold text-eventrix-black uppercase tracking-wider block mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Select Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className={`w-full flex items-center justify-between gap-2 border font-bold transition-all duration-200 outline-none select-none ${sizeClasses} ${variantClasses} ${
          error ? "border-red-500 ring-2 ring-red-500/20" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "cursor-pointer"} ${buttonClassName}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          {selectedOption ? (
            <span className="truncate">{selectedOption.label}</span>
          ) : (
            <span className="text-eventrix-muted font-normal truncate">{placeholder}</span>
          )}
        </span>

        <span className="shrink-0 flex items-center justify-center text-eventrix-muted transition-transform duration-200">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-eventrix-lavender" />
          ) : (
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-eventrix-black" : ""}`}
            />
          )}
        </span>
      </button>

      {/* Helper text / Error message */}
      {(error || helperText) && (
        <p className={`text-[11px] font-medium mt-1 ${error ? "text-red-500" : "text-eventrix-muted"}`}>
          {error || helperText}
        </p>
      )}

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-[#D9D9DF] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 flex flex-col ${dropdownClassName}`}
        >
          {/* Search Box if Searchable */}
          {searchable && (
            <div className="p-2 border-b border-[#D9D9DF] bg-[#F8F8FC] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-eventrix-muted absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-white text-eventrix-black text-xs font-semibold pl-8 pr-3 py-1.5 rounded-lg border border-[#D9D9DF] focus:outline-none focus:border-eventrix-lavender focus:ring-1 focus:ring-eventrix-lavender"
                />
              </div>
            </div>
          )}

          {/* Options Container */}
          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {loading ? (
              <div className="px-3 py-4 text-center text-xs font-semibold text-eventrix-muted flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-eventrix-lavender" />
                {loadingText}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-semibold text-eventrix-muted">
                {searchQuery ? "No matching options" : emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === selectedValue;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value, opt.disabled)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-start justify-between gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed bg-transparent"
                        : isSelected
                        ? "bg-eventrix-lavender/15 text-eventrix-black font-bold"
                        : isHighlighted
                        ? "bg-[#F8F8FC] text-eventrix-black"
                        : "text-eventrix-black hover:bg-[#F8F8FC]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {opt.icon && <span className="mt-0.5 shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <p className="truncate leading-tight">{opt.label}</p>
                        {opt.description && (
                          <p className="text-[11px] font-normal text-eventrix-muted truncate mt-0.5">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-eventrix-lavender shrink-0 mt-0.5 font-extrabold" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// MULTI-SELECT DROPDOWN COMPONENT
export interface EventrixMultiSelectProps {
  label?: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  name?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  maxDisplayChips?: number;
}

export function EventrixMultiSelect({
  label,
  placeholder = "Select multiple options...",
  values = [],
  onChange,
  options = [],
  name,
  disabled = false,
  required = false,
  error,
  helperText,
  searchable = true,
  searchPlaceholder = "Search options...",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  maxDisplayChips = 2,
}: EventrixMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  const filteredOptions = searchable
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const toggleValue = (val: string, optionDisabled?: boolean) => {
    if (disabled || optionDisabled) return;
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`relative w-full text-left font-sans ${className}`} ref={containerRef}>
      {name && <input type="hidden" name={name} value={values.join(",")} />}

      {label && (
        <label className="text-xs font-extrabold text-eventrix-black uppercase tracking-wider block mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* MultiSelect Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[44px] py-2 px-3.5 flex items-center justify-between gap-2 bg-white border border-[#D9D9DF] hover:border-eventrix-lavender rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 outline-none ${
          error ? "border-red-500 ring-2 ring-red-500/20" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "cursor-pointer"} ${buttonClassName}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-eventrix-muted font-normal truncate">{placeholder}</span>
          ) : (
            selectedOptions.slice(0, maxDisplayChips).map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 bg-eventrix-lavender/20 text-eventrix-black text-[11px] font-bold px-2 py-0.5 rounded-md border border-eventrix-lavender/30"
              >
                {opt.label}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleValue(opt.value);
                  }}
                  className="hover:text-red-600 cursor-pointer font-extrabold text-xs ml-0.5"
                >
                  ×
                </span>
              </span>
            ))
          )}

          {selectedOptions.length > maxDisplayChips && (
            <span className="text-[11px] font-extrabold bg-gray-100 text-eventrix-black px-2 py-0.5 rounded-md border border-gray-300">
              +{selectedOptions.length - maxDisplayChips} more
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-eventrix-muted shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-eventrix-black" : ""
          }`}
        />
      </button>

      {(error || helperText) && (
        <p className={`text-[11px] font-medium mt-1 ${error ? "text-red-500" : "text-eventrix-muted"}`}>
          {error || helperText}
        </p>
      )}

      {/* Floating MultiSelect Panel */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white border border-[#D9D9DF] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 max-h-64 flex flex-col ${dropdownClassName}`}
        >
          {searchable && (
            <div className="p-2 border-b border-[#D9D9DF] bg-[#F8F8FC] sticky top-0 z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-eventrix-muted absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-white text-eventrix-black text-xs font-semibold pl-8 pr-3 py-1.5 rounded-lg border border-[#D9D9DF] focus:outline-none focus:border-eventrix-lavender"
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-semibold text-eventrix-muted">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);

                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleValue(opt.value, opt.disabled)}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-eventrix-lavender/15 text-eventrix-black"
                        : "hover:bg-[#F8F8FC] text-eventrix-black"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-eventrix-lavender border-eventrix-lavender text-eventrix-black"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-tight">{opt.label}</p>
                      {opt.description && (
                        <p className="text-[11px] font-normal text-eventrix-muted truncate mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
