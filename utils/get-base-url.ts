/**
 * Get the base URL for the current environment
 * - Local development: http://localhost:3000
 * - Vercel preview: uses VERCEL_URL
 * - Production: uses NEXT_PUBLIC_CURRENT_ORIGIN or falls back to VERCEL_URL
 */
export const getBaseUrl = (): string => {
  // If we're in the browser, use the current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // For server-side rendering
  // 1. Check for explicit production URL
  if (process.env.NEXT_PUBLIC_CURRENT_ORIGIN) {
    return process.env.NEXT_PUBLIC_CURRENT_ORIGIN;
  }

  // 2. Check for Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Fall back to localhost for development
  return "http://localhost:3000";
};
