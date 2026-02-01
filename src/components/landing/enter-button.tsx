"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

interface EnterButtonProps {
  onHover: (isHovering: boolean) => void;
  onProximity: (distance: number) => void;
}

export function EnterButton({ onHover, onProximity }: EnterButtonProps) {
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [magnetPosition, setMagnetPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Report proximity
      onProximity(distance);

      // Magnetic effect when hovering
      if (isHovering) {
        const strength = 0.15;
        setMagnetPosition({
          x: deltaX * strength,
          y: deltaY * strength,
        });
      }
    },
    [isHovering, onProximity],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    onHover(true);
  }, [onHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setMagnetPosition({ x: 0, y: 0 });
    onHover(false);
    onProximity(9999);
  }, [onHover, onProximity]);

  const handleClick = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          relative group
          px-10 py-5 rounded-full
          font-semibold text-lg
          transition-all duration-300 ease-out
          ${
            isHovering
              ? "bg-[var(--brand-lavender-deep)] text-white shadow-2xl"
              : "bg-[var(--brand-lavender)] text-white shadow-lg"
          }
        `}
        style={{
          transform: `translate(${magnetPosition.x}px, ${magnetPosition.y}px) scale(${
            isHovering ? 1.05 : 1
          })`,
          boxShadow: isHovering
            ? "0 0 60px var(--glow-lavender), 0 20px 40px rgba(0,0,0,0.1)"
            : "0 0 30px var(--glow-lavender), 0 10px 20px rgba(0,0,0,0.05)",
        }}
      >
        <span className="flex items-center gap-3">
          Enter YieldX
          <ArrowRight
            className={`w-5 h-5 transition-transform duration-300 ${
              isHovering ? "translate-x-1" : ""
            }`}
          />
        </span>

        {/* Ripple effect on hover */}
        {isHovering && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[var(--brand-lavender)] opacity-20" />
        )}
      </button>

      {/* Skip audio option */}
      <button
        type="button"
        onClick={handleClick}
        className="block mx-auto mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Enter without audio
      </button>
    </div>
  );
}
