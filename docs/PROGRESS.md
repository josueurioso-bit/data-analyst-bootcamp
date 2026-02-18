# Project Progress Tracker
## Data School Readiness Engine — Build Log

**Repo:** https://github.com/josueurioso-bit/data-analyst-bootcamp
**Live:** https://data-analyst-bootcamp.vercel.app
**Builder:** Josue
**Last Updated:** February 17, 2026

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
Phases 0 and 1 are done. Phase 2 is nearly done (2H E2E test pending). Phase 3 (landing page) is done. Pick the next unchecked item below.

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
- **How it works:** Validates payload size (50KB max), messages array, message count (150 max), and role+content string types. Runs after rate limiting, before API call.

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

### [x] 1A. Add Phase B Column to Supabase
- **SQL run:** `ALTER TABLE assessments ADD COLUMN phase_b_results JSONB;`
- **Status:** Column added to Supabase assessments table

### [x] 1B. Update System Prompt for Two-Phase Assessment
- **Commit:** `21b0da6` — System prompt now covers Phase A + Phase B
- **Phase B covers:** Excel/Spreadsheets, SQL, Python, Data Visualization, Business Thinking
- **Each skill rated:** None → Beginner → Developing → Competent
- **Sprint routing logic included** (skills → recommended starting sprint 1-6)

### [x] 1C. Update Database Save Logic
- **Commit:** `21b0da6` — chat.js and db-supabase.js updated to save phase_b_results JSONB

### [x] 1D. Update Results Dashboard
- **Commit:** `21b0da6` — Results page now shows Data Skills Placement cards, Study Plan (starting sprint, est. completion, sprints skipped), and "Begin Sprint X" button
- **Note:** "Begin Sprint" button is present but non-functional until Phase 2

### [x] 1E. Trim Assessment to 22 Questions (~10 minutes)
- **Commit:** `9a9407e` — Cut from 60+ questions (30+ min) to 22 questions (~10 min)
- **Phase A:** 10 exact high-signal questions (down from 45) — numeracy 2, reading 1, computer literacy 2, logic 2, communication 1, mindset 2
- **Phase B:** 12 exact placement questions (down from 15-20) — Excel 2, SQL 2, Python 3, viz 2, business thinking 3
- **Scoring:** Scales proportionally to same maximums per pillar; JSON output format unchanged
- **Also:** Message limit bumped from 50 → 150; payload limit already at 50KB

### [x] 1F. End-to-End Test
- **Status:** Passed — full assessment completed manually on live site
- **Verified:**
  1. AI transitions naturally from Phase A to Phase B
  2. Results JSON includes both phases
  3. Data saves to Supabase (both phases)
  4. Results dashboard displays everything correctly
  5. Study plan makes sense based on answers
  6. Assessment completes in ~10 minutes

---

## Phase 2: Sprint System — In Progress

Phase 2 builds the Sprint 1 vertical slice: assessment results → sprint dashboard → workspace → submission → AI feedback. This proves the full product loop.

### [x] 2A. Supabase Schema — `sprints` + `submissions` tables
- **Action:** Run SQL in Supabase dashboard
- **Tables:** `sprints` (id, title, description, business_scenario, dataset_url, deliverables JSONB, rubric_id), `submissions` (id UUID, session_id, sprint_id, submission_text, submission_urls JSONB, score, feedback JSONB, status, submitted_at, evaluated_at)
- **RLS:** sprints read-only, submissions insert+read+update
- **Status:** Pending — SQL must be run in Supabase dashboard

### [x] 2B. Generate Sprint 1 Dataset
- **Files added:** `scripts/generate-sprint-1-data.js`, `data/sprint-1-deliveries.csv`
- **How it works:** Generates 5,000 rows with embedded patterns:
  - QuickMove carrier: ~35% late rate (PRIMARY finding)
  - Phoenix warehouse: ~28% late rate (SECONDARY finding)
  - Snow: correlates with delays but NOT root cause
  - Economy routes: NOT slower than Express
- **Verified:** Console output confirms all 4 patterns within expected ranges

### [x] 2C. Database Helper Functions
- **Files modified:** `api/lib/db-supabase.js`
- **Functions added:** `getSprintById()`, `insertSubmission()`, `getSubmissionById()`, `updateSubmission()`
- **How it works:** Same `supabaseRequest()` pattern as existing functions

### [x] 2D. Sprint 1 Rubric
- **Files added:** `api/lib/rubrics.js` (CommonJS)
- **How it works:** Sprint 1 rubric with 5 weighted categories (Business Framing 20%, Data Correctness 25%, Technical Execution 25%, Insight Quality 20%, Communication Clarity 10%). `validateScores()` recalculates weighted overall, overrides AI if >5 points off, sets passed = score >= 75.

### [x] 2E. API Endpoints
- **Files added:** `api/submit.js` (ESM), `api/evaluate.js` (ESM)
- **Files modified:** `api/lib/llm.js` (added temperature support)
- **submit.js:** CORS, rate limiting, input validation (200-5000 chars), saves to submissions table, returns submission_id
- **evaluate.js:** Loads submission, builds evaluation prompt with ground truth + rubric, calls LLM (temperature 0.3), parses JSON response (markdown fences + brace-counting fallback), validates scores server-side, saves feedback to DB

