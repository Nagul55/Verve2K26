import React from "react";

export default function StudentLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="h-12 w-72 bg-gray-200 rounded-md"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-md"></div>
        ))}
      </div>
    </div>
  );
}
