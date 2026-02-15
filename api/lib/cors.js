/**
 * CORS Helper — Shared across all API routes
 *
 * TEACHING MOMENT: CORS (Cross-Origin Resource Sharing) controls which
 * websites can call your API. Using "*" means ANY website can call it,
 * which is a security risk. Instead, we whitelist only our own domains.
 *
 * We allow:
 * - Production: https://data-analyst-bootcamp.vercel.app
 * - Local dev: http://localhost or http://127.0.0.1 (any port)
 */

const PRODUCTION_ORIGIN = 'https://data-analyst-bootcamp.vercel.app';

/**
 * Check if an origin is allowed to access our API
 */
function isAllowedOrigin(origin) {
  if (!origin) return false;

  // Production URL
  if (origin === PRODUCTION_ORIGIN) return true;

  // Local development (Live Preview, localhost dev servers)
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;

  return false;
}

/**
 * Set CORS headers on the response
 *
 * TEACHING MOMENT: Instead of "Access-Control-Allow-Origin: *",
 * we echo back the request's Origin header ONLY if it's on our whitelist.
 * This is the standard secure pattern for multi-origin CORS.
 */
function setCorsHeaders(req, res, methods) {
  const origin = req.headers['origin'] || req.headers['Origin'] || '';

  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // If origin isn't allowed, set production URL as default
    // Browser will block the request if it doesn't match
    res.setHeader('Access-Control-Allow-Origin', PRODUCTION_ORIGIN);
  }

  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { setCorsHeaders, isAllowedOrigin, PRODUCTION_ORIGIN };
