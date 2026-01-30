"use client";

import { useEffect, useRef, useState } from "react";

interface Position {
  x: number;
  y: number;
}

export function CustomCursor() {
  const [displayPos, setDisplayPos] = useState<Position>({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState<Position>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.hasAttribute("data-cursor-hover")
      );
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      // Directly attach to mouse - no interpolation
      setDisplayPos({ x: targetPos.x, y: targetPos.y });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [targetPos]);

  // Track mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted on client
  if (!mounted) return null;

  const ringSize = isHovering ? 80 : 60;
  const dotSize = isClicking ? 8 : 6;

  return (
    <>
      {/* Outer ring */}
      <div
        className="pointer-events-none fixed z-[9999] hidden md:block rounded-full"
        style={{
          left: displayPos.x,
          top: displayPos.y,
          width: ringSize,
          height: ringSize,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.9 : 1})`,
          opacity: isVisible ? 1 : 0,
          border: "2px solid var(--brand-lavender)",
          boxShadow:
            "0 0 15px var(--glow-lavender), 0 0 30px var(--glow-lavender)",
        }}
      />

      {/* Center dot */}
      <div
        className="pointer-events-none fixed z-[9999] hidden md:block rounded-full"
        style={{
          left: targetPos.x,
          top: targetPos.y,
          width: dotSize,
          height: dotSize,
          transform: "translate(-50%, -50%)",
          opacity: isVisible ? 1 : 0,
          backgroundColor: "var(--brand-lavender-deep)",
          boxShadow: "0 0 8px var(--glow-lavender)",
          transition: "opacity 0.15s ease-out",
        }}
      />
    </>
  );
}
