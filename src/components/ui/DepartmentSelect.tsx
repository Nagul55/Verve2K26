"use client";

import React, { useMemo } from "react";
import { EventrixSelect, SelectOption } from "./EventrixSelect";
import { DEPARTMENTS, DEPARTMENT_SELECT_OPTIONS } from "@/data/departments";

export interface DepartmentSelectProps {
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
  allowCustom?: boolean;
}

export function DepartmentSelect({
  value = "",
  onChange,
  name = "department",
  label,
  placeholder = "Select Department...",
  disabled = false,
  required = false,
  error,
  className = "",
  buttonClassName = "",
  size = "md",
}: DepartmentSelectProps) {
  // Normalize matching: check if value matches full value or short code
  const options: SelectOption[] = useMemo(() => {
    const list: SelectOption[] = [...DEPARTMENT_SELECT_OPTIONS];
    
    if (value && value.trim() !== "") {
      const match = list.find(
        (opt) =>
          opt.value.toLowerCase() === value.toLowerCase() ||
          opt.label.toLowerCase() === value.toLowerCase()
      );
      
      const codeMatch = DEPARTMENTS.find(
        (d) => d.code.toLowerCase() === value.toLowerCase()
      );

      if (!match && !codeMatch) {
        // Prepend custom existing department
        list.unshift({
          value: value,
          label: value,
          description: "Current / Custom Department",
        });
      }
    }
    return list;
  }, [value]);

  // If value is a code like "IT", find canonical value
  const resolvedValue = useMemo(() => {
    if (!value) return "";
    const directMatch = options.find((opt) => opt.value.toLowerCase() === value.toLowerCase());
    if (directMatch) return directMatch.value;

    const codeMatch = DEPARTMENTS.find((d) => d.code.toLowerCase() === value.toLowerCase());
    if (codeMatch) return codeMatch.value;

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
        searchPlaceholder="Search departments (e.g. IT, CSE, AI)..."
        size={size}
        buttonClassName={buttonClassName}
      />
    </div>
  );
}
