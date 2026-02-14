// Rate limiter for serverless functions
// Uses in-memory Map — resets on cold starts (acceptable for Vercel free tier)

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

// Map<ipHash, { count, resetTime }>
const hits = new Map();

/**
 * Check if a hashed IP has exceeded the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
 */
function checkRateLimit(ipHash) {
  if (!ipHash) return { allowed: true }; // can't rate-limit without an identifier

  const now = Date.now();
  const entry = hits.get(ipHash);

  if (!entry || now > entry.resetTime) {
    hits.set(ipHash, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count < MAX_REQUESTS) {
    entry.count++;
    return { allowed: true };
  }

  const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
  return { allowed: false, retryAfterSeconds };
}

module.exports = { checkRateLimit };
