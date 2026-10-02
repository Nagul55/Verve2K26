import React from 'react';

interface EventrixLogoProps {
  className?: string;
  fill?: string;
}

export function EventrixLogo({ className = "w-full h-auto", fill }: EventrixLogoProps) {
  // Using the provided user logo from the public directory
  return (
    <img 
      src="/images/logo.png" 
      alt="Eventrix Logo" 
      className={className}
    />
  );
}
