/**
 * Rate Limiting using Upstash
 *
 * Protects API endpoints from abuse and DDoS attacks.
 * Uses sliding window algorithm for accurate rate limiting.
 */

import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

/**
 * Rate limiter configurations
 */

// Free tier: 100 requests per minute
export const freeRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:free',
});

// Premium tier: 1000 requests per minute (for future paid tier)
export const premiumRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: true,
  prefix: 'ratelimit:premium',
});

// Cron jobs: No limit
export const cronRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1000, '1 m'),
  analytics: false,
  prefix: 'ratelimit:cron',
});

/**
 * Check rate limit for a request
 *
 * @param identifier - Unique identifier (IP address, API key, etc.)
 * @param tier - Rate limit tier ('free', 'premium', 'cron')
 * @returns Rate limit result with success status and headers
 */
export async function checkRateLimit(
  identifier: string,
  tier: 'free' | 'premium' | 'cron' = 'free'
) {
  let limiter: Ratelimit;

  switch (tier) {
    case 'premium':
      limiter = premiumRateLimit;
      break;
    case 'cron':
      limiter = cronRateLimit;
      break;
    default:
      limiter = freeRateLimit;
  }

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    },
  };
}

/**
 * Get IP address from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (Vercel)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'anonymous';
}

/**
 * Rate limit response helper
 */
export function createRateLimitResponse(headers: Record<string, string>) {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter: headers['X-RateLimit-Reset'],
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}
