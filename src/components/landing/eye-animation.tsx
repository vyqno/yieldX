"use client";

import { ArrowDownRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export function EyeAnimation() {
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

  // Target and current eyelid openness for smooth animation
  const targetEyelidOpennessRef = useRef(0);
  const currentEyelidOpennessRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Proximity radius for the "radar" effect (in pixels)
  const PROXIMITY_RADIUS = 300;
  const EYELID_ANIMATION_SPEED = 0.02;

  // Calculate eye movement based on mouse position
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

  // Calculate distance from mouse to Enter button center
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

  // Update eyelid openness based on proximity
  const updateEyelidTarget = useCallback(() => {
    const distance = calculateDistanceToButton();
    const openness = Math.max(
      0,
      Math.min(100, (1 - distance / PROXIMITY_RADIUS) * 100),
    );
    targetEyelidOpennessRef.current = openness;
  }, [calculateDistanceToButton]);

  // Smooth eyelid animation loop
  const animateEyelids = useCallback(() => {
    const target = targetEyelidOpennessRef.current;
    const current = currentEyelidOpennessRef.current;

    const diff = target - current;
    const newOpenness = current + diff * EYELID_ANIMATION_SPEED;
    currentEyelidOpennessRef.current = newOpenness;

    const hiddenPercent = newOpenness;

    if (leftEyelidTopRef.current) {
      leftEyelidTopRef.current.style.transform = `translateY(-${hiddenPercent}%)`;
    }
    if (leftEyelidBottomRef.current) {
      leftEyelidBottomRef.current.style.transform = `translateY(${hiddenPercent}%)`;
    }
    if (rightEyelidTopRef.current) {
      rightEyelidTopRef.current.style.transform = `translateY(-${hiddenPercent}%)`;
    }
    if (rightEyelidBottomRef.current) {
      rightEyelidBottomRef.current.style.transform = `translateY(${hiddenPercent}%)`;
    }

    animationFrameRef.current = requestAnimationFrame(animateEyelids);
  }, []);

  // Start eyelid animation loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateEyelids);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateEyelids]);

  // Handle mouse movement
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
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(
      "yieldx-onboarding-complete",
    );
    if (hasCompletedOnboarding === "true") {
      router.push("/dashboard");
    } else {
      router.push("/onboarding");
    }
  };

  // Eyelid fill color - matches background
  const eyelidFill = "var(--background)";

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Eyes SVG */}
      <div className="relative mb-8">
        <svg
          width="311.3"
          height="233.3"
          viewBox="0 0 311.3 233.3"
          className="w-[250px] h-auto md:w-[311px]"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="mask-left">
              <path
                fill="#FFFFFF"
                d="M139.5,101.5c2.5-7.8,6-14.8,10.3-21c0-0.1-0.1-0.2-0.1-0.3c-3.8-11.2-11.1-19-20.6-22
                c-2.8-0.9-5.6-1.3-8.5-1.3c-7,0-14.2,2.5-21,7.5C89.8,71.3,82.2,82.4,78,95.5c-4.1,13.1-4.3,26.5-0.4,37.9
                c3.8,11.2,11.1,19,20.6,22c9.4,3,19.9,0.8,29.5-6.1c3.5-2.5,6.7-5.6,9.6-9.1C134.6,128,135.3,114.6,139.5,101.5z"
              />
            </clipPath>
            <clipPath id="mask-right">
              <path
                fill="#FFFFFF"
                d="M206,58.9c-3.8-1.2-7.6-1.8-11.4-1.8c-21.7,0-43.6,18.2-52.2,45.3c-4.9,15.5-4.8,31.6,0.3,45.3
                c5.1,13.6,14.5,23.1,26.6,27c12,3.8,25.3,1.4,37.2-6.7c12.1-8.2,21.5-21.3,26.4-36.8C243,99.2,230.9,66.8,206,58.9z"
              />
            </clipPath>
          </defs>

          {/* Left Eye Container */}
          <g className="left-container">
            <ellipse
              transform="matrix(0.3023 -0.9532 0.9532 0.3023 -22.508 182.8248)"
              fill="#FFFFFF"
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              cx="113.6"
              cy="106.8"
              rx="52.5"
              ry="38.8"
              className="text-foreground"
            />
          </g>

          {/* Left Eye Content with Clip */}
          <g clipPath="url(#mask-left)">
            <g
              ref={leftEyeRef}
              style={{ transition: "transform 0.1s ease-out" }}
            >
              {/* Normal Eye (pupil) */}
              <g
                className={`transition-opacity duration-300 ${isHoveringEnter ? "opacity-0" : "opacity-100"}`}
              >
                <ellipse
                  transform="matrix(0.2938 -0.9559 0.9559 0.2938 -24.3184 186.5732)"
                  className="fill-foreground"
                  cx="114.1"
                  cy="109.7"
                  rx="33"
                  ry="23.5"
                />
                <circle fill="#FFFFFF" cx="132.6" cy="120.7" r="11" />
              </g>
              {/* Heart (shown on hover) */}
              <path
                className={`transition-opacity duration-300 ${isHoveringEnter ? "opacity-100" : "opacity-0"}`}
                fill="#FF4E1B"
                d="M131.8,98.8c-0.9-2.8-3-5.3-5.8-6.2c-4.1-1.3-9.1,1.2-11.5,4.6c-1.5,2.1-2.1,4.6-2.9,7
                c-0.2,0.8-0.8,4-1.8,2.2c-2.2-3.7-6.4-6.2-10.7-4.7c-3.2,1.1-5.2,4.3-5.9,7.4c-1,5,1.4,9.9,4.9,13.4c2.6,2.6,5.7,4.6,8.9,6.5
                c1.7,1,3.6,1.7,5.2,2.8c1.4,1,4.1,5.8,5.4,3.1c1.1-2.4,1.6-5.1,3-7.4c1.5-2.6,3.4-5,5.1-7.5c3.3-4.7,6.8-9.8,6.9-15.8
                C132.7,102.5,132.5,100.6,131.8,98.8z"
              />
            </g>
            {/* Top Eyelid */}
            <rect
              ref={leftEyelidTopRef}
              x="62.9"
              y="22.3"
              width="103.2"
              height="78.5"
              fill={eyelidFill}
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              className="text-foreground"
              style={{ transform: "translateY(0%)" }}
            />
            {/* Bottom Eyelid */}
            <rect
              ref={leftEyelidBottomRef}
              x="65.1"
              y="125.7"
              width="89.3"
              height="78.5"
              fill={eyelidFill}
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              className="text-foreground"
              style={{ transform: "translateY(0%)" }}
            />
          </g>

          {/* Right Eye Container */}
          <g className="right-container">
            <ellipse
              transform="matrix(0.3023 -0.9532 0.9532 0.3023 19.5634 260.2873)"
              fill="#FFFFFF"
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              cx="187.6"
              cy="116.8"
              rx="62.3"
              ry="49"
              className="text-foreground"
            />
          </g>

          {/* Right Eye Content with Clip */}
          <g clipPath="url(#mask-right)">
            <g
              ref={rightEyeRef}
              style={{ transition: "transform 0.1s ease-out" }}
            >
              {/* Normal Eye (pupil) */}
              <g
                className={`transition-opacity duration-300 ${isHoveringEnter ? "opacity-0" : "opacity-100"}`}
              >
                <ellipse
                  transform="matrix(0.2938 -0.9559 0.9559 0.2938 23.4151 259.1791)"
                  className="fill-foreground"
                  cx="187.1"
                  cy="113.7"
                  rx="35.9"
                  ry="25.6"
                />
                <circle fill="#FFFFFF" cx="208.6" cy="121.7" r="11" />
              </g>
              {/* Heart (shown on hover) */}
              <path
                className={`transition-opacity duration-300 ${isHoveringEnter ? "opacity-100" : "opacity-0"}`}
                fill="#FF4E1B"
                d="M158.8,104.8c0.1-7,5.7-13.4,13.1-12.3c2.6,0.4,4.9,1.7,6.8,3.4c1.2,1.1,4,7.1,5.5,4.2
                c2.4-4.8,7.4-9,12.8-9.9c6.5-1.1,11.6,3.8,12.9,9.9c1.6,7.7-3.9,14.6-8.8,19.9c-5.7,6.1-12.8,11.8-15.3,20
                c-1.5,4.8-3.8-0.8-5.1-2.8c-1.7-2.6-4-4.7-6.3-6.7c-4.7-4.3-10-8.5-12.9-14.3C160,113,158.8,108.8,158.8,104.8z"
              />
            </g>
            {/* Top Eyelid */}
            <rect
              ref={rightEyelidTopRef}
              x="130.6"
              y="22.3"
              width="117.6"
              height="78.5"
              fill={eyelidFill}
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              className="text-foreground"
              style={{ transform: "translateY(0%)" }}
            />
            {/* Bottom Eyelid */}
            <rect
              ref={rightEyelidBottomRef}
              x="127.5"
              y="125.7"
              width="117.6"
              height="78.5"
              fill={eyelidFill}
              stroke="currentColor"
              strokeWidth="3"
              strokeMiterlimit="9.9999"
              className="text-foreground"
              style={{ transform: "translateY(0%)" }}
            />
          </g>
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-foreground/80 text-2xl md:text-3xl font-normal tracking-wide mb-8">
        Welcome to YIELDX
      </h1>

      {/* Enter Button */}
      <button
        type="button"
        ref={enterButtonRef}
        onClick={handleEnterClick}
        onMouseEnter={() => setIsHoveringEnter(true)}
        onMouseLeave={() => setIsHoveringEnter(false)}
        className={`
          group relative px-10 py-4 rounded-full border-[2px] border-foreground
          flex items-center gap-3 text-lg font-medium
          transition-all duration-300 ease-out
          ${
            isHoveringEnter
              ? "bg-foreground text-background"
              : "bg-background/80 text-foreground hover:bg-background"
          }
        `}
      >
        <span>Enter</span>
        <ArrowDownRight
          className={`
            w-5 h-5 transition-transform duration-300
            ${isHoveringEnter ? "translate-x-1 translate-y-1" : ""}
          `}
        />
      </button>

      {/* Skip to Dashboard Link (for returning users) */}
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="absolute bottom-12 text-sm tracking-wider uppercase text-foreground/60 hover:text-foreground transition-colors duration-300 underline underline-offset-4"
      >
        Skip to Dashboard
      </button>
    </div>
  );
}