### [x] 2F. Frontend — View System + Sprint Dashboard + Workspace
- **Files modified:** `index.html`
- **View system:** `currentView` state drives 5 views: assessment, results, dashboard, sprint, feedback
- **Session ID:** Generated via `crypto.randomUUID()` on assessment completion, stored in localStorage
- **Sprint Dashboard:** 6 cards in a grid, Sprint 1 active/clickable, Sprints 2-6 locked with "Coming Soon"
- **Sprint Workspace:** Business scenario, deliverables checklist, CSV download button, submission form with character counter

### [x] 2G. Frontend — Submission Form + Feedback Display
- **Submission form:** Google Sheets URL (optional, validated), Executive Memo textarea (200-5000 chars, character counter), Submit button → POST /api/submit → POST /api/evaluate → spinner
- **Feedback display:** Overall score (large, color-coded: green >=75, yellow 60-74, red <60), 5 category score cards with feedback text, strengths + areas for improvement lists, pass/fail, "Try Again" button (score < 75)

### [ ] 2H. End-to-End Test
- **Status:** Pending — need to:
  1. Run Supabase SQL to create `sprints` and `submissions` tables
  2. Deploy to Vercel
  3. Complete full flow: assessment → dashboard → workspace → download CSV → submit memo → see feedback
  4. Verify submission row in Supabase

---

## Phase 3: Landing Page + Skip-Assessment Flow — Complete

A public-facing landing page and a way for returning users to skip the assessment and go straight to Sprint 1.

### [x] 3A. Create Landing Page
- **Commit:** `7ff97f5` — Add landing page and skip-assessment flow
- **Files added:** `index.html` (was `landing.html`, renamed in `e8a5e5b`)
- **How it works:** Static HTML + Tailwind CDN (no React, no build step). 5 sections:
  1. **Hero** — Headline, subhead, "Get Started" CTA scrolls to choice section
  2. **How It Works** — 3 step cards (Assess, Work Projects, Get Feedback) with SVG icons
  3. **Sprint Curriculum** — 2x3 grid matching dashboard style; Sprint 1 links to `app.html?view=dashboard`, Sprints 2-6 locked
  4. **Who It's For** — 4 audience cards (career switchers, self-taught, tutorial fatigue, apprenticeship prep)
  5. **Final CTA** — "Take the Assessment" (primary) → `app.html`, "Skip to Sprint 1" (secondary) → `app.html?view=dashboard`
- **Design:** Matches existing palette (purple-600/indigo-600 gradients, emerald accents, Georgia headings, system font body, mobile-first responsive)

### [x] 3B. Update App — URL Param Routing
- **Commit:** `7ff97f5` (same commit)
- **Files modified:** `app.html` (was `index.html`, renamed in `e8a5e5b`)
- **Changes:**
  - Added `skippedAssessment` state
  - `useEffect` on mount reads `?view=dashboard` or `?view=sprint` URL params
  - Generates session ID via `crypto.randomUUID()` if none exists (skip doesn't require assessment)
  - Cleans URL params with `history.replaceState` after routing
  - Dashboard "Back" nav shows "Back to Landing Page" → `index.html` when assessment was skipped, or "Back to Results" when it wasn't

### [x] 3C. Make Landing Page the Root URL
- **Commit:** `e8a5e5b` — Swap filenames so landing page is served at `/`
- **What changed:** Renamed `index.html` → `app.html` (React app) and `landing.html` → `index.html` (landing page). Updated all cross-links. Added `vercel.json`.
- **Verified:** Landing page loads at root URL on production

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `api/chat.js` | Main assessment API (ESM) — uses LLM adapter, saves to Supabase |
| `api/submit.js` | Sprint submission API (ESM) — saves student work to submissions table |
| `api/evaluate.js` | Sprint evaluation API (ESM) — AI scores submissions against rubric |
| `api/export-csv.js` | CSV download endpoint (CommonJS) — reads from Supabase |
| `api/lib/llm.js` | LLM adapter — wraps Anthropic API (swap providers here) |
| `api/lib/db-supabase.js` | Supabase database helper (CommonJS) — persistent storage |
| `api/lib/rubrics.js` | Sprint rubrics + score validation (CommonJS) |
| `api/lib/db.js` | Old SQLite helper (kept for reference, no longer used) |
| `api/lib/cors.js` | CORS helper — whitelists production + localhost origins |
| `api/lib/rateLimiter.js` | Rate limiting (CommonJS) — 60 req/hr per IP |
| `app.html` | Entire frontend (React + Tailwind via CDN, no build step) |
| `index.html` | Public landing page (static HTML + Tailwind CDN, no React) — served at root `/` |
| `vercel.json` | Vercel configuration |
| `privacy.html` | Privacy policy page |
| `.clauderules` | Rules Claude Code follows — read this first every session |
| `scripts/seed-data.js` | Generates 100 demo assessment records |
| `scripts/generate-sprint-1-data.js` | Generates Sprint 1 delivery dataset (5,000 rows) |
| `scripts/verify-patterns.js` | Analyzes database for demo patterns |
| `data/sprint-1-deliveries.csv` | Sprint 1 dataset (generated, 5,000 rows) |

## Environment Variables (set in Vercel dashboard)

| Variable | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | Set and working |
| `SUPABASE_URL` | Set and working |
| `SUPABASE_KEY` | Set and working |
