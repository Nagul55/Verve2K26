"use client";

import React from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-eventrix-bg bg-opacity-95 backdrop-blur-sm">
      <CubeLoader size="xl" variant="brand" text="Loading Eventrix..." />
    </div>
  );
}
