import React from "react";

/**
 * Custom O.K monogram — an interlocking ring (O) with a angled bar-and-blade
 * mark (K) cut into it, rendered in the brand accent. Geometric and minimal
 * rather than literal lettering, so it reads as a real personal brand mark
 * rather than placeholder text.
 */
export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* O — outer ring */}
      <circle
        cx="20"
        cy="20"
        r="17.5"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      {/* O — accent arc, offset to suggest motion/progress */}
      <path
        d="M20 2.5a17.5 17.5 0 0 1 12.37 29.87"
        stroke="rgb(var(--color-gold))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* K — angled blade formed from two clean strokes through the center */}
      <path
        d="M16 12v16M16 20l8-8M16 20l8 8"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
