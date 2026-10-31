import React from 'react';

export default function LotusLogo({ size = 32, color = "#D4B675", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bogar Lotus Emblem"
    >
      {/* Central sacred lotus petal */}
      <path
        d="M24 6C24 6 20 16 20 25C20 29.5 21.8 33 24 35C26.2 33 28 29.5 28 25C28 16 24 6 24 6Z"
        fill={color}
        fillOpacity="0.95"
      />
      {/* Inner left petal */}
      <path
        d="M21 13C21 13 14 19 14 27C14 31 16.5 34 20 35.5C18.5 32 18.5 26.5 21 13Z"
        fill={color}
        fillOpacity="0.8"
      />
      {/* Inner right petal */}
      <path
        d="M27 13C27 13 34 19 34 27C34 31 31.5 34 28 35.5C29.5 32 29.5 26.5 27 13Z"
        fill={color}
        fillOpacity="0.8"
      />
      {/* Outer left petal */}
      <path
        d="M17 20C17 20 8 24 8 31C8 35 11.5 37.5 16 37C14 34.5 14.5 29 17 20Z"
        fill={color}
        fillOpacity="0.65"
      />
      {/* Outer right petal */}
      <path
        d="M31 20C31 20 40 24 40 31C40 35 36.5 37.5 32 37C34 34.5 33.5 29 31 20Z"
        fill={color}
        fillOpacity="0.65"
      />
      {/* Base lotus pedestal */}
      <path
        d="M13 38C17 40.5 24 41.5 24 41.5C24 41.5 31 40.5 35 38C32 40 27 42 24 42C21 42 16 40 13 38Z"
        fill={color}
      />
      <circle cx="24" cy="38" r="1.5" fill={color} />
    </svg>
  );
}
