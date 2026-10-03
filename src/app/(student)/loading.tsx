"use client";

import React from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function Loading() {
  return (
    <div className="w-full h-[65vh] flex flex-col items-center justify-center space-y-4">
      <CubeLoader size="lg" variant="brand" text="Preparing Eventrix Experience..." />
    </div>
  );
}
