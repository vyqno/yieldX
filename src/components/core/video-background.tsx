"use client";

import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  src: string;
  blur?: number;
  opacity?: number;
  gradientFrom?: string;
  gradientTo?: string;
}

export function VideoBackground({
  src,
  blur = 8,
  opacity = 0.6,
  gradientFrom = "var(--background)",
  gradientTo = "transparent",
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          filter: `blur(${blur}px)`,
          opacity: isLoaded ? opacity : 0,
          transform: "scale(1.1)", // Prevent blur edge artifacts
        }}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Gradient Overlay - Top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${gradientFrom} 0%, ${gradientTo} 30%, ${gradientTo} 70%, ${gradientFrom} 100%)`,
        }}
      />

      {/* Additional overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${gradientFrom} 80%)`,
        }}
      />
    </div>
  );
}
