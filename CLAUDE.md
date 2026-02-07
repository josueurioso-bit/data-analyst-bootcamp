# CLAUDE.md

This file provides guidance for AI assistants working on the Data Analyst Bootcamp codebase.

## Project Overview

An AI-powered prerequisite skills assessment platform for aspiring data analysts. It evaluates 6 foundational pillars through conversational dialogue using the Anthropic Claude API, captures assessment data with user consent, and surfaces patterns in student skill gaps to inform curriculum planning.

- **Live demo:** https://data-analyst-bootcamp.vercel.app
- **Phase:** MVP (Phase 1 complete)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS (both via CDN, no build step) |
| Backend | Vercel Serverless Functions (Node.js 18+) |
| AI | Anthropic Claude Haiku (claude-haiku-4-5-20251001) |
| Database | sql.js (SQLite compiled to WebAssembly) |
| Hosting | Vercel |

## Repository Structure

```
/
├── index.html              # Single-page React frontend (no build step)
├── privacy.html            # Privacy policy page
├── package.json            # Node.js config (only dependency: sql.js)
├── test-db.js              # Database testing utility
├── api/
│   ├── chat.js             # Main serverless endpoint — assessment conversations
│   ├── export-csv.js       # CSV export endpoint for assessment data
│   └── lib/
│       └── db.js           # SQLite database abstraction layer (singleton)
├── scripts/
│   ├── seed-data.js        # Generates 100 synthetic assessment records
│   └── verify-patterns.js  # Analyzes DB and outputs pattern statistics
└── docs/
    ├── DATA_ANALYST_CONTEXT.md  # Comprehensive dev guide and project context
    └── RATE_LIMITING.md         # Rate limiting strategy (not yet implemented)
```

## Commands

```bash
# Install dependencies
npm install

# Run locally (serverless functions)
vercel dev

# Generate synthetic demo data (100 records with intentional patterns)
npm run seed

# Analyze assessment patterns in the database
npm run analyze

# Test database functionality
npm run test-db
```

There is **no formal test suite**, linter, or formatter configured. Testing is manual via the scripts above.

## Architecture

### Request Flow

```
Browser (index.html) → POST /api/chat → Vercel Serverless → Claude API
                                                ↓
                                   (if assessment_complete && consent)
                                                ↓
                                        Save to SQLite DB
```

### Key Modules

- **`api/chat.js`** — Main handler. Validates requests, calls Claude API with a system prompt that defines the 6 pillars, detects assessment completion (JSON with `assessment_complete: true`), optionally saves results to DB. DB errors are caught and never break the quiz flow.
- **`api/lib/db.js`** — Singleton SQLite connection. Uses `sql.js` (WebAssembly). Prepared statements prevent SQL injection. DB path is `/tmp/assessments.db` on Vercel (ephemeral), `./assessments.db` locally.
- **`api/export-csv.js`** — GET endpoint returning all assessments as a downloadable CSV.
- **`index.html`** — Self-contained React SPA. No build step. Uses `useState`/`useEffect` for state. Includes chat UI, results dashboard with color-coded pillar scores, consent toggle, and reset functionality.

### Database Schema

Single table `assessments` with columns:
- `id` (INTEGER PRIMARY KEY)
- `session_id` (TEXT UNIQUE)
- `timestamp` (TEXT)
- Pillar scores: `numeracy` (0-10), `reading` (0-5), `computer` (0-10), `logic` (0-8), `communication` (0-5), `mindset` (0-7)
- `readiness_level` (1-5), `readiness_title` (TEXT)
- `user_ip_hash` (TEXT — SHA-256, never raw IP)
- `consent_given` (INTEGER — boolean)

## Assessment Domain

### 6 Foundation Pillars

1. **Basic Numeracy** (0-10) — Arithmetic, percentages, fractions
2. **Reading Comprehension** (0-5) — Following instructions, extracting info
3. **Computer Literacy** (0-10) — File management, shortcuts, troubleshooting
4. **Logical Thinking** (0-8) — Patterns, if-then logic, decomposition
5. **Communication Basics** (0-5) — Clear writing, simple explanations
6. **Learning Mindset** (0-7) — Self-direction, resilience, handling mistakes

### 5 Readiness Levels

1. Ready to Start
2. Ready with Quick Prep
3. Need Foundation Work
4. Need Comprehensive Prep
5. Not Yet Ready

### Seed Data Patterns (intentional)

The demo data in `scripts/seed-data.js` encodes deliberate patterns:
- 68% struggle with reading comprehension (primary insight)
- 62% struggle with communication (secondary insight)
- 45% logic, 30% numeracy, 25% computer, 20% mindset

## Development Guidelines

### Code Conventions

- **"TEACHING MOMENT" comments** appear throughout the codebase. These are intentional educational annotations — preserve them.
- **Module style:** `api/chat.js` uses ES module syntax (`import`); `api/lib/db.js` uses CommonJS (`require`). Match the existing style in each file.
- **Error handling:** DB and non-critical errors are caught and logged but never break the assessment flow. Follow this pattern.
- **Privacy-first:** IP addresses are SHA-256 hashed before storage. Never store raw IPs or sensitive user data.

### Security Considerations

- The `ANTHROPIC_API_KEY` is stored as a Vercel environment variable — never hardcode or expose it.
- All SQL queries use prepared statements (parameterized `?` placeholders).
- Consent is explicitly tracked; respect the `consent_given` flag.
- Rate limiting is documented in `docs/RATE_LIMITING.md` but **not yet implemented**.

### Important Constraints

- **Vercel `/tmp` is ephemeral.** Database data does not persist across deployments. This is a known MVP limitation.
- **No build step.** The frontend loads React and Tailwind from CDN. Do not introduce a bundler unless explicitly requested.
- **Single dependency.** The only npm dependency is `sql.js`. Keep dependencies minimal.
- **No formal tests.** If adding tests, discuss the framework choice first.

### Working Style Notes

The project owner is a non-technical "vibe coder" learning through building. When making changes:
- Don't break existing functionality
- Handle errors gracefully with clear messages
- Add educational comments where helpful
- Keep changes focused and incremental

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (production) | Claude API key for assessment conversations |
| `VERCEL` | Auto-set | Vercel sets this in production; controls DB path |

## Deployment

Deployed automatically via Vercel GitHub integration. To deploy manually:

1. Install Vercel CLI: `npm i -g vercel`
2. Set `ANTHROPIC_API_KEY` in Vercel project settings
3. Run `vercel --prod`

## Further Reading

- `docs/DATA_ANALYST_CONTEXT.md` — Full project context, philosophy, session history, and priority roadmap
- `docs/RATE_LIMITING.md` — Security strategy for API protection (planned, not implemented)
- `README.md` — User-facing project overview and getting started guide
