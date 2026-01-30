"use client";

import { useEffect, useRef, useState } from "react";

interface TextScrollRevealProps {
  text: string;
  unit?: "Words" | "Letters";
  textColor?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  className?: string;
}

export function TextScrollReveal({
  text,
  unit = "Words",
  textColor = "var(--foreground)",
  fontSize = "clamp(2rem, 5vw, 4rem)",
  fontWeight = 600,
  lineHeight = 1.3,
  textAlign = "center",
  className = "",
}: TextScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Text reveals as you scroll down
      // Progress 0 = element at bottom of viewport
      // Progress 1 = element at top of viewport
      const scrollProgress = 1 - rect.top / (windowHeight * 0.7);
      setProgress(Math.max(0, Math.min(1, scrollProgress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tokenize text based on unit
  const tokens =
    unit === "Words" ? text.split(/\s+/).filter(Boolean) : text.split("");

  const totalTokens = tokens.length;

  return (
    <div
      ref={containerRef}
      className={`${className}`}
      style={{
        fontSize,
        fontWeight,
        lineHeight,
        textAlign,
      }}
    >
      {unit === "Words"
        ? tokens.map((word, i) => {
            // Each word reveals based on scroll progress
            const tokenStart = i / totalTokens;
            const tokenEnd = (i + 1) / totalTokens;
            const tokenOpacity =
              progress >= tokenEnd
                ? 1
                : progress >= tokenStart
                  ? (progress - tokenStart) / (tokenEnd - tokenStart)
                  : 0.15; // Dim but visible

            return (
              <span
                key={i}
                className="inline-block transition-all duration-200"
                style={{
                  opacity: tokenOpacity,
                  color: textColor,
                  transform:
                    tokenOpacity < 0.5 ? "translateY(5px)" : "translateY(0)",
                }}
              >
                {word}
                {i < tokens.length - 1 ? "\u00A0" : ""}
              </span>
            );
          })
        : tokens.map((char, i) => {
            const tokenStart = i / totalTokens;
            const tokenEnd = (i + 1) / totalTokens;
            const tokenOpacity =
              progress >= tokenEnd
                ? 1
                : progress >= tokenStart
                  ? (progress - tokenStart) / (tokenEnd - tokenStart)
                  : 0.15;

            return (
              <span
                key={i}
                className="inline-block transition-all duration-100"
                style={{
                  opacity: tokenOpacity,
                  color: textColor,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
    </div>
  );
}

export default TextScrollReveal;
