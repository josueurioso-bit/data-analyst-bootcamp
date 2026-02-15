# Project Progress Tracker
## Data School Readiness Engine — Build Log

**Repo:** https://github.com/josueurioso-bit/data-analyst-bootcamp
**Live:** https://data-analyst-bootcamp.vercel.app
**Builder:** Josue
**Last Updated:** February 15, 2026

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
Phase 0 is done! Pick the next unchecked item from the Phase 1 checklist below.

---

## Phase 0: Foundation Fixes — Checklist

### [x] 0A. Rate Limiting
- **Commit:** `f9b129f` — Add rate limiting to /api/chat (20 req/hr per IP)
- **Files added:** `api/lib/rateLimiter.js`
- **Files modified:** `api/chat.js` (added import + check before API call)
- **How it works:** In-memory Map tracks requests per hashed IP. Returns 429 after 20 req/hr. Resets on Vercel cold starts.

### [x] 0B. Fix CORS
- **Commit:** `dfc7ef5` — Fix CORS: replace wildcard * with origin whitelist
- **Files added:** `api/lib/cors.js` (shared CORS helper)
- **Files modified:** `api/chat.js`, `api/export-csv.js`
- **How it works:** Whitelists production URL + localhost/127.0.0.1 for local dev. Rejects all other origins.

### [x] 0C. Input Validation
- **Commit:** `3e6a4d4` — Add input validation to /api/chat
- **Files modified:** `api/chat.js`
- **How it works:** Validates payload size (10KB max), messages array, message count (50 max), and role+content string types. Runs after rate limiting, before API call.

### [x] 0D. Prompt Injection Guards
- **Commit:** `fd091b8` — Add prompt injection guards to system prompt
- **Files modified:** `api/chat.js`
- **How it works:** Security block at start of system prompt prevents override attempts, prompt leaking, code generation, and off-topic manipulation.

### [x] 0E. LLM Adapter
- **Commit:** `5b10351` — Add LLM adapter and rewire chat.js
- **Files added:** `api/lib/llm.js`
- **Files modified:** `api/chat.js`
- **How it works:** `sendMessage(system, messages, options)` wraps Anthropic API. chat.js uses adapter instead of direct fetch. Enables future Gemini fallback.

### [x] 0F. Supabase Migration
- **Commit:** `9df8939` — Migrate from SQLite to Supabase PostgreSQL
- **Files added:** `api/lib/db-supabase.js`
- **Files modified:** `api/chat.js`, `api/export-csv.js`
- **How it works:** REST API calls to Supabase PostgreSQL. Same interface as old db.js. RLS enabled (INSERT + SELECT only). Old db.js kept for reference.
- **Note:** Rate limit bumped to 60 req/hr (`2dec584`) so users can complete the full 45-question assessment.
- **Pending:** End-to-end test (complete full assessment and verify data saves to Supabase).

### [x] 0G. React Error Boundaries
- **Commit:** `da49ac5` — Add React error boundaries to chat and results dashboard
- **Files modified:** `index.html`
- **How it works:** ErrorBoundary class component wraps chat messages and results dashboard. Crash in one section shows recovery UI, doesn't break the whole page.

---

## Phase 1: Phase B Assessment — In Progress

Phase B adds a data skills diagnostic after the existing Phase A foundation assessment. It evaluates 5 skill areas (Excel, SQL, Python, Data Viz, Business Thinking) and generates a personalized study plan that routes users to their starting sprint.

### [ ] 1A. Add Phase B Column to Supabase
- **What:** Add `phase_b_results JSONB` column to the `assessments` table
- **SQL:** `ALTER TABLE assessments ADD COLUMN phase_b_results JSONB;`
- **Why:** Stores Phase B skill levels, recommended sprint, and study plan alongside Phase A results

### [ ] 1B. Update System Prompt for Two-Phase Assessment
- **What:** Expand the system prompt in `api/chat.js` to include Phase B assessment after Phase A
- **Phase B covers:** Excel/Spreadsheets, SQL, Python, Data Visualization, Business Thinking
- **Each skill rated:** None → Beginner → Developing → Competent
- **Key:** Natural transition from Phase A → Phase B ("Great, now let's see where you are with data skills...")
- **Output:** Updated JSON with both Phase A pillar scores AND Phase B skill levels + study plan

### [ ] 1C. Update Database Save Logic
- **What:** Update `api/chat.js` to save Phase B results to the new JSONB column
- **Where:** The assessment-complete detection block in chat.js
- **Update:** `api/lib/db-supabase.js` insertAssessment to include phase_b_results

### [ ] 1D. Update Results Dashboard
- **What:** Expand the results section in `index.html` to show Phase B skill breakdown + study plan
- **New sections:** Skill level cards (Excel, SQL, Python, etc.), personalized study plan, "Begin Sprint" button
- **Keep:** Existing Phase A readiness level and pillar cards

### [ ] 1E. End-to-End Test
- **What:** Complete a full Phase A + Phase B assessment and verify:
  1. AI transitions naturally from Phase A to Phase B
  2. Results JSON includes both phases
  3. Data saves to Supabase (both phases)
  4. Results dashboard displays everything correctly
  5. Study plan makes sense based on answers

---

## Phase 2: Sprint System — Not Started
Depends on Phase 1 being complete. See `docs/REALISTIC_3DAY_ROADMAP.md` for the build plan.

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `api/chat.js` | Main assessment API (ESM) — uses LLM adapter, saves to Supabase |
| `api/export-csv.js` | CSV download endpoint (CommonJS) — reads from Supabase |
| `api/lib/llm.js` | LLM adapter — wraps Anthropic API (swap providers here) |
| `api/lib/db-supabase.js` | Supabase database helper (CommonJS) — persistent storage |
| `api/lib/db.js` | Old SQLite helper (kept for reference, no longer used) |
| `api/lib/cors.js` | CORS helper — whitelists production + localhost origins |
| `api/lib/rateLimiter.js` | Rate limiting (CommonJS) — 60 req/hr per IP |
| `index.html` | Entire frontend (React + Tailwind via CDN, no build step) |
| `privacy.html` | Privacy policy page |
| `.clauderules` | Rules Claude Code follows — read this first every session |
| `scripts/seed-data.js` | Generates 100 demo assessment records |
| `scripts/verify-patterns.js` | Analyzes database for demo patterns |

## Environment Variables (set in Vercel dashboard)

| Variable | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | Set and working |
| `SUPABASE_URL` | Set and working |
| `SUPABASE_KEY` | Set and working |
