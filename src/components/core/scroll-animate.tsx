"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface ScrollAnimateProps {
  children: ReactNode;
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale";
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export function ScrollAnimate({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  className = "",
  threshold = 0.1,
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const getInitialStyles = () => {
    switch (animation) {
      case "fade-up":
        return { opacity: 0, transform: "translateY(40px)" };
      case "fade-in":
        return { opacity: 0 };
      case "slide-left":
        return { opacity: 0, transform: "translateX(-40px)" };
      case "slide-right":
        return { opacity: 0, transform: "translateX(40px)" };
      case "scale":
        return { opacity: 0, transform: "scale(0.9)" };
      default:
        return { opacity: 0 };
    }
  };

  const getFinalStyles = () => {
    return { opacity: 1, transform: "translateY(0) translateX(0) scale(1)" };
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...(isVisible ? getFinalStyles() : getInitialStyles()),
        transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

// Stagger children animation wrapper
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 100,
  className = "",
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(30px)",
                transition: `all 500ms cubic-bezier(0.4, 0, 0.2, 1) ${index * staggerDelay}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

export default ScrollAnimate;
