"use client";

import Link from "next/link";
import { useState } from "react";

interface WavyNavLinkProps {
  href: string;
  label: string;
  labelColor?: string;
  labelFontSize?: number;
  underlineColor?: string;
  className?: string;
}

export function WavyNavLink({
  href,
  label,
  labelColor = "currentColor",
  labelFontSize = 15,
  underlineColor = "var(--brand-lavender)",
  className = "",
}: WavyNavLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={`inline-flex flex-col items-start gap-0 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text with wavy animation */}
      <span
        className="flex overflow-hidden"
        style={{
          color: labelColor,
          fontSize: `${labelFontSize}px`,
          fontWeight: 500,
        }}
      >
        {label.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block transition-transform duration-300"
            style={{
              transform: isHovered
                ? `translateY(${Math.sin(index * 0.5) * 3}px)`
                : "translateY(0)",
              transitionDelay: `${index * 20}ms`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>

      {/* Animated underline */}
      <span
        className="h-0.5 rounded-full transition-all duration-300 ease-out"
        style={{
          backgroundColor: underlineColor,
          width: isHovered ? "100%" : "0%",
          transformOrigin: "left",
        }}
      />
    </Link>
  );
}

export default WavyNavLink;
