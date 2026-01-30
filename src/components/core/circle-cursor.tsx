"use client";

import { useEffect, useState } from "react";

interface CircleCursorProps {
  dotSize?: number;
  dotColor?: string;
  ringSize?: number;
  ringColor?: string;
  ringBorderWidth?: number;
  hoverScale?: number;
  clickScale?: number;
  animationDuration?: number;
  blendMode?: string;
  opacity?: number;
  hideOnMobile?: boolean;
}

export function CircleCursor({
  dotSize = 6,
  dotColor = "#a78bfa",
  ringSize: _ringSize = 32,
  ringColor: _ringColor = "#a78bfa",
  ringBorderWidth: _ringBorderWidth = 2,
  hoverScale = 1.5,
  clickScale = 0.75,
  animationDuration = 200,
  blendMode = "normal",
  opacity = 1,
  hideOnMobile = true,
}: CircleCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [linkHovered, setLinkHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    if (checkMobile && hideOnMobile) return;

    // Hide default cursor
    document.body.style.cursor = "none";
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(styleElement);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };

    const onMouseEnter = () => setHidden(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    // Handle link hover
    const handleLinkHover = () => {
      const elements = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select',
      );
      elements.forEach((el) => {
        el.addEventListener("mouseenter", () => setLinkHovered(true));
        el.addEventListener("mouseleave", () => setLinkHovered(false));
      });
    };

    handleLinkHover();

    // Observer for dynamic content
    const observer = new MutationObserver(handleLinkHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      observer.disconnect();
      document.body.style.cursor = "auto";
      styleElement.remove();
    };
  }, [hideOnMobile]);

  if (isMobile && hideOnMobile) return null;

  const currentScale = linkHovered ? hoverScale : clicked ? clickScale : 1;
  const transitionSpeed = `${animationDuration}ms`;

  return (
    <>
      {/* Dot */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          backgroundColor: dotColor,
          borderRadius: "50%",
          transform: `translate(${position.x - dotSize / 2}px, ${position.y - dotSize / 2}px) scale(${currentScale})`,
          pointerEvents: "none",
          zIndex: 10000,
          mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
          opacity: hidden ? 0 : opacity,
          transition: `all ${transitionSpeed} ease`,
        }}
      />
    </>
  );
}

export default CircleCursor;
