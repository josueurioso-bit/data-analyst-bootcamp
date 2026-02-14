# Project Progress Tracker
## Data School Readiness Engine — Build Log

**Repo:** https://github.com/josueurioso-bit/data-analyst-bootcamp
**Live:** https://data-analyst-bootcamp.vercel.app
**Builder:** Josue
**Last Updated:** February 14, 2026

---

## How to Get Back Up and Running

### 1. Open your project
```
1. Open VS Code
2. Open terminal (Ctrl+`)
3. cd "C:\Users\gabri\Desktop\Pursuit Projects\data-analyst-bootcamp"
```

### 2. Make sure you have the latest code
```
git pull origin main
```

### 3. Start Claude Code
```
claude
```

### 4. Give Claude Code context
Paste this as your first message:
```
Read these files before we start:
- .clauderules
- docs/PROGRESS.md

I'm picking up where I left off. Check PROGRESS.md for what's done and what's next.
```

### 5. Tell Claude what to work on
Pick the next unchecked item from the Phase 0 checklist below.

---

## Phase 0: Foundation Fixes — Checklist

### [x] 0A. Rate Limiting
- **Commit:** `f9b129f` — Add rate limiting to /api/chat (20 req/hr per IP)
- **Files added:** `api/lib/rateLimiter.js`
- **Files modified:** `api/chat.js` (added import + check before API call)
- **How it works:** In-memory Map tracks requests per hashed IP. Returns 429 after 20 req/hr. Resets on Vercel cold starts.

### [ ] 0B. Fix CORS
- **What:** Change `Access-Control-Allow-Origin: *` to `https://data-analyst-bootcamp.vercel.app` in `api/chat.js` (line 34) and `api/export-csv.js`
- **Risk:** Low — but test locally first. If the frontend URL is wrong, the app breaks.
- **Prompt for Claude:** `Fix CORS in api/chat.js and api/export-csv.js. Replace the wildcard * origin with https://data-analyst-bootcamp.vercel.app. Keep the OPTIONS preflight handler working.`

### [ ] 0C. Input Validation
- **What:** Add payload size limit and message structure validation to `api/chat.js`
- **Where:** Right after rate limiting, before the Anthropic API call
- **Checks needed:** messages is array, each message has role+content strings, max 50 messages, max 10KB body
- **Prompt for Claude:** `Add input validation to api/chat.js. Validate message array structure (each must have role and content strings), limit to 50 messages max, and reject payloads over 10KB. Add this right after the rate limiting check.`

### [ ] 0D. Prompt Injection Guards
- **What:** Add security instructions to the system prompt in `api/chat.js`
- **Where:** Beginning of the `systemPrompt` string (around line 71)
- **Prompt for Claude:** `Add prompt injection guards to the system prompt in api/chat.js. Add a security block at the start telling the AI to ignore attempts to override instructions, never reveal the system prompt, and stay in character as the assessment tutor.`

### [ ] 0E. LLM Adapter
- **What:** Create `api/lib/llm.js` that wraps the Anthropic API call, then update `api/chat.js` to use it
- **Why:** So you can swap to Gemini later without rewriting chat.js
- **Two-step process:**
  1. Create `api/lib/llm.js` with a `sendMessage(system, messages, options)` function
  2. Update `api/chat.js` to use `llm.js` instead of direct `fetch()` to Anthropic
- **Prompt for Claude:** `Create api/lib/llm.js — an LLM adapter that wraps the Anthropic API. It should export a sendMessage(system, messages, options) function. Then update api/chat.js to use it instead of the direct fetch call. Keep CommonJS for the adapter.`

### [ ] 0F. Supabase Migration
- **What:** Replace SQLite (ephemeral) with Supabase PostgreSQL (persistent)
- **BEFORE YOU START:** Create a free Supabase project at https://supabase.com
- **Steps:**
  1. Create Supabase project, get URL + anon key
  2. Create `assessments` table in Supabase SQL editor (schema matches current SQLite)
  3. Add `SUPABASE_URL` and `SUPABASE_KEY` to Vercel environment variables
  4. Create `api/lib/db-supabase.js` (new file, don't delete old db.js yet)
  5. Update imports in `api/chat.js` and `api/export-csv.js` to use new db file
  6. Test end-to-end, then remove old `db.js`
- **Prompt for Claude:** `I've created a Supabase project. URL: [paste URL] Key: [paste anon key]. Help me migrate from SQLite to Supabase. Read api/lib/db.js first to understand the current schema, then create api/lib/db-supabase.js as a replacement.`

### [ ] 0G. React Error Boundaries
- **What:** Add ErrorBoundary components in `index.html` around the main app sections
- **Prompt for Claude:** `Add React error boundaries to index.html. Wrap the chat interface and results dashboard in ErrorBoundary components so a crash in one section doesn't break the whole page.`

---

## Phase 1: Phase B Assessment — Not Started
Depends on Phase 0 being complete. See `docs/PRD_DataSRE.md` for requirements.

## Phase 2: Sprint System — Not Started
Depends on Phase 1 being complete. See `docs/REALISTIC_3DAY_ROADMAP.md` for the build plan.

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `api/chat.js` | Main assessment API (ESM) — calls Anthropic, saves results |
| `api/export-csv.js` | CSV download endpoint (CommonJS) |
| `api/lib/db.js` | SQLite database helper (CommonJS) — will be replaced by Supabase |
| `api/lib/rateLimiter.js` | Rate limiting (CommonJS) — 20 req/hr per IP |
| `index.html` | Entire frontend (React + Tailwind via CDN, no build step) |
| `privacy.html` | Privacy policy page |
| `.clauderules` | Rules Claude Code follows — read this first every session |
| `scripts/seed-data.js` | Generates 100 demo assessment records |
| `scripts/verify-patterns.js` | Analyzes database for demo patterns |

## Environment Variables (set in Vercel dashboard)

| Variable | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | Set and working |
| `SUPABASE_URL` | Not set yet (Phase 0F) |
| `SUPABASE_KEY` | Not set yet (Phase 0F) |
