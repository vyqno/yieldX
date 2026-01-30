"use client";

import { useRef, useState } from "react";

interface CardData {
  image: string;
  title: string;
  description: string;
  tag: string;
  linkUrl?: string;
}

interface ParallaxCardGridProps {
  cards: CardData[];
  columns?: number;
  gap?: number;
  aspectRatio?: number;
  borderRadius?: number;
  tiltDepth?: number;
  enableGlare?: boolean;
  enableGlassmorphism?: boolean;
  className?: string;
}

export function ParallaxCardGrid({
  cards,
  columns = 4,
  gap = 24,
  aspectRatio = 1.2,
  borderRadius = 16,
  tiltDepth = 8,
  enableGlare = true,
  enableGlassmorphism = true,
  className = "",
}: ParallaxCardGridProps) {
  return (
    <div className={`w-full ${className}`} style={{ padding: gap }}>
      <div
        className="grid w-full parallax-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: gap,
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={index}
            card={card}
            index={index}
            aspectRatio={aspectRatio}
            borderRadius={borderRadius}
            tiltDepth={tiltDepth}
            enableGlare={enableGlare}
            enableGlassmorphism={enableGlassmorphism}
          />
        ))}
      </div>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .parallax-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .parallax-grid {
            grid-template-columns: repeat(1, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

interface CardProps {
  card: CardData;
  index: number;
  aspectRatio: number;
  borderRadius: number;
  tiltDepth: number;
  enableGlare: boolean;
  enableGlassmorphism: boolean;
}

function Card({
  card,
  index: _index,
  aspectRatio,
  borderRadius,
  tiltDepth,
  enableGlare,
  enableGlassmorphism,
}: CardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const tiltX = mousePosition.y * tiltDepth;
  const tiltY = -mousePosition.x * tiltDepth;
  const glareX = (mousePosition.x + 1) * 50;
  const glareY = (mousePosition.y + 1) * 50;

  return (
    <div
      ref={cardRef}
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-pointer animate-fade-in"
    >
      <div
        style={{
          width: "100%",
          aspectRatio: `1 / ${aspectRatio}`,
          borderRadius: borderRadius,
          overflow: "hidden",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          boxShadow: isHovered
            ? `0 ${20 + tiltDepth}px ${40 + tiltDepth * 2}px rgba(181, 102, 255, 0.3)`
            : "0 8px 24px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.15s ease-out, box-shadow 0.3s ease",
          ...(enableGlassmorphism
            ? {
                backdropFilter: "blur(20px)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }
            : {
                backgroundColor: "#1a1a2e",
              }),
        }}
      >
        {/* Card Image - 75% height */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: "75%",
            backgroundImage: `url(${card.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            filter: isHovered ? "brightness(1.1)" : "brightness(1)",
            transition: "filter 0.3s ease",
          }}
        />

        {/* Bottom Section with Light Grey Gradient - 25% height */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
          style={{
            height: "25%",
            background:
              "linear-gradient(180deg, rgba(220, 220, 220, 0.95) 0%, rgba(180, 180, 180, 1) 100%)",
          }}
        >
          <h3 className="text-lg font-bold text-gray-800 text-center px-2">
            {card.title}
          </h3>
        </div>

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: "rgba(181, 102, 255, 0.8)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          >
            {card.tag}
          </span>
        </div>

        {/* Glare Effect */}
        {enableGlare && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`,
              opacity: 0.5,
            }}
          />
        )}

        {/* Hover Border Glow */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: borderRadius,
              border: "2px solid rgba(181, 102, 255, 0.5)",
              boxShadow: "inset 0 0 20px rgba(181, 102, 255, 0.2)",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ParallaxCardGrid;
