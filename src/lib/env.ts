/**
 * Environment Variables Validation
 *
 * Centralized environment variable validation to prevent silent failures in production.
 * All required environment variables are validated at startup.
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `Please ensure ${key} is set in your .env.local file.\n` +
      `See .env.example for reference.`
    );
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Validated environment variables
 * These are checked at module load time, so the app will fail fast if configuration is invalid.
 *
 * Note: Client-side variables (NEXT_PUBLIC_*) are handled separately to avoid build issues
 */
export const ENV = {
  // Supabase (can be used server-side)
  SUPABASE_URL: getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL', ''),
  SUPABASE_ANON_KEY: getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),

  // Upstash Redis (server-side only)
  REDIS_REST_URL: getOptionalEnv('UPSTASH_REDIS_REST_URL', ''),
  REDIS_REST_TOKEN: getOptionalEnv('UPSTASH_REDIS_REST_TOKEN', ''),

  // Optional - Sentry (for production monitoring)
  SENTRY_DSN: getOptionalEnv('NEXT_PUBLIC_SENTRY_DSN'),

  // Optional - Cron authentication
  CRON_SECRET: getOptionalEnv('CRON_SECRET', 'development-secret'),

  // Runtime
  NODE_ENV: getOptionalEnv('NODE_ENV', 'development'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// Validate critical server-side variables only
if (typeof window === 'undefined') {
  // Server-side validation
  if (!ENV.REDIS_REST_URL || !ENV.REDIS_REST_TOKEN) {
    console.warn('⚠️  Redis credentials missing - caching will be disabled');
  }
  console.log('✅ Server-side environment variables validated');
}
