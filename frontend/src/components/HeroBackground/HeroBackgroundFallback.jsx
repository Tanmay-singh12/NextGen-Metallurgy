import React from "react";

// Static, no-animation version of the PSP triangle. Used for:
//  - prefers-reduced-motion
//  - while the 3D chunk is still downloading (avoids a layout flash)
//  - browsers without WebGL
// Pure inline SVG, so it costs nothing extra to fetch.
export default function HeroBackgroundFallback() {
  return (
    <svg
      className="hero-bg-fallback"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="metalEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c7d2da" />
          <stop offset="45%" stopColor="#7e8d99" />
          <stop offset="100%" stopColor="#424d57" />
        </linearGradient>
        <radialGradient id="metalNode" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e4ecf1" />
          <stop offset="55%" stopColor="#9aa7b2" />
          <stop offset="100%" stopColor="#4c5660" />
        </radialGradient>
      </defs>

      <polygon
        points="400,210 180,560 620,560"
        fill="none"
        stroke="url(#metalEdge)"
        strokeWidth="3"
      />
      <circle cx="400" cy="210" r="16" fill="url(#metalNode)" />
      <circle cx="180" cy="560" r="16" fill="url(#metalNode)" />
      <circle cx="620" cy="560" r="16" fill="url(#metalNode)" />

      <circle cx="400" cy="385" r="260" fill="none" stroke="#5c7891" strokeOpacity="0.18" />

      <text x="400" y="165" textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="16" letterSpacing="4" fill="#dfeaf1" fillOpacity="0.75">
        PROCESSING
      </text>
      <text x="150" y="610" textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="16" letterSpacing="4" fill="#dfeaf1" fillOpacity="0.75">
        STRUCTURE
      </text>
      <text x="650" y="610" textAnchor="middle" fontFamily="'DM Mono', monospace" fontSize="16" letterSpacing="4" fill="#dfeaf1" fillOpacity="0.75">
        PROPERTIES
      </text>
    </svg>
  );
}
