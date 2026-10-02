import React from "react";

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-eventrix-light-lavender flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-eventrix-lavender stroke-[1.5]">
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M4.9 19.1l14.2-14.2" />
        </svg>
      </div>
      <h1 className="font-anton text-[40px] text-eventrix-black mb-4 uppercase tracking-wide leading-none">{title}</h1>
      <p className="text-eventrix-muted text-sm max-w-md mx-auto">
        This section is currently under construction. Please check back later when we roll out the next update.
      </p>
    </div>
  );
}
