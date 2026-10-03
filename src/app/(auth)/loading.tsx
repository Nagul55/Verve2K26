"use client";

import React from "react";
import { CubeLoader } from "@/components/ui/CubeLoader";

export default function AuthLoading() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#080A12] text-white">
      <CubeLoader size="xl" variant="brand" text="Authenticating Session..." />
    </div>
  );
}
