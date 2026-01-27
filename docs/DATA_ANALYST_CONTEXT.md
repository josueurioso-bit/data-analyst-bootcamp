# DATA ANALYST BOOTCAMP - Development Context Bible

> **Purpose:** This document serves as the foundational context for any LLM (Claude, GPT, etc.) continuing development on this project. Read this ENTIRELY before making any changes.

**Last Updated:** January 27, 2026
**Project Owner:** Josue (Creative Director, Non-technical "Vibe Coder")
**Project Status:** MVP Complete, Demo Ready
**Demo Date:** January 28, 2026

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Philosophy & Approach](#2-philosophy--approach)
3. [Architecture & Tech Stack](#3-architecture--tech-stack)
4. [File Structure & Responsibilities](#4-file-structure--responsibilities)
5. [Database Schema & Data Flow](#5-database-schema--data-flow)
6. [Ethical Framework (Five C's)](#6-ethical-framework-five-cs)
7. [Current State & Progress](#7-current-state--progress)
8. [Known Issues & Technical Debt](#8-known-issues--technical-debt)
9. [Priority Roadmap](#9-priority-roadmap)
10. [Dashboard Integration](#10-dashboard-integration)
11. [Development Guidelines](#11-development-guidelines)
12. [Session History & Decisions](#12-session-history--decisions)
13. [Quick Reference](#13-quick-reference)

---

## 1. PROJECT OVERVIEW

### What This Is

An **analytics backend** for an AI-powered Data Analyst Bootcamp assessment tool. The system:

1. Delivers a conversational skills assessment via Claude Haiku API
2. Evaluates 6 foundational pillars (numeracy, reading, computer literacy, logic, communication, mindset)
3. Captures assessment results in a database (with user consent)
4. Exports data as CSV for analysis in a separate dashboard application
5. Implements ethical data collection using the Five C's framework

### The Problem Being Solved

> "I don't know which prerequisite skills students struggle with most."

Before this system, Josue had no data on where students needed help. Curriculum decisions were based on intuition, not evidence.

### The Solution

Track every assessment (with consent) → Reveal patterns → Make data-driven curriculum improvements.

**Key Insight from Demo Data:**
- 85% of students struggle with reading comprehension
- 75% struggle with communication skills
- This means: Prioritize literacy support BEFORE technical training

### Why This Project Matters (Portfolio Context)

This is a **portfolio piece** demonstrating:
- Full-stack development (serverless backend, static frontend)
- Ethical data practices (consent, privacy, anonymization)
- Data analysis pipeline (collection → export → visualization)
- AI integration (Claude API for conversational assessment)
- Real-world problem solving for education

---

## 2. PHILOSOPHY & APPROACH

### Josue's Working Style

Josue is a **non-technical creative director** who codes with heavy LLM assistance ("vibe coding"). This means:

- **Explain everything:** Don't assume technical knowledge. Teach concepts as you implement.
- **One feature at a time:** Complete vertical slices, not scattered partials.
- **Plan before building:** Always show the plan, get approval, then implement.
- **Avoid over-engineering:** Simple > clever. MVP > perfect.
- **Educational comments:** Add "TEACHING MOMENT" comments for key patterns.

### Development Principles

```
1. NEVER break existing functionality
2. Database errors should NOT crash the quiz
3. Users always get their results, even if we can't save them
4. Consent is respected - no data saved without explicit opt-in
5. IP addresses are NEVER stored raw - always hashed
6. Keep it simple - avoid abstractions until needed
```

### Before You Code ANYTHING

**CRITICAL:** Before making changes, you MUST:

1. **Analyze the codebase** - Read relevant files first
2. **Check GitHub repos** - Look for related issues or patterns
3. **Present a plan** - Show what you'll change and why
4. **Get approval** - Wait for Josue to say "go ahead"
5. **Test incrementally** - Verify each change works before moving on

This prevents wasted effort and ensures alignment.

---

## 3. ARCHITECTURE & TECH STACK

### Current Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | Static HTML + React (CDN) + Tailwind | Single `index.html` file |
| **Backend** | Vercel Serverless Functions (Node.js) | `/api/*.js` files |
| **Database** | SQLite via sql.js (WebAssembly) | File-based, ephemeral on Vercel |
| **AI** | Anthropic Claude Haiku 4.5 | Conversational assessment |
| **Deployment** | Vercel (auto-deploy from GitHub) | Connected to `main` branch |
| **Dashboard** | Separate React app | `dashboard-automation-web2` repo |

### Why These Choices?

**sql.js instead of better-sqlite3:**
- `better-sqlite3` requires native compilation (Visual Studio Build Tools)
- `sql.js` is pure JavaScript (SQLite compiled to WebAssembly)
- Works everywhere without build tools
- Trade-off: Slightly slower, but acceptable for MVP

**Vercel Serverless:**
- Zero configuration deployment
- Automatic HTTPS
- Environment variables for API keys
- Free tier sufficient for portfolio

**Static React (CDN):**
- No build step required
- Babel transpiles in-browser
- Fast iteration for prototyping
- Trade-off: Not production-optimal, but works for demo

### Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  /api/chat  │────▶│ Claude API  │
│  (React UI) │◀────│  (Vercel)   │◀────│  (Haiku)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                   (if consent=true)
                          │
                          ▼
                   ┌─────────────┐
                   │   SQLite    │
                   │ assessments │
                   │     .db     │
                   └──────┬──────┘
                          │
                          ▼
                   ┌─────────────┐     ┌─────────────┐
                   │ /api/export │────▶│  Dashboard  │
                   │    -csv     │     │    App      │
                   └─────────────┘     └─────────────┘
```

---

## 4. FILE STRUCTURE & RESPONSIBILITIES

```
./data-analyst-bootcamp/
│
├── index.html                 # Main quiz UI (React + Tailwind)
│                              # - Consent checkbox state
│                              # - Chat interface
│                              # - Results display
│
├── privacy.html               # Five C's privacy policy
│                              # - Plain language (8th grade level)
│                              # - Explains data practices
│
├── api/
│   ├── chat.js                # Main quiz endpoint (POST)
│   │                          # - Receives messages from frontend
│   │                          # - Calls Claude API
│   │                          # - Parses assessment results
│   │                          # - Saves to database (if consent)
│   │                          # - Returns AI response
│   │
│   ├── export-csv.js          # CSV download endpoint (GET)
│   │                          # - Queries all assessments
│   │                          # - Formats as CSV
│   │                          # - Sets download headers
│   │
│   └── lib/
│       └── db.js              # Database helper module
│                              # - Initializes sql.js
│                              # - Creates schema
│                              # - Provides CRUD functions
│                              # - Handles file persistence
│
├── scripts/
│   ├── seed-data.js           # Generates 100 demo records
│   │                          # - Intentional patterns (85% reading weakness)
│   │                          # - Probability-based distribution
│   │
│   └── verify-patterns.js     # Analyzes database patterns
│                              # - Shows weakness percentages
│                              # - Generates demo talking points
│
├── docs/
│   ├── DATA_ANALYST_CONTEXT.md  # THIS FILE - Development context
│   └── RATE_LIMITING.md         # Future rate limiting implementation
│
├── package.json               # Dependencies (sql.js)
├── test-db.js                 # Database verification script
├── assessments.csv            # Exported demo data (gitignored in practice)
├── assessments.db             # Local SQLite database (gitignored)
└── .gitignore                 # Excludes sensitive/generated files
```

### File Ownership Rules

| File | Who Modifies | Notes |
|------|--------------|-------|
| `api/chat.js` | Backend changes only | Core quiz logic - be careful |
| `api/lib/db.js` | Database schema changes | Will need updates for Postgres migration |
| `index.html` | UI changes only | Contains React components |
| `privacy.html` | Rarely | Only if policy changes |
| `scripts/*` | Development only | Not used in production |

---

## 5. DATABASE SCHEMA & DATA FLOW

### Current Schema (SQLite)

```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,      -- Unique identifier per assessment
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Pillar scores (different max values)
  numeracy_score INTEGER,               -- out of 10 (10 questions)
  reading_score INTEGER,                -- out of 5 (5 questions)
  computer_score INTEGER,               -- out of 10 (10 questions)
  logic_score INTEGER,                  -- out of 8 (8 questions)
  communication_score INTEGER,          -- out of 5 (5 questions)
  mindset_score INTEGER,                -- out of 7 (7 questions)

  -- Overall assessment
  readiness_level INTEGER,              -- 1-5 scale
  readiness_title TEXT,                 -- "Ready to Start", etc.

  -- Ethics & security
  user_ip_hash TEXT,                    -- SHA-256 hash (NOT raw IP)
  consent_given BOOLEAN DEFAULT 1       -- 1=consented, 0=opted out
);
```

### Readiness Levels

| Level | Title | Meaning |
|-------|-------|---------|
| 1 | Ready to Start | All/most pillars strong |
| 2 | Ready with Quick Prep | Mix of strong and developing |
| 3 | Need Foundation Work | Some significant gaps |
| 4 | Need Comprehensive Prep | Multiple gaps |
| 5 | Not Yet Ready | Major foundation work needed |

### Data Flow: Quiz Completion → Database

```javascript
// 1. Frontend sends message to /api/chat
POST /api/chat
{
  messages: [...conversationHistory],
  consentGiven: true  // or false
}

// 2. Backend calls Claude API, gets response
// 3. Backend checks if response contains:
{
  "assessment_complete": true,
  "pillars": { ... },
  "readiness_level": 2,
  ...
}

// 4. If assessment_complete AND consentGiven === true:
//    → Insert into database
//    → Log success

// 5. Always return AI response to frontend
//    (quiz works even if DB fails)
```

### CSV Export Format

```csv
session_id,timestamp,numeracy_score,reading_score,computer_score,logic_score,communication_score,mindset_score,readiness_level,readiness_title
session_123,2026-01-27 10:30:00,8,2,7,5,3,6,2,Ready with Quick Prep
```

**Important:** The dashboard app currently expects different columns (`metric`, `value`, `date`). See [Dashboard Integration](#10-dashboard-integration) for the compatibility issue.

---

## 6. ETHICAL FRAMEWORK (FIVE C'S)

This project implements the **Five C's of Ethical Data Collection**:

### 1. Consent
- **Implementation:** Checkbox on quiz page (checked by default = opt-out model)
- **Code:** `index.html` - `consentGiven` state variable
- **Backend:** `api/chat.js` - only saves if `consentGiven === true`

### 2. Clarity
- **Implementation:** `privacy.html` written at 8th-grade reading level
- **No legal jargon** - plain language explanations
- **Explains:** What we collect, why, how it's protected

### 3. Control
- **Implementation:** Unchecking consent doesn't prevent quiz access
- **User gets:** Full assessment experience regardless of consent choice
- **Only difference:** Data saved or not saved

### 4. Compensation
- **Implementation:** Users benefit from improved curriculum
- **Trade:** Anonymous data → better educational resources
- **Free:** No monetary exchange, mutual benefit

### 5. Consequence Awareness
- **Implementation:** Privacy policy explains:
  - IP hashing (can't be reversed)
  - Anonymity (no names/emails stored)
  - Aggregate use only (no individual targeting)
  - Can't delete specific records (because anonymous)

### Privacy Code Patterns

```javascript
// IP Hashing (one-way, irreversible)
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

// Consent Check (explicit boolean comparison)
if (consentGiven === true) {
  // Save to database
} else {
  console.log('Assessment NOT saved (user opted out)');
}

// Graceful Degradation (DB failure doesn't break quiz)
try {
  await insertAssessment(data);
} catch (dbError) {
  console.error('Database error (quiz still works):', dbError);
  // Don't throw - let quiz continue
}
```

---

## 7. CURRENT STATE & PROGRESS

### Completed (MVP)

| Feature | Status | Notes |
|---------|--------|-------|
| Quiz UI with chat interface | ✅ Done | React + Tailwind |
| Claude API integration | ✅ Done | Haiku 4.5 model |
| SQLite database | ✅ Done | sql.js (WebAssembly) |
| Assessment data capture | ✅ Done | All 6 pillars + readiness |
| CSV export endpoint | ✅ Done | `/api/export-csv` |
| Consent checkbox | ✅ Done | Opt-out model |
| Privacy policy page | ✅ Done | Five C's framework |
| IP hashing | ✅ Done | SHA-256 |
| Seed data generator | ✅ Done | 100 records with patterns |
| Pattern analysis script | ✅ Done | Shows demo insights |
| Vercel deployment | ✅ Done | Auto-deploy from GitHub |

### Demo Data Statistics

```
Total Assessments: 101
Reading Weakness:  85% (primary finding)
Communication:     75% (secondary finding)
Logic Weakness:    66%
Numeracy Weakness: 41%
Mindset Weakness:  33%
Computer Weakness: 29%
```

### What's NOT Done

| Feature | Status | Priority |
|---------|--------|----------|
| Vercel Postgres migration | ❌ Not started | HIGH |
| Rate limiting | ❌ Not started | HIGH |
| Dashboard CSV compatibility | ❌ Not started | HIGH |
| TypeScript conversion | ❌ Not started | LOW |
| Admin panel | ❌ Not started | LOW |
| Real-time visualization | ❌ Not started | LOW |

---

## 8. KNOWN ISSUES & TECHNICAL DEBT

### CRITICAL: Database Persistence on Vercel

**Problem:** SQLite uses `/tmp/assessments.db` on Vercel, which is **ephemeral**.
- Data can be wiped at any time
- Resets on every deployment
- Not suitable for production data collection

**Solution:** Migrate to Vercel Postgres (see [Priority Roadmap](#9-priority-roadmap))

**Workaround for Demo:** Use local CSV export with seed data

---

### CRITICAL: Dashboard CSV Compatibility

**Problem:** The dashboard app (`dashboard-automation-web2`) expects columns:
```
metric, value, date
```

But the bootcamp exports:
```
session_id, timestamp, numeracy_score, reading_score, ...
```

**Impact:** Dashboard shows "Missing required columns" error

**Solutions (choose one):**
1. **Update dashboard** to accept bootcamp CSV format (preferred)
2. **Transform CSV** in export endpoint to match dashboard format
3. **Create adapter** that converts between formats

**Recommendation:** Update dashboard to be more flexible with column detection

---

### HIGH: No Rate Limiting

**Problem:** API key could be abused by spamming `/api/chat`
- Each Claude API call costs money
- No protection against malicious users

**Current Mitigation:** None (acceptable for portfolio demo)

**Solution:** Implement Vercel KV or Upstash rate limiting (see `docs/RATE_LIMITING.md`)

---

### MEDIUM: No Error Boundary in React

**Problem:** JavaScript errors can crash the entire UI

**Solution:** Add React Error Boundary component

---

### LOW: No TypeScript

**Problem:** No type safety, harder to maintain at scale

**Solution:** Convert to TypeScript (post-MVP)

---

## 9. PRIORITY ROADMAP

### Phase 1: Post-Demo Stabilization (Week 1)

#### 1.1 Vercel Postgres Migration
**Goal:** Persistent database that survives deployments

**Steps:**
1. Create Vercel Postgres database (free tier)
2. Update `api/lib/db.js` to use `@vercel/postgres`
3. Migrate schema (same structure)
4. Update environment variables
5. Test data persistence across deploys

**Estimated Effort:** 2-3 hours

#### 1.2 Rate Limiting Implementation
**Goal:** Protect API from abuse

**Steps:**
1. Add Vercel KV or Upstash Redis
2. Implement rate limit check in `/api/chat.js`
3. Limit: 20 requests per IP per hour
4. Return 429 status when exceeded

**Estimated Effort:** 1-2 hours

#### 1.3 Dashboard CSV Compatibility
**Goal:** Bootcamp CSV works with dashboard app

**Options:**
- **Option A:** Modify dashboard to accept flexible columns
- **Option B:** Add column mapping in bootcamp export
- **Option C:** Create data transformation layer

**Estimated Effort:** 1-3 hours depending on approach

---

### Phase 2: Production Readiness (Week 2-3)

- Add comprehensive error handling
- Implement request logging
- Add health check endpoint
- Set up monitoring/alerts
- Document API endpoints

---

### Phase 3: Feature Enhancements (Month 2+)

- Admin dashboard for viewing data
- Real-time analytics visualization
- Personalized recommendations based on scores
- Email results to users (with consent)
- Benchmark comparisons ("You scored better than 70%")

---

## 10. DASHBOARD INTEGRATION

### The Two Repositories

| Repo | Purpose | Status |
|------|---------|--------|
| `data-analyst-bootcamp` | Quiz + data collection | ✅ Working |
| `dashboard-automation-web2` | Data visualization | ⚠️ CSV format mismatch |

### Current CSV Format (Bootcamp)

```csv
session_id,timestamp,numeracy_score,reading_score,computer_score,logic_score,communication_score,mindset_score,readiness_level,readiness_title
```

### Expected CSV Format (Dashboard)

```csv
metric,value,date
```

### Integration Strategy

**Recommended Approach:** Update dashboard to be schema-flexible

The dashboard should:
1. Auto-detect column types (numeric vs text)
2. Let user select which columns to visualize
3. Not require specific column names

**Alternative:** Transform bootcamp data to dashboard format

```javascript
// Example transformation
const dashboardFormat = bootcampData.flatMap(row => [
  { metric: 'numeracy', value: row.numeracy_score, date: row.timestamp },
  { metric: 'reading', value: row.reading_score, date: row.timestamp },
  // ... etc
]);
```

### Testing Integration

1. Export CSV from bootcamp: `curl https://data-analyst-bootcamp.vercel.app/api/export-csv`
2. Attempt import in dashboard
3. Document exact error message
4. Fix based on error

---

## 11. DEVELOPMENT GUIDELINES

### Before Starting Any Work

```
1. Read this entire document
2. Check GitHub issues on both repos
3. Analyze existing code structure
4. Identify potential conflicts
5. Present plan to Josue
6. Get explicit approval
7. Then (and only then) start coding
```

### Code Style

```javascript
// Use clear, descriptive names
function getUserConsentStatus() {}  // Good
function gcs() {}                   // Bad

// Add teaching comments for non-obvious patterns
// TEACHING MOMENT: Prepared statements prevent SQL injection
db.run('INSERT INTO table VALUES (?, ?)', [val1, val2]);

// Handle errors gracefully
try {
  await riskyOperation();
} catch (error) {
  console.error('Context:', error.message);
  // Don't crash - degrade gracefully
}

// Keep functions small (<30 lines)
// Single responsibility principle
```

### Git Workflow

```bash
# Always pull latest first
git pull origin main

# Create descriptive commits
git commit -m "Add rate limiting to /api/chat endpoint

- Implement Vercel KV for request counting
- Limit: 20 requests/hour per IP
- Return 429 with retry-after header

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to main (auto-deploys to Vercel)
git push origin main
```

### Testing Checklist

Before any PR/commit:
- [ ] Quiz still loads and works
- [ ] Consent checkbox toggles correctly
- [ ] Privacy policy link works
- [ ] CSV export downloads successfully
- [ ] No console errors in browser
- [ ] Vercel build succeeds

---

## 12. SESSION HISTORY & DECISIONS

### Session 1: Database Foundation

**Date:** January 27, 2026
**Duration:** ~2 hours
**Goal:** Implement SQLite database to capture assessment results

**Key Decisions:**
- Used `sql.js` instead of `better-sqlite3` (no build tools needed)
- Schema includes all 6 pillars + readiness level
- IP addresses hashed with SHA-256
- Database errors don't break quiz (graceful degradation)

**Files Created:**
- `package.json`
- `api/lib/db.js`
- `api/export-csv.js`
- `docs/RATE_LIMITING.md`
- `test-db.js`

**Files Modified:**
- `api/chat.js` (added database save logic)
- `.gitignore` (added database files)

---

### Session 2: Seed Data + Patterns

**Date:** January 27, 2026
**Duration:** ~1 hour
**Goal:** Generate demo dataset with intentional patterns

**Key Decisions:**
- 100 demo records with probability-based distribution
- Intentional weakness patterns for demo narrative
- Reading (85%) and Communication (75%) as primary findings

**Files Created:**
- `scripts/seed-data.js`
- `scripts/verify-patterns.js`
- `assessments.csv` (exported)

**Demo Insight Generated:**
> "85% of students struggle with reading comprehension. Without this data, I was guessing what to teach."

---

### Session 3: Consent & Privacy

**Date:** January 27, 2026
**Duration:** ~1 hour
**Goal:** Implement Five C's ethical framework

**Key Decisions:**
- Opt-out model (checkbox checked by default)
- Privacy policy at 8th-grade reading level
- Consent state passed to API in every request
- Backend only saves if `consentGiven === true`

**Files Created:**
- `privacy.html`

**Files Modified:**
- `index.html` (added consent checkbox + state)

---

### Deployment

**Date:** January 27, 2026
**Commit:** `7361ace`
**Message:** "Add analytics backend with ethical data collection"

**Deployed To:** `https://data-analyst-bootcamp.vercel.app`

---

## 13. QUICK REFERENCE

### URLs

| Environment | URL |
|-------------|-----|
| Production | https://data-analyst-bootcamp.vercel.app |
| Privacy Policy | https://data-analyst-bootcamp.vercel.app/privacy.html |
| CSV Export | https://data-analyst-bootcamp.vercel.app/api/export-csv |
| GitHub Repo | https://github.com/josueurioso-bit/data-analyst-bootcamp |
| Dashboard Repo | https://github.com/josueurioso-bit/dashboard-automation-web2 |

### Local Commands

```bash
# Start local dev server
vercel dev

# Run database test
node test-db.js

# Generate seed data
node scripts/seed-data.js

# Analyze patterns
node scripts/verify-patterns.js

# Export CSV locally
curl http://localhost:3000/api/export-csv > assessments.csv
```

### Environment Variables (Vercel)

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API authentication |
| `DEMO_MODE` | (Optional) Disable live quiz for demo |

### Key Code Locations

| Feature | File | Line/Function |
|---------|------|---------------|
| Consent state | `index.html` | `useState(true)` for `consentGiven` |
| Consent check | `api/chat.js` | `if (consentGiven === true)` |
| IP hashing | `api/chat.js` | `hashIp()` function |
| Database init | `api/lib/db.js` | `initDb()` function |
| CSV export | `api/export-csv.js` | `handler()` function |
| Seed patterns | `scripts/seed-data.js` | `WEAKNESS_TARGETS` object |

---

## FINAL NOTES FOR FUTURE LLM SESSIONS

1. **Always read this document first** - It contains critical context
2. **Analyze before building** - Check both repos for issues
3. **Plan before coding** - Present approach, get approval
4. **Test incrementally** - Verify each change works
5. **Preserve functionality** - Never break existing features
6. **Document decisions** - Update this file with new choices

**Josue's Contact Style:**
- Non-technical explanations preferred
- Teaching moments appreciated
- One feature at a time
- Clear progress updates

**Project Philosophy:**
> "MVP > Perfection. Ship > Polish. Simple > Clever."

---

*This document should be updated after each significant development session.*
