"use client";

import React from "react";

interface CubeLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "brand" | "monochrome";
  text?: string;
  className?: string;
}

export function CubeLoader({
  size = "md",
  variant = "brand",
  text = "Loading...",
  className = ""
}: CubeLoaderProps) {
  // Size preset mappings
  const sizeMap = {
    sm: "w-20 h-20",
    md: "w-32 h-32",
    lg: "w-44 h-44",
    xl: "w-60 h-60"
  };

  // Color themes
  const isBrand = variant === "brand";
  const colors = isBrand ? {
    top: "#FFFFFF",
    left: "#3C2196",
    right: "#7C3AED",
    stroke: "#A78BFA",
    grid: "#D9D9DF"
  } : {
    top: "#FFFFFF",
    left: "#2A2A2A",
    right: "#707070",
    stroke: "#404040",
    grid: "#CCCCCC"
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 200 180" 
          className="w-full h-full drop-shadow-lg overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            @keyframes cubeSlide1 {
              0%   { transform: translate(0px, 0px); }
              20%  { transform: translate(35px, -20px); }
              40%  { transform: translate(35px, -20px); }
              60%  { transform: translate(35px, -20px); }
              80%  { transform: translate(0px, 0px); }
              100% { transform: translate(0px, 0px); }
            }
            @keyframes cubeSlide2 {
              0%   { transform: translate(0px, 0px); }
              20%  { transform: translate(0px, 0px); }
              40%  { transform: translate(-35px, -20px); }
              60%  { transform: translate(-35px, -20px); }
              80%  { transform: translate(-35px, -20px); }
              100% { transform: translate(0px, 0px); }
            }
            @keyframes cubeSlide3 {
              0%   { transform: translate(0px, 0px); }
              20%  { transform: translate(0px, 0px); }
              40%  { transform: translate(0px, 0px); }
              60%  { transform: translate(35px, 20px); }
              80%  { transform: translate(35px, 20px); }
              100% { transform: translate(0px, 0px); }
            }
            .cube-anim-1 { animation: cubeSlide1 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            .cube-anim-2 { animation: cubeSlide2 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            .cube-anim-3 { animation: cubeSlide3 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
          `}</style>

          {/* 1. Base Wireframe Grid Floor (The 4 isometric slots) */}
          <g stroke={colors.grid} strokeWidth="1.2" fill="none" strokeDasharray="3 3">
            {/* Slot 1: Top-Left */}
            <polygon points="100,20 135,40 100,60 65,40" />
            {/* Slot 2: Top-Right */}
            <polygon points="135,40 170,60 135,80 100,60" />
            {/* Slot 3: Bottom-Left */}
            <polygon points="65,40 100,60 65,80 30,60" />
            {/* Slot 4: Bottom-Right */}
            <polygon points="100,60 135,80 100,100 65,80" />
          </g>

          {/* 2. Isometric Cubes shifting continuously in loop */}
          
          {/* Cube 1 (Top Left) */}
          <g className="cube-anim-1">
            <polygon points="100,20 135,40 100,60 65,40" fill={colors.top} stroke={colors.stroke} strokeWidth="0.8" />
            <polygon points="65,40 100,60 100,90 65,70" fill={colors.left} />
            <polygon points="100,60 135,40 135,70 100,90" fill={colors.right} />
          </g>

          {/* Cube 2 (Bottom Left) */}
          <g className="cube-anim-2">
            <polygon points="65,40 100,60 65,80 30,60" fill={colors.top} stroke={colors.stroke} strokeWidth="0.8" />
            <polygon points="30,60 65,80 65,110 30,90" fill={colors.left} />
            <polygon points="65,80 100,60 100,90 65,110" fill={colors.right} />
          </g>

          {/* Cube 3 (Bottom Right) */}
          <g className="cube-anim-3">
            <polygon points="100,60 135,80 100,100 65,80" fill={colors.top} stroke={colors.stroke} strokeWidth="0.8" />
            <polygon points="65,80 100,100 100,130 65,110" fill={colors.left} />
            <polygon points="100,100 135,80 135,110 100,130" fill={colors.right} />
          </g>
        </svg>
      </div>

      {text && (
        <div className="flex items-center gap-2">
          <p className="font-anton text-xs uppercase tracking-widest text-eventrix-black animate-pulse">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}
