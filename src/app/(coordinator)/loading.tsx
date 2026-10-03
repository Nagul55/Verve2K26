"use client";

import React from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function CoordinatorLoading() {
  return (
    <div className="w-full h-[70vh] flex flex-col items-center justify-center space-y-4">
      <CubeLoader size="lg" variant="brand" text="Loading Coordinator Control Center..." />
    </div>
  );
}
