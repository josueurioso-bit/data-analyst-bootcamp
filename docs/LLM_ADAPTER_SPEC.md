# LLM Adapter Specification
## Provider-Agnostic AI Interface Contract

**Purpose:** Define the exact interface for `api/lib/llm.js` to support both Google Gemini (primary) and Anthropic Claude (fallback) without changing feature code.

**Principle:** Feature code should NEVER import provider SDKs directly. All LLM calls go through this adapter.

---

## 1. Adapter Interface

### 1.1 Core Function: `callLLM()`

```javascript
/**
 * Call an LLM with provider fallback
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.systemPrompt - The system prompt/context
 * @param {Array} options.messages - Conversation history [{role, content}]
 * @param {string} [options.provider] - 'gemini' or 'anthropic' (defaults to env var)
 * @param {number} [options.maxTokens=2000] - Maximum response length
 * @param {number} [options.temperature=0.7] - Creativity level (0-1)
 * @param {Object} [options.structuredOutput] - JSON schema for structured responses
 * 
 * @returns {Promise<Object>} Response object with standardized structure
 * @throws {Error} If both providers fail
 */
async function callLLM(options) {
  // Implementation below
}
```

### 1.2 Standard Response Format

Every `callLLM()` call returns this structure, regardless of provider:

```javascript
{
  success: true,                    // boolean
  provider: 'gemini',               // string: which provider was used
  content: 'The LLM response',      // string: the actual response text
  usage: {                          // object: token usage (for cost tracking)
    promptTokens: 150,
    completionTokens: 450,
    totalTokens: 600
  },
  structured: null,                 // object: parsed JSON if structuredOutput was requested
  cached: false,                    // boolean: was this a cached response?
  latency: 1247,                    // number: milliseconds to respond
  fallback: false                   // boolean: did we fall back to secondary provider?
}
```

### 1.3 Error Response Format

If an error occurs, return this instead:

```javascript
{
  success: false,
  provider: 'gemini',
  error: 'Rate limit exceeded',     // string: user-friendly message
  errorCode: 'RATE_LIMIT',          // string: machine-readable code
  details: { /* raw error */ },     // object: full error for logging
  fallbackAttempted: true,          // boolean: did we try the fallback?
  recoverable: true                 // boolean: can the caller retry?
}
```

---

## 2. Supported Error Codes

The adapter normalizes provider-specific errors into these standard codes:

| Code | Meaning | Caller Should... |
|------|---------|------------------|
| `RATE_LIMIT` | Too many requests | Wait and retry (use Retry-After header) |
| `INVALID_API_KEY` | Authentication failed | Alert admin, don't retry |
| `CONTEXT_LENGTH_EXCEEDED` | Prompt too long | Truncate conversation history, retry |
| `CONTENT_POLICY_VIOLATION` | Response filtered by provider | Show user-friendly message, don't retry |
| `NETWORK_ERROR` | Connection failed | Retry with exponential backoff |
| `PROVIDER_ERROR` | Internal provider error | Try fallback provider |
| `INVALID_RESPONSE` | Response didn't match expected format | Log and return generic error |
| `TIMEOUT` | Request exceeded time limit | Retry with shorter timeout |

---

## 3. Provider Configuration

### 3.1 Environment Variables

```bash
# Primary provider (Gemini)
GEMINI_API_KEY=AIza...
GEMINI_DAILY_LIMIT=1500  # Free tier: 1,500 requests/day
GEMINI_MODEL=gemini-2.0-flash  # Fast, cheap model

# Fallback provider (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-haiku-4-5-20251001  # Cheapest model

# Adapter behavior
LLM_DEFAULT_PROVIDER=gemini  # Which to try first
LLM_FALLBACK_ENABLED=true   # Auto-fallback on primary failure?
LLM_CACHE_ENABLED=false     # Enable response caching? (Phase 3+)
```

### 3.2 Provider-Specific Handling

The adapter must translate between provider formats:

**Anthropic Format (Messages API):**
```javascript
{
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 2000,
  system: 'You are a helpful assistant',  // separate field
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi' }
  ]
}
```

**Gemini Format:**
```javascript
{
  contents: [
    { role: 'user', parts: [{ text: 'System: You are a helpful assistant\n\nHello' }] }
    // System prompt merged into first user message
  ],
  generationConfig: {
    maxOutputTokens: 2000,
    temperature: 0.7
  }
}
```

**Adapter Responsibility:** Convert between these formats transparently.

---

## 4. Usage Tracking

The adapter must track usage for cost monitoring and rate limit enforcement.

### 4.1 Daily Tracker (In-Memory for MVP)

```javascript
// In-memory counter (resets on serverless restart)
let dailyUsage = {
  gemini: { calls: 0, tokens: 0, lastReset: new Date().toDateString() },
  anthropic: { calls: 0, tokens: 0, lastReset: new Date().toDateString() }
};

function incrementUsage(provider, tokens) {
  const today = new Date().toDateString();
  if (dailyUsage[provider].lastReset !== today) {
    // Reset counters at midnight
    dailyUsage[provider] = { calls: 0, tokens: 0, lastReset: today };
  }
  dailyUsage[provider].calls++;
  dailyUsage[provider].tokens += tokens;
}

function hasExceededLimit(provider) {
  if (provider === 'gemini' && dailyUsage.gemini.calls >= 1500) {
    return true;
  }
  return false;
}
```

**Phase 3 Upgrade:** Move this to Supabase for persistent tracking across function invocations.

---

## 5. Fallback Logic

### 5.1 When to Fallback

