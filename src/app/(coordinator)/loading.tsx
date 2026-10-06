import React from "react";

export default function CoordinatorLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4 sm:p-6">
      <div className="h-10 w-56 bg-gray-200 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-md"></div>
        ))}
      </div>
      <div className="h-80 bg-gray-200 rounded-md"></div>
    </div>
  );
}
