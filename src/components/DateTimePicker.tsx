"use client";

import React from "react";
import { EventrixDatePicker } from "@/components/ui/EventrixDatePicker";
import { EventrixTimePicker } from "@/components/ui/EventrixTimePicker";

interface DateTimePickerProps {
  dateName: string;
  timeName: string;
  dateValue: string;
  timeValue: string;
  onChange: (e: any) => void;
  required?: boolean;
}

export function DateTimePicker({
  dateName,
  timeName,
  dateValue,
  timeValue,
  onChange,
  required = false
}: DateTimePickerProps) {
  const handleDateChange = (newDate: string) => {
    onChange({ target: { name: dateName, value: newDate } });
  };

  const handleTimeChange = (newTime: string) => {
    onChange({ target: { name: timeName, value: newTime } });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      <div className="relative">
        <EventrixDatePicker
          value={dateValue}
          onChange={handleDateChange}
          placeholder="Select Date"
        />
        <input type="hidden" name={dateName} value={dateValue} required={required} />
      </div>
      <div className="relative">
        <EventrixTimePicker
          value={timeValue}
          onChange={handleTimeChange}
          outputFormat="24h"
          placeholder="Select Time"
        />
        <input type="hidden" name={timeName} value={timeValue} required={required} />
      </div>
    </div>
  );
}
