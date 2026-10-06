import React from "react";
import { Calendar, Clock } from "lucide-react";

interface DateTimePickerProps {
  dateName: string;
  timeName: string;
  dateValue: string;
  timeValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export function DateTimePicker({ dateName, timeName, dateValue, timeValue, onChange, required = false }: DateTimePickerProps) {
  return (
    <div className="flex gap-4 w-full">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-eventrix-muted">
          <Calendar className="w-4 h-4" />
        </div>
        <input 
          type="date" 
          name={dateName}
          value={dateValue}
          onChange={onChange}
          required={required}
          className="w-full border border-[#D9D9DF] rounded-md pl-10 pr-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
        />
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-eventrix-muted">
          <Clock className="w-4 h-4" />
        </div>
        <input 
          type="time" 
          name={timeName}
          value={timeValue}
          onChange={onChange}
          required={required}
          className="w-full border border-[#D9D9DF] rounded-md pl-10 pr-4 py-3 bg-[#F8F8FC] focus:outline-none focus:border-eventrix-lavender focus:bg-white text-sm font-medium" 
        />
      </div>
    </div>
  );
}
