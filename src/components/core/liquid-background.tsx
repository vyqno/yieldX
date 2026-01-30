"use client";

import { useRef } from "react";

interface LiquidBackgroundProps {
  preset?: "Prism" | "Lava" | "Plasma" | "Pulse" | "Vortex" | "Mist" | "Blue";
  speed?: number;
  className?: string;
}

// Exact presets from Framer component
const presets = {
  Prism: {
    color1: "#050505",
    color2: "#66B3FF",
    color3: "#FFFFFF",
  },
  Lava: {
    color1: "#FF9F21",
    color2: "#FF0303",
    color3: "#000000",
  },
  Plasma: {
    color1: "#B566FF",
    color2: "#000000",
    color3: "#1a1a2e",
  },
  Pulse: {
    color1: "#66FF85",
    color2: "#000000",
    color3: "#0a0a0a",
  },
  Vortex: {
    color1: "#000000",
    color2: "#FFFFFF",
    color3: "#1a1a2e",
  },
  Mist: {
    color1: "#050505",
    color2: "#FF66B8",
    color3: "#050505",
  },
  Blue: {
    color1: "#3B82F6",
    color2: "#1E40AF",
    color3: "#1E3A8A",
  },
};

export function LiquidBackground({
  preset = "Plasma",
  speed = 30,
  className = "",
}: LiquidBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { color1, color2, color3 } = presets[preset];

  // Animation duration based on speed
  const duration = Math.max(10, 60 - speed);

  return (
    <>
      {/* SVG Filter for liquid/gooey effect */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-filter">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className={`fixed inset-0 z-0 overflow-hidden ${className}`}
        style={{
          background: color3,
        }}
      >
        {/* Animated blobs */}
        <div
          className="absolute inset-0"
          style={{
            filter: "url(#liquid-filter)",
          }}
        >
          {/* Main blob 1 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "80vmax",
              height: "80vmax",
              background: `radial-gradient(circle, ${color1} 0%, transparent 70%)`,
              left: "10%",
              top: "20%",
              animation: `liquidMove1 ${duration}s ease-in-out infinite`,
              opacity: 0.9,
            }}
          />

          {/* Main blob 2 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "70vmax",
              height: "70vmax",
              background: `radial-gradient(circle, ${color1} 0%, transparent 60%)`,
              right: "5%",
              bottom: "10%",
              animation: `liquidMove2 ${duration * 1.2}s ease-in-out infinite`,
              opacity: 0.8,
            }}
          />

          {/* Secondary blob 1 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "60vmax",
              height: "60vmax",
              background: `radial-gradient(circle, ${color2} 0%, transparent 60%)`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animation: `liquidMove3 ${duration * 0.8}s ease-in-out infinite`,
              opacity: 0.7,
            }}
          />

          {/* Secondary blob 2 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "50vmax",
              height: "50vmax",
              background: `radial-gradient(circle, ${color1}80 0%, transparent 70%)`,
              right: "30%",
              top: "5%",
              animation: `liquidMove4 ${duration * 1.5}s ease-in-out infinite`,
              opacity: 0.6,
            }}
          />

          {/* Accent blob 1 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "40vmax",
              height: "40vmax",
              background: `radial-gradient(circle, ${color1} 0%, transparent 60%)`,
              left: "60%",
              bottom: "30%",
              animation: `liquidMove5 ${duration * 0.9}s ease-in-out infinite`,
              opacity: 0.75,
            }}
          />

          {/* Accent blob 2 */}
          <div
            className="absolute rounded-full"
            style={{
              width: "35vmax",
              height: "35vmax",
              background: `radial-gradient(circle, ${color2}60 0%, transparent 70%)`,
              left: "20%",
              bottom: "20%",
              animation: `liquidMove6 ${duration * 1.1}s ease-in-out infinite`,
              opacity: 0.5,
            }}
          />
        </div>

        {/* Keyframe animations */}
        <style jsx>{`
          @keyframes liquidMove1 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            25% {
              transform: translate(10vw, -15vh) scale(1.1) rotate(5deg);
            }
            50% {
              transform: translate(-5vw, 10vh) scale(0.95) rotate(-3deg);
            }
            75% {
              transform: translate(15vw, 5vh) scale(1.05) rotate(2deg);
            }
          }
          
          @keyframes liquidMove2 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(-15vw, -10vh) scale(1.15) rotate(-5deg);
            }
            66% {
              transform: translate(10vw, -5vh) scale(0.9) rotate(8deg);
            }
          }
          
          @keyframes liquidMove3 {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1) rotate(0deg);
            }
            25% {
              transform: translate(-40%, -60%) scale(1.2) rotate(10deg);
            }
            50% {
              transform: translate(-60%, -40%) scale(0.85) rotate(-5deg);
            }
            75% {
              transform: translate(-45%, -55%) scale(1.1) rotate(3deg);
            }
          }
          
          @keyframes liquidMove4 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            50% {
              transform: translate(-20vw, 15vh) scale(1.25);
            }
          }
          
          @keyframes liquidMove5 {
            0%, 100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
            }
            33% {
              transform: translate(-10vw, -20vh) scale(1.1) rotate(-8deg);
            }
            66% {
              transform: translate(5vw, 10vh) scale(0.95) rotate(5deg);
            }
          }
          
          @keyframes liquidMove6 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(15vw, -5vh) scale(1.15);
            }
            75% {
              transform: translate(-10vw, 10vh) scale(0.9);
            }
          }
        `}</style>
      </div>
    </>
  );
}

export default LiquidBackground;
