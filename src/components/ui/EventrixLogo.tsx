import React from 'react';

interface EventrixLogoProps {
  className?: string;
  fill?: string;
}

export function EventrixLogo({ className = "w-full h-auto", fill }: EventrixLogoProps) {
  // Using the provided user logo from the public directory
  return (
    <img 
      src="/assets/Eventrix logo.svg" 
      alt="Eventrix Logo" 
      width={180}
      height={60}
      style={{ width: "auto", height: "auto", maxWidth: "100%" }}
      className={className}
    />
  );
}
