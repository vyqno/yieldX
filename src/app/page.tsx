"use client";

import { ArrowDownRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { TypewriterEffect } from "@/components/core/typewriter-effect";

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const leftEyelidTopRef = useRef<SVGRectElement>(null);
  const leftEyelidBottomRef = useRef<SVGRectElement>(null);
  const rightEyelidTopRef = useRef<SVGRectElement>(null);
  const rightEyelidBottomRef = useRef<SVGRectElement>(null);
  const [isHoveringEnter, setIsHoveringEnter] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  const targetEyelidOpennessRef = useRef(0);
  const currentEyelidOpennessRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const PROXIMITY_RADIUS = 300;
  const EYELID_ANIMATION_SPEED = 0.02;

  const updateEyePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height * 0.25;
    const offsetX = (mousePositionRef.current.x - centerX) / (rect.width / 2);
    const offsetY = (mousePositionRef.current.y - centerY) / (rect.height / 2);
    const maxMove = 15;
    const moveX = Math.max(-maxMove, Math.min(maxMove, offsetX * maxMove));
    const moveY = Math.max(-maxMove, Math.min(maxMove, offsetY * maxMove));

    if (leftEyeRef.current) {
      leftEyeRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0px)`;
    }
  }, []);

  const calculateDistanceToButton = useCallback(() => {
    if (!enterButtonRef.current || !containerRef.current) return Infinity;
    const buttonRect = enterButtonRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const buttonCenterX =
      buttonRect.left + buttonRect.width / 2 - containerRect.left;
    const buttonCenterY =
      buttonRect.top + buttonRect.height / 2 - containerRect.top;
    const dx = mousePositionRef.current.x - buttonCenterX;
    const dy = mousePositionRef.current.y - buttonCenterY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const updateEyelidTarget = useCallback(() => {
    const distance = calculateDistanceToButton();
    const openness = Math.max(
      0,
      Math.min(100, (1 - distance / PROXIMITY_RADIUS) * 100),
    );
    targetEyelidOpennessRef.current = openness;
  }, [calculateDistanceToButton]);

  const animateEyelids = useCallback(() => {
    const target = targetEyelidOpennessRef.current;
    const current = currentEyelidOpennessRef.current;
    const diff = target - current;
    const newOpenness = current + diff * EYELID_ANIMATION_SPEED;
    currentEyelidOpennessRef.current = newOpenness;
    const hiddenPercent = newOpenness;

    if (leftEyelidTopRef.current)
      leftEyelidTopRef.current.style.transform = `translateY(-${hiddenPercent}%)`;
    if (leftEyelidBottomRef.current)
      leftEyelidBottomRef.current.style.transform = `translateY(${hiddenPercent}%)`;
    if (rightEyelidTopRef.current)
      rightEyelidTopRef.current.style.transform = `translateY(-${hiddenPercent}%)`;
    if (rightEyelidBottomRef.current)
      rightEyelidBottomRef.current.style.transform = `translateY(${hiddenPercent}%)`;

    animationFrameRef.current = requestAnimationFrame(animateEyelids);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateEyelids);
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [animateEyelids]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePositionRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      updateEyePosition();
      updateEyelidTarget();
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [updateEyePosition, updateEyelidTarget]);

  const handleEnterClick = () => {
    router.push("/dashboard");
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#3B82F6" }}
    >
      {/* Eyes SVG */}
      <div className="relative mb-8">
        <svg
          width="311.3"
          height="233.3"
          viewBox="0 0 311.3 233.3"
          style={{ width: 280 }}
          aria-labelledby="eyes-title"
          role="img"
        >
          <title id="eyes-title">Animated eyes that follow cursor</title>
          <defs>
            <clipPath id="mask-left">
              <path
                fill="#FFFFFF"
                d="M139.5,101.5c2.5-7.8,6-14.8,10.3-21c0-0.1-0.1-0.2-0.1-0.3c-3.8-11.2-11.1-19-20.6-22c-2.8-0.9-5.6-1.3-8.5-1.3c-7,0-14.2,2.5-21,7.5C89.8,71.3,82.2,82.4,78,95.5c-4.1,13.1-4.3,26.5-0.4,37.9c3.8,11.2,11.1,19,20.6,22c9.4,3,19.9,0.8,29.5-6.1c3.5-2.5,6.7-5.6,9.6-9.1C134.6,128,135.3,114.6,139.5,101.5z"
              />
            </clipPath>
            <clipPath id="mask-right">
              <path
                fill="#FFFFFF"
                d="M206,58.9c-3.8-1.2-7.6-1.8-11.4-1.8c-21.7,0-43.6,18.2-52.2,45.3c-4.9,15.5-4.8,31.6,0.3,45.3c5.1,13.6,14.5,23.1,26.6,27c12,3.8,25.3,1.4,37.2-6.7c12.1-8.2,21.5-21.3,26.4-36.8C243,99.2,230.9,66.8,206,58.9z"
              />
            </clipPath>
          </defs>

          {/* Left Eye */}
          <ellipse
            transform="matrix(0.3023 -0.9532 0.9532 0.3023 -22.508 182.8248)"
            fill="#FFFFFF"
            stroke="#2D2A32"
            strokeWidth="3"
            cx="113.6"
            cy="106.8"
            rx="52.5"
            ry="38.8"
          />
          <g clipPath="url(#mask-left)">
            <g
              ref={leftEyeRef}
              style={{ transition: "transform 0.1s ease-out" }}
            >
              <g
                style={{
                  opacity: isHoveringEnter ? 0 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                <ellipse
                  transform="matrix(0.2938 -0.9559 0.9559 0.2938 -24.3184 186.5732)"
                  fill="#2D2A32"
                  cx="114.1"
                  cy="109.7"
                  rx="33"
                  ry="23.5"
                />
                <circle fill="#FFFFFF" cx="132.6" cy="120.7" r="11" />
              </g>
              <path
                style={{
                  opacity: isHoveringEnter ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
                fill="#FF4E1B"
                d="M131.8,98.8c-0.9-2.8-3-5.3-5.8-6.2c-4.1-1.3-9.1,1.2-11.5,4.6c-1.5,2.1-2.1,4.6-2.9,7c-0.2,0.8-0.8,4-1.8,2.2c-2.2-3.7-6.4-6.2-10.7-4.7c-3.2,1.1-5.2,4.3-5.9,7.4c-1,5,1.4,9.9,4.9,13.4c2.6,2.6,5.7,4.6,8.9,6.5c1.7,1,3.6,1.7,5.2,2.8c1.4,1,4.1,5.8,5.4,3.1c1.1-2.4,1.6-5.1,3-7.4c1.5-2.6,3.4-5,5.1-7.5c3.3-4.7,6.8-9.8,6.9-15.8C132.7,102.5,132.5,100.6,131.8,98.8z"
              />
            </g>
            <rect
              ref={leftEyelidTopRef}
              x="62.9"
              y="22.3"
              width="103.2"
              height="78.5"
              fill="#FDF8F3"
              stroke="#2D2A32"
              strokeWidth="3"
            />
            <rect
              ref={leftEyelidBottomRef}
              x="65.1"
              y="125.7"
              width="89.3"
              height="78.5"
              fill="#FDF8F3"
              stroke="#2D2A32"
              strokeWidth="3"
            />
          </g>

          {/* Right Eye */}
          <ellipse
            transform="matrix(0.3023 -0.9532 0.9532 0.3023 19.5634 260.2873)"
            fill="#FFFFFF"
            stroke="#2D2A32"
            strokeWidth="3"
            cx="187.6"
            cy="116.8"
            rx="62.3"
            ry="49"
          />
          <g clipPath="url(#mask-right)">
            <g
              ref={rightEyeRef}
              style={{ transition: "transform 0.1s ease-out" }}
            >
              <g
                style={{
                  opacity: isHoveringEnter ? 0 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                <ellipse
                  transform="matrix(0.2938 -0.9559 0.9559 0.2938 23.4151 259.1791)"
                  fill="#2D2A32"
                  cx="187.1"
                  cy="113.7"
                  rx="35.9"
                  ry="25.6"
                />
                <circle fill="#FFFFFF" cx="208.6" cy="121.7" r="11" />
              </g>
              <path
                style={{
                  opacity: isHoveringEnter ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
                fill="#FF4E1B"
                d="M158.8,104.8c0.1-7,5.7-13.4,13.1-12.3c2.6,0.4,4.9,1.7,6.8,3.4c1.2,1.1,4,7.1,5.5,4.2c2.4-4.8,7.4-9,12.8-9.9c6.5-1.1,11.6,3.8,12.9,9.9c1.6,7.7-3.9,14.6-8.8,19.9c-5.7,6.1-12.8,11.8-15.3,20c-1.5,4.8-3.8-0.8-5.1-2.8c-1.7-2.6-4-4.7-6.3-6.7c-4.7-4.3-10-8.5-12.9-14.3C160,113,158.8,108.8,158.8,104.8z"
              />
            </g>
            <rect
              ref={rightEyelidTopRef}
              x="130.6"
              y="22.3"
              width="117.6"
              height="78.5"
              fill="#FDF8F3"
              stroke="#2D2A32"
              strokeWidth="3"
            />
            <rect
              ref={rightEyelidBottomRef}
              x="127.5"
              y="125.7"
              width="117.6"
              height="78.5"
              fill="#FDF8F3"
              stroke="#2D2A32"
              strokeWidth="3"
            />
          </g>
        </svg>
      </div>

      {/* Title with Typewriter Animation */}
      <div style={{ marginBottom: "2rem", minHeight: "3.5rem" }}>
        <span
          style={{
            color: "#000000",
            fontSize: "2.5rem",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          Welcome to{" "}
        </span>
        <TypewriterEffect
          words={["YieldX"]}
          typingSpeed={100}
          deletingSpeed={50}
          pauseDuration={3000}
          fontSize="2.5rem"
          fontWeight={600}
          textColor="#000000"
          cursorColor="#7c3aed"
        />
      </div>

      {/* Enter Button */}
      <button
        type="button"
        ref={enterButtonRef}
        onClick={handleEnterClick}
        onMouseEnter={() => setIsHoveringEnter(true)}
        onMouseLeave={() => setIsHoveringEnter(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "1rem 2.5rem",
          borderRadius: "9999px",
          border: "2px solid #2D2A32",
          fontSize: "1.125rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isHoveringEnter
            ? "#2D2A32"
            : "rgba(255,255,255,0.8)",
          color: isHoveringEnter ? "#FDF8F3" : "#2D2A32",
        }}
      >
        <span>Enter</span>
        <ArrowDownRight
          style={{
            width: 20,
            height: 20,
            transform: isHoveringEnter ? "translate(4px, 4px)" : "none",
            transition: "transform 0.3s",
          }}
        />
      </button>
    </div>
  );
}
