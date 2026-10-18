"use client";

import React from "react";
import Image from "next/image";

interface TeamAvatarProps {
  name?: string;
  className?: string;
  size?: number;
}

export function TeamAvatar({
  name = "Team Squad",
  className = "w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md",
  size = 48,
}: TeamAvatarProps) {
  return (
    <img
      src="/assets/team-avatar.svg"
      alt={`${name} Profile`}
      width={size}
      height={size}
      className={className}
      loading="lazy"
    />
  );
}
