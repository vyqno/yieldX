import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from './use-favorites';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it('should load favorites from localStorage on mount', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['USDC', 'WETH']));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual(['USDC', 'WETH']);
  });

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('USDC');
    });

    expect(result.current.favorites).toContain('USDC');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'yieldcopilot_favorites',
      JSON.stringify(['USDC'])
    );
  });

  it('should not add duplicate favorite', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('USDC');
      result.current.addFavorite('USDC');
    });

    expect(result.current.favorites).toEqual(['USDC']);
    expect(result.current.favorites.filter((f) => f === 'USDC').length).toBe(1);
  });

  it('should remove a favorite', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['USDC', 'WETH']));

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.removeFavorite('USDC');
    });

    expect(result.current.favorites).toEqual(['WETH']);
    expect(result.current.favorites).not.toContain('USDC');
  });

  it('should toggle favorite (add)', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('USDC');
    });

    expect(result.current.favorites).toContain('USDC');
  });

  it('should toggle favorite (remove)', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['USDC']));

    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite('USDC');
    });

    expect(result.current.favorites).not.toContain('USDC');
  });

  it('should check if symbol is favorite', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(['USDC']));

    const { result } = renderHook(() => useFavorites());

    expect(result.current.isFavorite('USDC')).toBe(true);
    expect(result.current.isFavorite('WETH')).toBe(false);
  });

  it('should persist favorites to localStorage on change', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite('USDC');
    });

    act(() => {
      result.current.addFavorite('WETH');
    });

    // Check that localStorage was called with updated values
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'yieldcopilot_favorites',
      expect.stringContaining('USDC')
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'yieldcopilot_favorites',
      expect.stringContaining('WETH')
    );
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid json');

    const { result } = renderHook(() => useFavorites());

    // Should not crash and return empty array
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it('should handle non-array localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ not: 'an array' }));

    const { result } = renderHook(() => useFavorites());

    // Should not crash and return empty array
    expect(result.current.favorites).toEqual([]);
  });
});
