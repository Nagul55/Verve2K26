"use client";

import React, { useMemo } from "react";
import { EventrixSelect, SelectOption } from "./EventrixSelect";
import { TAMILNADU_COLLEGES, COLLEGE_SELECT_OPTIONS, HOST_COLLEGE_NAME } from "@/data/colleges";

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
  onlyHostCollege?: boolean;
  searchable?: boolean;
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
  onlyHostCollege = true,
  searchable,
}: CollegeSelectProps) {
  // If onlyHostCollege is true, only "Sona College of Technology, Salem" is displayed
  const options: SelectOption[] = useMemo(() => {
    if (onlyHostCollege) {
      return [
        {
          value: HOST_COLLEGE_NAME,
          label: HOST_COLLEGE_NAME,
          description: "Salem • Sona",
        },
      ];
    }

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
  }, [value, onlyHostCollege]);

  const resolvedValue = useMemo(() => {
    if (!value) return "";
    const directMatch = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase());
    if (directMatch) return directMatch.value;

    const shortMatch = TAMILNADU_COLLEGES.find(
      (c) => c.shortName && c.shortName.toLowerCase() === value.toLowerCase()
    );
    if (shortMatch) {
      if (onlyHostCollege && !shortMatch.name.toLowerCase().includes("sona college of technology")) {
        return "";
      }
      return shortMatch.name;
    }

    return onlyHostCollege ? HOST_COLLEGE_NAME : value;
  }, [value, options, onlyHostCollege]);

  const isSearchable = searchable !== undefined ? searchable : !onlyHostCollege;

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
        searchable={isSearchable}
        searchPlaceholder={onlyHostCollege ? "Search college..." : "Search Tamil Nadu colleges (e.g. Sona, PSG, CEG, Salem)..."}
        size={size}
        buttonClassName={buttonClassName}
      />
    </div>
  );
}
