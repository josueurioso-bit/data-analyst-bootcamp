# Rate Limiting Strategy (Post-MVP)

## Current Status: NOT IMPLEMENTED

For the MVP demo, we're skipping rate limiting to focus on core functionality (database + CSV export). This document outlines the future implementation plan.

## Why We Need It

Our Anthropic API key is stored securely in Vercel environment variables, but without rate limiting, anyone could:

1. **Spam our endpoint** - Make thousands of requests
2. **Drain our API credits** - Each Claude API call costs money
3. **Cause service disruption** - Overload our serverless functions

## MVP Approach: DEMO_MODE

For the Wednesday demo, we can protect the API by enabling DEMO_MODE:

```javascript
// Add to the top of /api/chat.js handler function
if (process.env.DEMO_MODE === 'true') {
  return res.status(503).json({
    error: 'Assessment temporarily disabled for demo.',
    message: 'View analytics from existing seed data instead.'
  });
}
```

**To enable:**
1. Add `DEMO_MODE=true` to Vercel environment variables
2. Redeploy

**Effect:** Quiz API returns error, but CSV export and existing data still work.

## Production Approach: Vercel KV Rate Limiting

For real deployment, implement Redis-based rate limiting using Vercel KV:

### Option A: Vercel KV (Recommended)

```javascript
import { kv } from '@vercel/kv';

async function rateLimit(ip) {
  const key = `rate_limit:${hashIp(ip)}`;
  const current = await kv.incr(key);

  if (current === 1) {
    // First request, set expiry to 1 hour
    await kv.expire(key, 3600);
  }

  return current <= 20; // Allow 20 requests per hour per IP
}

// In handler:
const clientIp = getClientIp(req);
const allowed = await rateLimit(clientIp);

if (!allowed) {
  return res.status(429).json({
    error: 'Too many requests',
    message: 'Please wait before trying again. Limit: 20 assessments per hour.'
  });
}
```

### Option B: Upstash Redis

Alternative if Vercel KV isn't available:

```bash
npm install @upstash/redis @upstash/ratelimit
```

```javascript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
});

// In handler:
const { success } = await ratelimit.limit(hashIp(clientIp));
if (!success) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

## Implementation Checklist

- [ ] Choose rate limiting service (Vercel KV or Upstash)
- [ ] Add environment variables for Redis connection
- [ ] Implement rate limit check in `/api/chat.js`
- [ ] Add user-friendly error message
- [ ] Test with multiple rapid requests
- [ ] Monitor usage in production

## Cost Considerations

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel KV | 30K requests/month | Included with Vercel Pro |
| Upstash | 10K requests/day | Good free tier |

## Decision Log

**January 2026:** Decided to skip for MVP demo. Time estimate for full implementation was 45-60 minutes, which would cut into testing time. DEMO_MODE provides adequate protection for a 3-minute demo.

## References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit/overview)
- [OWASP Rate Limiting Guidelines](https://owasp.org/API-Security/)
