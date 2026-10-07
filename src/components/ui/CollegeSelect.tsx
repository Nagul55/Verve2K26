"use client";

import React, { useMemo } from "react";
import { EventrixSelect, SelectOption } from "./EventrixSelect";
import { TAMILNADU_COLLEGES, COLLEGE_SELECT_OPTIONS } from "@/data/colleges";

export interface CollegeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
  buttonClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function CollegeSelect({
  value = "",
  onChange,
  name = "college",
  label,
  placeholder = "Select College / Institution...",
  disabled = false,
  required = false,
  error,
  className = "",
  buttonClassName = "",
  size = "md",
}: CollegeSelectProps) {
  // Add custom college option if existing value isn't in predefined list
  const options: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [...COLLEGE_SELECT_OPTIONS];

    if (value && value.trim() !== "") {
      const match = list.find(
        (opt) => opt.value.toLowerCase() === value.toLowerCase()
      );
      const shortMatch = TAMILNADU_COLLEGES.find(
        (c) => c.shortName && c.shortName.toLowerCase() === value.toLowerCase()
      );

      if (!match && !shortMatch) {
        list.unshift({
          value: value,
          label: value,
          description: "Current / Custom College",
        });
      }
    }
    return list;
  }, [value]);

  const resolvedValue = useMemo(() => {
    if (!value) return "";
    const directMatch = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase());
    if (directMatch) return directMatch.value;

    const shortMatch = TAMILNADU_COLLEGES.find(
      (c) => c.shortName && c.shortName.toLowerCase() === value.toLowerCase()
    );
    if (shortMatch) return shortMatch.name;

    return value;
  }, [value, options]);

  return (
    <div className={className}>
      <EventrixSelect
        name={name}
        label={label}
        value={resolvedValue}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        error={error}
        searchable={true}
        searchPlaceholder="Search Tamil Nadu colleges (e.g. Sona, PSG, CEG, Salem)..."
        size={size}
        buttonClassName={buttonClassName}
      />
    </div>
  );
}
