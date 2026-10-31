import React from 'react';

export function RitualIcon({ size = 38, color = "#D4B675", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sacred lotus with diya flame */}
      <path
        d="M24 6C24 6 20.5 13 20.5 17C20.5 19.5 22 21 24 21C26 21 27.5 19.5 27.5 17C27.5 13 24 6 24 6Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 11C24 11 22.5 14 22.5 16C22.5 17 23.2 17.8 24 17.8C24.8 17.8 25.5 17 25.5 16C25.5 14 24 11 24 11Z"
        fill={color}
        fillOpacity="0.4"
      />
      <path
        d="M24 23C19 23 11 26 10 32C9 37 13 40 24 40C35 40 39 37 38 32C37 26 29 23 24 23Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17 28C17 28 12 30.5 13 34C14 36.5 18 37 24 37C30 37 34 36.5 35 34C36 30.5 31 28 31 28"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      <path
        d="M16 42H32"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GuidanceIcon({ size = 38, color = "#D4B675", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 8-spoke Dharma Wheel of Guidance */}
      <circle cx="24" cy="24" r="17" stroke={color} strokeWidth="1.8" />
      <circle cx="24" cy="24" r="5" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.2" />
      <circle cx="24" cy="24" r="2" fill={color} />
      {/* 8 Spokes */}
      <line x1="24" y1="7" x2="24" y2="19" stroke={color} strokeWidth="1.6" />
      <line x1="24" y1="29" x2="24" y2="41" stroke={color} strokeWidth="1.6" />
      <line x1="7" y1="24" x2="19" y2="24" stroke={color} strokeWidth="1.6" />
      <line x1="29" y1="24" x2="41" y2="24" stroke={color} strokeWidth="1.6" />
      <line x1="12" y1="12" x2="20.5" y2="20.5" stroke={color} strokeWidth="1.6" />
      <line x1="27.5" y1="27.5" x2="36" y2="36" stroke={color} strokeWidth="1.6" />
      <line x1="36" y1="12" x2="27.5" y2="20.5" stroke={color} strokeWidth="1.6" />
      <line x1="20.5" y1="27.5" x2="12" y2="36" stroke={color} strokeWidth="1.6" />
      {/* Outer small nubs */}
      <circle cx="24" cy="5" r="1.5" fill={color} />
      <circle cx="24" cy="43" r="1.5" fill={color} />
      <circle cx="5" cy="24" r="1.5" fill={color} />
      <circle cx="43" cy="24" r="1.5" fill={color} />
    </svg>
  );
}

export function FamilyIcon({ size = 38, color = "#D4B675", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Personal / Family sacred icon */}
      {/* Central primary person */}
      <circle cx="24" cy="14" r="5" stroke={color} strokeWidth="1.8" />
      <path
        d="M16 35C16 28 19.5 24 24 24C28.5 24 32 28 32 35"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Left side companion */}
      <circle cx="13" cy="18" r="3.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M7 36C7 31 10 27.5 14 27"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Right side companion */}
      <circle cx="35" cy="18" r="3.5" stroke={color} strokeWidth="1.5" />
      <path
        d="M34 27C38 27.5 41 31 41 36"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Base line */}
      <line x1="8" y1="40" x2="40" y2="40" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
