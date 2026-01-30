"use client";

import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "yieldcopilot_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, [favorites, isLoaded]);

  const addFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  }, []);

  const removeFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      }
      return [...prev, symbol];
    });
  }, []);

  const isFavorite = useCallback(
    (symbol: string) => favorites.includes(symbol),
    [favorites]
  );

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
