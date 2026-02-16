// Sprint Submission API — Saves student work for evaluation
// Pattern matches chat.js: ESM, CORS, rate limiting, input validation

import crypto from 'crypto';

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (xfwd) return xfwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  const { setCorsHeaders } = await import('./lib/cors.js');
  setCorsHeaders(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const { checkRateLimit } = await import('./lib/rateLimiter.js');
  const ipHash = hashIp(getClientIp(req));
  const rateCheck = checkRateLimit(ipHash);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', rateCheck.retryAfterSeconds);
    return res.status(429).json({ error: 'Too many requests.', retryAfterSeconds: rateCheck.retryAfterSeconds });
  }

  // Input validation
  const { session_id, sprint_id, submission_text, google_sheets_url } = req.body || {};

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'session_id is required' });
  }

  if (!sprint_id || typeof sprint_id !== 'number') {
    return res.status(400).json({ error: 'sprint_id is required (number)' });
  }

  if (!submission_text || typeof submission_text !== 'string') {
    return res.status(400).json({ error: 'submission_text is required' });
  }

  if (submission_text.length < 200 || submission_text.length > 5000) {
    return res.status(400).json({ error: 'submission_text must be 200-5000 characters' });
  }

  // Optional URL validation
  if (google_sheets_url) {
    try {
      new URL(google_sheets_url);
    } catch {
      return res.status(400).json({ error: 'Invalid google_sheets_url' });
    }
  }

  try {
    const { insertSubmission } = await import('./lib/db-supabase.js');

    const submission = await insertSubmission({
      session_id,
      sprint_id,
      submission_text,
      submission_urls: google_sheets_url ? { google_sheets: google_sheets_url } : null
    });

    if (!submission) {
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    return res.status(201).json({
      submission_id: submission.id,
      status: 'pending'
    });
  } catch (error) {
    console.error('[Submit] Error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