```javascript
async function callLLM(options) {
  const primaryProvider = options.provider || process.env.LLM_DEFAULT_PROVIDER || 'gemini';
  const fallbackEnabled = process.env.LLM_FALLBACK_ENABLED === 'true';
  
  try {
    // Try primary provider
    if (hasExceededLimit(primaryProvider)) {
      throw new Error('Daily limit exceeded');
    }
    const result = await callProvider(primaryProvider, options);
    return { ...result, fallback: false };
  } catch (primaryError) {
    console.error(`[LLM] Primary provider (${primaryProvider}) failed:`, primaryError.message);
    
    if (!fallbackEnabled) {
      return formatError(primaryProvider, primaryError, false);
    }
    
    // Try fallback
    const fallbackProvider = primaryProvider === 'gemini' ? 'anthropic' : 'gemini';
    try {
      const result = await callProvider(fallbackProvider, options);
      console.warn(`[LLM] Fell back to ${fallbackProvider}`);
      return { ...result, fallback: true };
    } catch (fallbackError) {
      console.error(`[LLM] Fallback provider (${fallbackProvider}) also failed:`, fallbackError.message);
      return formatError(fallbackProvider, fallbackError, true);
    }
  }
}
```

### 5.2 Fallback Decision Matrix

| Primary Error | Fallback? | Reason |
|---------------|-----------|--------|
| Rate limit | ✅ Yes | Other provider may still have quota |
| Invalid API key | ❌ No | Likely both are misconfigured |
| Context too long | ✅ Yes | Other provider may have larger context |
| Network error | ✅ Yes | Provider outage is independent |
| Content policy | ❌ No | Both providers have similar filters |

---

## 6. Structured Output Support

For rubric evaluation and study plan generation, we need JSON responses.

### 6.1 Requesting Structured Output

```javascript
const response = await callLLM({
  systemPrompt: 'You are a rubric evaluator',
  messages: [{ role: 'user', content: 'Evaluate this submission...' }],
  structuredOutput: {
    type: 'object',
    properties: {
      score: { type: 'number', min: 0, max: 100 },
      feedback: { type: 'string' },
      categoryScores: {
        type: 'object',
        properties: {
          businessFraming: { type: 'number' },
          dataCorrectness: { type: 'number' },
          // etc
        }
      }
    },
    required: ['score', 'feedback', 'categoryScores']
  }
});

// response.structured will contain the parsed JSON object
```

### 6.2 Provider Differences

- **Anthropic:** Doesn't have native structured output. Adapter must prompt for JSON and parse response.
- **Gemini:** Supports JSON schema natively. Use `generationConfig.responseMimeType = 'application/json'`.

**Adapter Responsibility:** Handle both, validate JSON output, return parse errors if invalid.

---

## 7. Testing Requirements

Before deploying the adapter, verify:

### 7.1 Unit Tests (Manual for MVP)

```javascript
// Test 1: Gemini success
const result1 = await callLLM({
  systemPrompt: 'Say hello',
  messages: [{ role: 'user', content: 'Hi' }],
  provider: 'gemini'
});
assert(result1.success === true);
assert(result1.provider === 'gemini');
assert(result1.content.length > 0);

// Test 2: Anthropic success
const result2 = await callLLM({
  systemPrompt: 'Say hello',
  messages: [{ role: 'user', content: 'Hi' }],
  provider: 'anthropic'
});
assert(result2.success === true);
assert(result2.provider === 'anthropic');

// Test 3: Fallback on rate limit
// (Manually exhaust Gemini quota, then verify fallback)

// Test 4: Structured output
const result4 = await callLLM({
  systemPrompt: 'Return JSON',
  messages: [{ role: 'user', content: 'Give me a JSON object with a score field' }],
  structuredOutput: { type: 'object', properties: { score: { type: 'number' } } }
});
assert(result4.structured !== null);
assert(typeof result4.structured.score === 'number');
```

---

## 8. Implementation Checklist

When building `api/lib/llm.js`:

- [ ] Install dependencies: `npm install @google/generative-ai @anthropic-ai/sdk`
- [ ] Create `callLLM()` function with signature above
- [ ] Implement Gemini provider integration
- [ ] Implement Anthropic provider integration
- [ ] Add format conversion logic (Anthropic ↔ Gemini)
- [ ] Add error normalization (provider errors → standard error codes)
- [ ] Add usage tracking (in-memory for MVP)
- [ ] Add fallback logic with decision matrix
- [ ] Add structured output support with JSON validation
- [ ] Add timeout handling (30 second default)
- [ ] Test both providers manually
- [ ] Test fallback manually
- [ ] Test structured output manually
- [ ] Document any provider quirks discovered

---

## 9. Future Enhancements (Post-MVP)

### Phase 3+:
- Response caching (identical prompts → cached responses)
- Supabase-backed usage tracking (persistent across restarts)
- Circuit breaker pattern (disable failed provider for X minutes)
- Retry with exponential backoff
- Provider health checks (pre-flight test before actual request)
- A/B testing framework (compare provider quality)

---

## 10. Example Usage in Feature Code

**Bad (Direct Provider Import):**
```javascript
import Anthropic from '@anthropic-ai/sdk';  // ❌ NEVER DO THIS

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const response = await client.messages.create({...});
```

**Good (Adapter Pattern):**
```javascript
const { callLLM } = require('./lib/llm.js');  // ✅ CORRECT

const response = await callLLM({
  systemPrompt: 'You are an assessment tutor',
  messages: conversationHistory,
  maxTokens: 2000
});

if (!response.success) {
  return res.status(500).json({ error: response.error });
}

return res.status(200).json({ content: response.content });
```

---

**This spec must be implemented in Phase 0 before any LLM-dependent features are built.**
