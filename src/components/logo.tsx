import React from 'react';

export function EventrixLogo({ className = '', dark = false }: { className?: string, dark?: boolean }) {
  const bgColor = dark ? '#FFFFFF' : '#3C2196';
  const textColor = dark ? '#3C2196' : '#FFFFFF';

  return (
    <svg viewBox="0 0 400 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Outer block shape */}
      <path 
        d="M 10 10 L 380 10 L 390 20 L 390 70 L 290 70 L 280 80 L 10 80 Z" 
        fill={bgColor} 
      />
      {/* Abstract geometric E */}
      <path d="M 20 20 L 60 20 L 60 30 L 30 30 L 30 40 L 50 40 L 50 50 L 30 50 L 30 70 L 20 70 Z" fill={textColor} />
      {/* V */}
      <path d="M 65 20 L 80 70 L 95 70 L 110 20 L 95 20 L 87 50 L 80 20 Z" fill={textColor} />
      {/* E */}
      <path d="M 115 20 L 155 20 L 155 30 L 125 30 L 125 40 L 145 40 L 145 50 L 125 50 L 125 60 L 155 60 L 155 70 L 115 70 Z" fill={textColor} />
      {/* N */}
      <path d="M 160 20 L 175 20 L 195 50 L 195 20 L 210 20 L 210 70 L 195 70 L 175 40 L 175 70 L 160 70 Z" fill={textColor} />
      {/* T */}
      <path d="M 215 20 L 255 20 L 255 30 L 240 30 L 240 70 L 225 70 L 225 30 L 215 30 Z" fill={textColor} />
      {/* R */}
      <path d="M 260 20 L 295 20 Q 305 20 305 35 Q 305 45 295 45 L 305 70 L 290 70 L 282 48 L 275 48 L 275 70 L 260 70 Z M 275 35 L 290 35 Q 295 35 295 30 Q 295 25 290 25 L 275 25 Z" fill={textColor} />
      {/* I */}
      <path d="M 310 20 L 325 20 L 325 70 L 310 70 Z" fill={textColor} />
      {/* X */}
      <path d="M 330 20 L 350 45 L 330 70 L 345 70 L 360 52 L 375 70 L 390 70 L 370 45 L 390 20 L 375 20 L 360 38 L 345 20 Z" fill={textColor} />
      
      {/* Events text below */}
      <text x="290" y="95" fill={bgColor} fontSize="14" fontWeight="bold" letterSpacing="4" fontFamily="sans-serif">EVENTS</text>
    </svg>
  );
}
