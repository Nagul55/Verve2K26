"use client";

import React, { useId } from "react";

export interface EventrixTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode | string;
  helperText?: string;
  error?: string;
  minHeight?: string;
  className?: string;
  textareaClassName?: string;
}

export function EventrixTextarea({
  label,
  helperText,
  error,
  minHeight = "240px",
  className = "",
  textareaClassName = "",
  rows = 8,
  disabled = false,
  required = false,
  placeholder,
  value,
  onChange,
  name,
  ...props
}: EventrixTextareaProps) {
  const textareaId = useId();

  return (
    <div className={`space-y-1.5 w-full text-left font-sans ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-extrabold text-eventrix-black uppercase tracking-wider block flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          style={{ minHeight }}
          className={`w-full bg-white border border-[#D9D9DF] rounded-xl p-4 text-sm font-medium text-eventrix-black placeholder-eventrix-muted leading-relaxed transition-all duration-200 outline-none resize-y custom-scrollbar ${
            error
              ? "border-red-500 ring-2 ring-red-500/20"
              : "focus:border-eventrix-lavender focus:ring-2 focus:ring-eventrix-lavender/30 focus:bg-white"
          } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : "hover:border-eventrix-lavender/70"} ${textareaClassName}`}
          {...props}
        />
      </div>

      {(helperText || error) && (
        <p className={`text-[11px] font-medium leading-normal ${error ? "text-red-500 font-semibold" : "text-eventrix-muted"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
