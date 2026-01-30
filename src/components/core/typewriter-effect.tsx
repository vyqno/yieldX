"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TypewriterEffectProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  cursorColor?: string;
  cursorWidth?: number;
  cursorHeight?: number;
  fontSize?: string;
  fontWeight?: number;
  textColor?: string;
  className?: string;
}

export function TypewriterEffect({
  words = ["Hello", "World", "YieldX"],
  typingSpeed = 100,
  deletingSpeed = 60,
  pauseDuration = 1000,
  cursorColor = "var(--brand-lavender)",
  cursorWidth = 3,
  cursorHeight = 100,
  fontSize = "clamp(2rem, 5vw, 4rem)",
  fontWeight = 700,
  textColor = "var(--foreground)",
  className = "",
}: TypewriterEffectProps) {
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blinkRef = useRef<NodeJS.Timeout | null>(null);

  const currentWord = words.length > 0 ? words[wordIndex % words.length] : "";

  // Typing/Deleting Effect
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let delay = typingSpeed;

    if (!isDeleting && charIndex < currentWord.length) {
      // Typing
      delay = typingSpeed;
      timeoutRef.current = setTimeout(() => {
        setDisplayed(currentWord.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, delay);
    } else if (!isDeleting && charIndex === currentWord.length) {
      // Pause at end of word
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      delay = deletingSpeed;
      timeoutRef.current = setTimeout(() => {
        setDisplayed(currentWord.slice(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      }, delay);
    } else if (isDeleting && charIndex === 0) {
      // Pause before next word
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(false);
        setWordIndex((wordIndex + 1) % words.length);
      }, pauseDuration / 2);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    charIndex,
    isDeleting,
    wordIndex,
    currentWord,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    words.length,
  ]);

  // Reset charIndex when wordIndex changes
  useEffect(() => {
    if (!isDeleting) {
      setCharIndex(0);
    }
  }, [isDeleting]);

  // Blinking Cursor Effect
  useEffect(() => {
    if (blinkRef.current) clearInterval(blinkRef.current);
    blinkRef.current = setInterval(() => {
      setShowCursor((v) => !v);
    }, 500);
    return () => {
      if (blinkRef.current) clearInterval(blinkRef.current);
    };
  }, []);

  // Calculate font size for cursor height
  const fontSizeNum = useMemo(() => {
    if (typeof fontSize === "string" && fontSize.includes("rem")) {
      return parseFloat(fontSize) * 16;
    } else if (typeof fontSize === "string" && fontSize.includes("px")) {
      return parseFloat(fontSize);
    }
    return 48;
  }, [fontSize]);

  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{
        fontSize,
        fontWeight,
        color: textColor,
        minWidth: 1,
        minHeight: 1,
        width: "max-content",
        height: "max-content",
        whiteSpace: "pre",
      }}
      aria-live="polite"
    >
      {displayed}
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          background: cursorColor,
          width: cursorWidth,
          height: fontSizeNum * (cursorHeight / 100),
          marginLeft: 2,
          marginRight: 2,
          verticalAlign: "bottom",
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.1s",
          borderRadius: 2,
        }}
      />
    </span>
  );
}

export default TypewriterEffect;
