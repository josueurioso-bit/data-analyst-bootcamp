# Product Requirements Document
## Data School Readiness Engine

**Version:** 1.0
**Author:** Josue (Creative Director)
**Date:** February 13, 2026
**Status:** Draft

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Product Vision & Philosophy
4. Target Users
5. Existing Asset: Milestone 0 Assessment (What We're Building On)
6. Assessment Engine Updates
7. Core Product Loop
8. Sprint Curriculum System
9. Feature Requirements (MVP)
10. LLM Integration Strategy
11. Technical Architecture
12. Data Model
13. Success Metrics
14. Phased Rollout Plan
15. Non-Goals (MVP)
16. Open Questions & Decisions
17. Appendix: Sprint Details

---

## 1. Executive Summary

The Data School Readiness Engine is a free, self-paced web application that simulates a data analyst apprenticeship. It guides users from skill diagnosis through six project-based sprints, producing portfolio-ready case studies at each stage. The product exists to prove that people without college degrees can become job-ready junior analysts through structured, project-first learning — without paying thousands for a traditional bootcamp.

This PRD defines how to evolve the existing Milestone 0 Assessment tool (currently live at data-analyst-bootcamp.vercel.app) into the full bootcamp platform. Rather than building from scratch, we are expanding what already works.

---

## 2. Problem Statement

**For the learner:** Career switchers without degrees face a brutal catch-22. Employers want experience, bootcamps cost $5,000–$15,000, and free resources are scattered with no structure. They don't know where to start, what skills they actually have, or how to prove competence to an employer.

**For the creator (Josue):** This product is simultaneously a personal learning engine and a public proof-of-work system. It demonstrates full-stack product thinking, ethical data practices, and AI integration — while preparing for a Data School-style apprenticeship.

**What exists today:** A working conversational assessment tool that evaluates six foundational pillars (numeracy, reading, computer literacy, logic, communication, mindset). It captures results with user consent, exports data as CSV, and runs on Vercel for free. It does NOT yet assess data analyst skills, assign projects, collect submissions, or generate portfolios.

**The gap:** The current tool ends at diagnosis. Users get a readiness score and then... nothing. There's no "what to do next" system. The full product closes this gap by turning diagnosis into action through structured sprints.

---

## 3. Product Vision & Philosophy

This is NOT a content course. This is a **project pipeline simulator.**

Every sprint simulates real analyst work: a business problem, a real dataset, defined deliverables, submission, feedback, and a public artifact. The product teaches by requiring output, not by delivering lectures.

**Core principles:**

- **Project-first, not lesson-first.** Learning happens through building, not watching.
- **Output-focused.** Every sprint produces a portfolio piece. If it doesn't ship a public artifact, it doesn't belong in the curriculum.
- **Structured AI use only.** The LLM is a coach, not a crutch. It evaluates rubrics, answers targeted questions, and assists with portfolio writing. It does not do the student's work.
- **Minimal theory.** Concepts are introduced only when a sprint requires them.
- **Real business framing.** Every project is wrapped in a realistic business scenario with stakeholders, constraints, and consequences.
- **Portfolio-driven.** The system's north star is the number of publicly published case studies.
- **Low operational overhead.** The entire platform must be operable by one person at zero ongoing cost.

---

## 4. Target Users

### Phase 1: Solo Builder (Current)

The primary user is Josue — using the product to prepare for a Data School apprenticeship while simultaneously building it as a portfolio project. This means every feature must work for one person first.

### Phase 2: Ladder Model (Future)

The product opens to external users who share these characteristics:

- Career switchers from non-technical backgrounds (retail, trades, food service, film production)
- No college degree or irrelevant degree
- Inconsistent schedules — can't commit to a fixed cohort
- Need structured guidance but can't afford $10K+ bootcamps
- Motivated by tangible proof-of-work (published portfolios, not certificates)

---

## 5. Existing Asset: Milestone 0 Assessment

### What We Have

The current deployed application (GitHub: josueurioso-bit/data-analyst-bootcamp) includes:

**Working features:**
- Conversational AI assessment via Claude Haiku API
- Evaluation of 6 foundational pillars (45 questions total)
- 5-level readiness scoring system
- Results dashboard with color-coded pillar breakdown
- SQLite database with ethical data collection (Five C's framework)
- User consent checkbox (opt-out model)
- Privacy policy page written at 8th-grade reading level
- IP hashing via SHA-256
- CSV export endpoint for analytics
- Seed data generator (100 demo records with intentional patterns)
- Deployed on Vercel with auto-deploy from GitHub

**Current tech stack:**
- Frontend: Static HTML + React 18 (CDN) + Tailwind CSS
- Backend: Vercel Serverless Functions (Node.js)
- Database: SQLite via sql.js (WebAssembly)
- AI: Anthropic Claude Haiku 4.5
- Hosting: Vercel (free tier)

**Known limitations:**
- SQLite on Vercel is ephemeral (data lost on redeploy)
- No rate limiting on API endpoint
- Dashboard CSV format doesn't match the separate dashboard app
- No TypeScript
- No React error boundaries

### What We're Keeping

The entire existing application becomes the entry point to the full bootcamp. The assessment conversation, results dashboard, consent system, privacy policy, and data collection pipeline all carry forward. We are not rebuilding any of this.

### What Changes

The assessment needs to expand from testing foundational skills to also diagnosing data analyst skill gaps. The results page needs to route users into the sprint system instead of ending the experience. The API integration needs to migrate from Anthropic to a free alternative to eliminate ongoing cost.

---

## 6. Assessment Engine Updates

### 6.1 Two-Phase Assessment Model

The updated assessment has two distinct phases:

**Phase A — Foundation Check (Existing)**

This is the current Milestone 0 assessment, unchanged in structure. It evaluates prerequisite skills that a person needs before they can even begin learning data analysis.

Pillars (45 questions):
- Basic Numeracy (10 questions)
- Reading Comprehension (5 questions)
- Computer Literacy (10 questions)
- Logical Thinking (8 questions)
- Communication Basics (5 questions)
- Learning Mindset (7 questions)

Scoring produces a Readiness Level (1–5). Users at Level 1 or 2 proceed immediately to Phase B. Users at Level 3–5 receive a prep plan with specific resources and an estimated timeline before they should attempt Phase B.

**Phase B — Data Skills Diagnostic (New)**

This phase assesses the student's current data analyst skill level to determine which sprint they should start on. This is NOT a pass/fail gate — it's a placement tool.

Skill areas assessed:
- Excel/Spreadsheets (data cleaning, formulas, pivot tables, basic charting)
- SQL (SELECT, WHERE, JOINs, GROUP BY, aggregate functions)
- Python (basic syntax, loops, pandas awareness, automation concepts)
- Data Visualization (chart selection, design principles, storytelling with data)
- Business Thinking (framing questions, interpreting results, making recommendations)

Each skill area scored on a 4-level scale:
- **None** — No experience. Start from Sprint 1.
- **Beginner** — Has seen it, can't do it independently.
- **Developing** — Can do basics with guidance.
- **Competent** — Can work independently on standard tasks.

### 6.2 Assessment Output

The combined assessment produces a structured JSON result:

```json
{
  "assessment_complete": true,
  "phase_a": {
    "readiness_level": 2,
    "readiness_title": "Ready with Quick Prep",
    "pillars": {
      "numeracy": { "score": 8, "level": "STRONG", "color": "green" },
      "reading": { "score": 3, "level": "ADEQUATE", "color": "yellow" },
      "computer": { "score": 9, "level": "CONFIDENT", "color": "green" },
      "logic": { "score": 6, "level": "GOOD", "color": "green" },
      "communication": { "score": 4, "level": "GOOD", "color": "green" },
      "mindset": { "score": 6, "level": "EXCELLENT", "color": "green" }
    }
  },
  "phase_b": {
    "recommended_start_sprint": 3,
    "skills": {
      "excel": { "level": "Competent", "can_skip": true },
      "sql": { "level": "Beginner", "can_skip": false },
      "python": { "level": "None", "can_skip": false },
      "visualization": { "level": "Developing", "can_skip": false },
      "business_thinking": { "level": "Developing", "can_skip": false }
    }
  },
  "custom_study_plan": {
    "skip_sprints": [1, 2],
    "focus_sprints": [3, 4, 5, 6],
    "estimated_completion": "8 weeks",
    "priority_skills": ["SQL fundamentals", "Python basics"]
  }
}
```

### 6.3 Custom Study Plan Generation

Based on the Phase B results, the system generates a personalized study plan. This is one of the four permitted LLM use cases. The plan specifies which sprints to complete, which to skip (if skills are already competent), and what order to tackle them in.

The study plan is the bridge between assessment and action. It replaces the current dead-end results page with a clear "here's what you do next" roadmap.

---

## 7. Core Product Loop

Every user interaction follows this cycle. This is the backbone of the entire product:

```
1. DIAGNOSE        → Assessment Engine (Phase A + Phase B)
2. ASSIGN SPRINT   → Custom Study Plan routes to appropriate sprint
3. EXECUTE PROJECT → Student works on real business problem with real data
4. SUBMIT WORK     → Upload links to completed deliverables
5. GET FEEDBACK    → Rubric-based AI evaluation with structured scores
6. PUBLISH         → System generates portfolio case study from submission
7. UNLOCK NEXT     → Progression to the next sprint in the study plan
```

This loop repeats for each sprint. The system enforces the loop — you cannot skip to feedback without submitting, and you cannot unlock the next sprint without completing feedback review.

---

## 8. Sprint Curriculum System

### Structure

The bootcamp consists of 6 sprints. Each sprint lasts approximately 2 weeks for a student working 5–10 hours per week. Sprints are sequential by default but the custom study plan can modify the starting point.

Each sprint contains:
- A realistic business scenario with named stakeholders
- A downloadable dataset (CSV, Excel, or SQL dump)
- Clearly defined deliverables with a rubric preview
- Minimum required skills listed upfront
- An "Ask Coach" LLM assistant scoped to that sprint's topic
- A submission form for completed work
- A rubric-based AI feedback system
- An auto-generated portfolio case study page

### Sprint Sequence

| Sprint | Focus | Business Scenario | Primary Deliverable |
|--------|-------|-------------------|---------------------|
| 1 | Excel: Operational Analysis | Logistics company losing money on late deliveries | Cleaned spreadsheet + pivot analysis + executive memo |
| 2 | Excel: Revenue Analysis | Retail chain with high sales but stagnant profit | Margin breakdown + category insights + recommendation |
| 3 | SQL: Core Metrics | Subscription company analyzing churn | 10 SQL queries + metrics summary |
| 4 | SQL: Joins & Segmentation | E-commerce revenue concentration analysis | Joined analysis + executive answers |
| 5 | Python: Automation | Operations team manually generating weekly reports | Python script + automated output + GitHub repo |
| 6 | Dashboard: Executive KPIs | Leadership needs KPI visibility | Public dashboard + annotated walkthrough + case study |

Full sprint details are in the appendix.

---

## 9. Feature Requirements (MVP)

### 9.1 Onboarding Page

**What it does:** Explains the product mission, sets expectations, and routes to the assessment.

**Requirements:**
- Clear value proposition: "Get apprenticeship-ready in 6 sprints"
- Explanation of how the sprint system works (visual diagram preferred)
- Estimated time commitment (6 sprints × ~2 weeks = ~12 weeks total)
- "Start Assessment" call-to-action that launches the conversational assessment
- No login required (assessment is anonymous by default)

### 9.2 Updated Assessment Engine

**What it does:** Conducts Phase A (foundation check) and Phase B (data skills diagnostic) as a single conversational flow.

**Requirements:**
- Reuse existing chat UI and conversation system from Milestone 0
- Phase A questions remain the same (45 questions across 6 pillars)
- Phase B adds approximately 15–20 questions across 5 skill areas
- Total assessment time: approximately 25–35 minutes
- AI transitions naturally between Phase A and Phase B ("Great, now let's see where you are with data skills...")
- Output: Combined structured JSON (see Section 6.2)
- Results page shows both foundation readiness AND skill placement
- Results page includes the custom study plan with clear next steps
- "Begin Sprint [X]" button that routes to the assigned starting sprint

### 9.3 Sprint Dashboard

**What it does:** Central hub showing the student's progress across all sprints.

**Requirements:**
- Display all 6 sprints with status indicators (locked/available/in progress/completed)
- Current sprint highlighted with progress checklist
- For each sprint: title, business scenario preview, estimated time, required skills
- Dataset download link for the current sprint
- Rubric preview (so students know what they're being graded on before starting)
- Submission button (only active for current sprint)
- Overall progress bar showing sprints completed out of total

### 9.4 Sprint Workspace

**What it does:** Dedicated page for each sprint containing everything needed to complete the project.

**Requirements per sprint page:**
- Business problem description (the scenario, the stakeholders, the constraints)
- Dataset overview (what's in the data, column descriptions, known issues)
- Deliverable requirements (exactly what to produce and in what format)
- Minimum required skills (what the student should know before attempting)
- Rubric preview (all criteria and their weights)
- Submission form (see 9.5)
- "Ask Coach" button (see 9.7)

### 9.5 Submission System

**What it does:** Collects student work for AI evaluation.

**Requirements:**
- Accept external links: Google Sheets URL, GitHub repo URL, Tableau Public URL
- Accept written business summary (text field, 200–500 words)
- Validate that URLs are accessible (basic fetch check)
- Store submission metadata: timestamp, sprint ID, links, summary text
- One submission per sprint (allow resubmission to replace previous)
- Confirmation message after successful submission
- Auto-trigger feedback generation after submission

### 9.6 Rubric-Based AI Feedback

**What it does:** Evaluates the student's submission against a predefined rubric and returns structured feedback.

**Requirements:**
- LLM evaluates submission using the sprint-specific rubric
- Cannot access external links directly — evaluation is based on the written summary and any pasted content (future enhancement: screenshot analysis)
- Must return structured JSON:

```json
{
  "sprint_id": 1,
  "score": 78,
  "rubric_scores": {
    "business_framing": { "score": 8, "max": 10, "feedback": "..." },
    "data_correctness": { "score": 7, "max": 10, "feedback": "..." },
    "technical_execution": { "score": 6, "max": 10, "feedback": "..." },
    "insight_quality": { "score": 4, "max": 5, "feedback": "..." },
    "communication_clarity": { "score": 3, "max": 5, "feedback": "..." }
  },
  "strengths": ["...", "..."],
  "areas_to_improve": ["...", "..."],
  "next_steps": "...",
  "pass": true
}
```

- Passing threshold: 60/100
- Students who don't pass can resubmit
- Feedback displayed in a dashboard similar to the assessment results

### 9.7 Ask Coach (Sprint-Scoped Q&A)

**What it does:** LLM-powered assistant that answers questions related to the current sprint's topic only.

**Requirements:**
- Scoped to the current sprint's skill area (e.g., Sprint 3 coach only answers SQL questions)
- System prompt constrains responses to the sprint topic
- Maximum 20 questions per sprint (rate limited to prevent API abuse)
- Responses should teach concepts, not provide direct answers to the deliverable
- If the student asks the coach to do their work for them, the coach redirects: "I can explain how JOINs work, but the actual query is yours to write."
- Structured as a mini-chat window within the sprint workspace

### 9.8 Portfolio Page Generator

**What it does:** Auto-generates a case study page from the student's submission and feedback.

**Requirements:**
- Generated after the student passes a sprint (score >= 60)
- Case study structure: Problem, Data, Method, Key Insights, Business Recommendation, Links to Artifacts
- LLM assists with writing polish (one of four permitted LLM use cases)
- Export options: Markdown file, HTML page, copy-ready LinkedIn post summary
- Each case study gets a unique shareable URL
- Portfolio index page that lists all completed case studies

---

## 10. LLM Integration Strategy

### 10.1 API Migration Decision

**Current state:** The assessment uses Anthropic Claude Haiku (claude-haiku-4-5-20251001) at approximately $0.02–$0.05 per assessment.

**Target state:** Migrate to Google Gemini API (free tier) to eliminate ongoing API costs entirely.

**Migration plan:**
1. Set up Google Gemini API key (free tier: 15 requests/minute, 1,500 requests/day)
2. Create an adapter layer in the backend that abstracts the LLM provider
3. Update system prompts to work with Gemini's response format
4. Test assessment quality parity between Claude and Gemini outputs
5. Switch the production deployment to Gemini
6. Keep the Anthropic integration as a fallback option

**Adapter pattern:** The backend should use a provider-agnostic interface so swapping between Claude and Gemini requires changing one environment variable, not rewriting application code.

```
Environment variable: LLM_PROVIDER=gemini (or anthropic)
```

### 10.2 Permitted LLM Use Cases

The LLM is used in exactly four places. No freeform unlimited chat exists anywhere in the product:

1. **Skill Assessment** — Conducts the Phase A + Phase B conversational assessment
2. **Rubric Feedback** — Evaluates sprint submissions against predefined rubrics
3. **Portfolio Writing Assistant** — Helps polish case study write-ups
4. **Ask Coach Q&A** — Sprint-scoped question answering (rate limited)

### 10.3 LLM Constraints

All LLM interactions must follow these rules:
- All responses must be parseable as structured JSON where applicable
- No open-ended unlimited conversation (every interaction has a defined scope and endpoint)
- Rate limiting enforced per user session
- All prompts logged for debugging (no PII in logs)
- System prompts include prompt injection guards
- Coach responses redirect rather than refuse — "I focus on SQL for this sprint, but that's a great Python question for Sprint 5"

---

## 11. Technical Architecture

### 11.1 Updated Stack

| Layer | Current (Milestone 0) | Target (Full Bootcamp) | Rationale |
|-------|----------------------|----------------------|-----------|
| Frontend | Static HTML + React CDN | Same (no change for MVP) | Works, no build step, fast iteration |
| Backend | Vercel Serverless | Same + new API routes | Add sprint, submission, feedback endpoints |
| Database | SQLite via sql.js | Supabase (free tier) | Persistent data, survives redeployments |
| AI | Anthropic Claude Haiku | Google Gemini (free tier) | Zero API cost at scale |
| Hosting | Vercel | Same | Free, auto-deploy from GitHub |
| Storage | None | GitHub (templates) + external links | Datasets stored in repo, student work stored externally |

### 11.2 New API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Assessment conversation (exists, update for Phase B) |
| `/api/export-csv` | GET | Export assessment data (exists) |
| `/api/sprints` | GET | Return sprint metadata and user progress |
| `/api/sprints/[id]` | GET | Return specific sprint details, dataset info, rubric |
| `/api/submit` | POST | Accept sprint submission |
| `/api/feedback` | POST | Trigger rubric evaluation and return feedback |
| `/api/coach` | POST | Sprint-scoped Ask Coach Q&A |
| `/api/portfolio` | GET | Return generated case studies for user |
| `/api/portfolio/generate` | POST | Trigger case study generation from submission |

### 11.3 Database Migration: SQLite to Supabase

The current SQLite database is ephemeral on Vercel. The migration to Supabase (free tier: 500 MB storage, 2 GB bandwidth) provides persistent storage that survives redeployments.

Tables needed:

**assessments** (exists, migrate as-is)
- All current columns carry forward
- Add: `phase_b_results JSONB` for data skills diagnostic

**users** (new, lightweight)
- `id` — auto-generated UUID
- `created_at` — timestamp
- `assessment_id` — links to their assessment
- `study_plan` — JSONB of their custom sprint sequence
- `current_sprint` — integer (1–6)
- No email, no password — anonymous by default

**submissions** (new)
- `id` — auto-generated
- `user_id` — foreign key
- `sprint_id` — integer (1–6)
- `google_sheets_url` — text (nullable)
- `github_url` — text (nullable)
- `tableau_url` — text (nullable)
- `business_summary` — text
- `submitted_at` — timestamp
- `feedback` — JSONB (populated after evaluation)
- `score` — integer
- `passed` — boolean

**portfolio_entries** (new)
- `id` — auto-generated
- `user_id` — foreign key
- `sprint_id` — integer
- `case_study_markdown` — text
- `case_study_html` — text
- `linkedin_summary` — text
- `published_at` — timestamp
- `public_url` — text (unique slug)

### 11.4 File Structure (Target)

```
/data-analyst-bootcamp
├── index.html                    # Main app (update: add routing)
├── privacy.html                  # Five C's privacy policy (no change)
├── api/
│   ├── chat.js                   # Assessment endpoint (update: add Phase B)
│   ├── export-csv.js             # CSV export (no change)
│   ├── sprints.js                # Sprint metadata + progress
│   ├── submit.js                 # Submission handler
│   ├── feedback.js               # Rubric evaluation trigger
│   ├── coach.js                  # Ask Coach Q&A
│   ├── portfolio.js              # Portfolio generation + retrieval
│   └── lib/
│       ├── db.js                 # Database helper (update: Supabase)
│       ├── llm.js                # NEW: LLM provider adapter
│       └── rubrics.js            # NEW: Sprint rubric definitions
├── data/
│   ├── sprint-1-logistics.csv    # Sprint 1 dataset
│   ├── sprint-2-retail.csv       # Sprint 2 dataset
│   ├── sprint-3-subscriptions.sql # Sprint 3 dataset
│   ├── sprint-4-ecommerce.sql    # Sprint 4 dataset
│   ├── sprint-5-operations.csv   # Sprint 5 dataset
│   └── sprint-6-kpi-data.csv     # Sprint 6 dataset
├── scripts/
│   ├── seed-data.js              # Demo data generator (update for new tables)
│   └── verify-patterns.js        # Pattern analysis (no change)
├── docs/
│   ├── DATA_ANALYST_CONTEXT.md   # Dev context bible (update)
│   ├── PRD.md                    # THIS DOCUMENT
│   └── RATE_LIMITING.md          # Rate limiting strategy (no change)
├── package.json
└── .gitignore
```

---

## 12. Data Model

### Assessment Data Flow (Updated)

```
Student opens app
    ↓
Phase A: Foundation assessment (existing flow)
    ↓
Phase A results displayed
    ↓
If Readiness Level 1-2 → Continue to Phase B
If Readiness Level 3-5 → Show prep plan, option to try Phase B anyway
    ↓
Phase B: Data skills diagnostic (new)
    ↓
Combined results + custom study plan generated
    ↓
Save to database (if consent given)
    ↓
Route to Sprint Dashboard with study plan loaded
```

### Sprint Execution Data Flow (New)

```
Student opens assigned sprint
    ↓
Downloads dataset, reads business problem
    ↓
Works on project (externally: Excel, SQL tool, Python, Tableau)
    ↓
Submits links + business summary via /api/submit
    ↓
System triggers /api/feedback (LLM evaluates against rubric)
    ↓
Feedback displayed with score breakdown
    ↓
If score >= 60: Trigger /api/portfolio/generate
    ↓
Case study page auto-generated
    ↓
Sprint marked complete → next sprint unlocked
```

---

## 13. Success Metrics

### North Star Metric
**Number of completed, publicly published sprint case studies.**

This single metric captures everything: the student finished the assessment, started a sprint, did the work, submitted it, passed the rubric, and published the result. If this number grows, the product is working.

### Supporting Metrics

| Metric | What It Tells Us | Target (MVP) |
|--------|-----------------|--------------|
| Assessment completion rate | Are people finishing the diagnostic? | > 70% |
| Phase B completion rate | Do Phase A passers continue to skills diagnostic? | > 80% |
| Sprint start rate | Do assessed users actually begin a sprint? | > 50% |
| Sprint completion rate | Are sprints too hard, too easy, or just right? | > 60% |
| Submission-to-feedback time | Is the AI evaluation fast enough? | < 30 seconds |
| Average rubric score by sprint | Which sprints need curriculum adjustment? | 65–80 range |
| Portfolio publication rate | Are completers publishing their work? | > 80% |
| Resubmission rate | Are students iterating on feedback? | 20–40% (healthy range) |

### Data Collection Ethics

All metrics follow the Five C's framework established in Milestone 0. Specifically:
- Consent required before any data is stored
- No PII collected (no names, emails, or raw IPs)
- Aggregate analysis only
- Users get the full experience regardless of consent choice

---

## 14. Phased Rollout Plan

### Phase 0: Foundation Fixes (Week 1)
**Goal:** Resolve known technical debt before building new features.

- Migrate database from SQLite to Supabase
- Implement rate limiting on `/api/chat`
- Add React error boundaries to the frontend
- Create the LLM provider adapter (`api/lib/llm.js`)
- Test Gemini API integration with existing assessment prompts
- Fix dashboard CSV compatibility issue

**Exit criteria:** Assessment works end-to-end with Supabase and Gemini. No data loss on redeploy.

### Phase 1: Assessment Expansion (Weeks 2–3)
**Goal:** Add Phase B data skills diagnostic and custom study plan generation.

- Write Phase B system prompt (15–20 questions across 5 skill areas)
- Update `/api/chat` to handle two-phase assessment flow
- Update results UI to show combined Phase A + Phase B results
- Build study plan generation logic
- Add "Begin Sprint" routing from results page
- Update database schema for Phase B results

**Exit criteria:** A user can complete a full assessment and receive a personalized study plan with a clear starting sprint.

### Phase 2: Sprint System (Weeks 4–6)
**Goal:** Build the sprint infrastructure for at least Sprint 1 and Sprint 2.

- Create sprint dashboard UI
- Build sprint workspace pages
- Create datasets for Sprints 1 and 2
- Write rubrics for Sprints 1 and 2
- Build submission system (`/api/submit`)
- Build rubric feedback system (`/api/feedback`)
- Build Ask Coach endpoint (`/api/coach`)
- Implement sprint progression logic (unlock next after passing)

**Exit criteria:** A user can complete Sprint 1 end-to-end: read the business problem, download data, submit work, receive feedback, and see their score.

### Phase 3: Portfolio Generation (Weeks 7–8)
**Goal:** Auto-generate case studies from completed sprints.

- Build portfolio page generator
- Create case study templates (Markdown + HTML)
- Build LinkedIn summary generator
- Create shareable public URLs for case studies
- Build portfolio index page showing all completed work

**Exit criteria:** Completing a sprint automatically produces a shareable case study page.

### Phase 4: Remaining Sprints (Weeks 9–12)
**Goal:** Build out Sprints 3–6 content.

- Create datasets for Sprints 3–6
- Write rubrics for Sprints 3–6
- Configure Ask Coach system prompts for each sprint topic
- Test full 6-sprint pathway end-to-end

**Exit criteria:** A user can complete all 6 sprints and have a 6-piece portfolio.

### Phase 5: Polish & Launch (Week 13+)
**Goal:** Prepare for public users.

- Onboarding page with clear value proposition
- Mobile responsive testing
- Performance optimization
- User testing with 3–5 external testers
- Documentation and context bible updates
- Public launch announcement

---

## 15. Non-Goals (MVP)

These are explicitly out of scope for the initial release:

- **No video hosting.** Sprints are text + data, not video lessons.
- **No complex LMS features.** No grading curves, peer review, or instructor dashboards.
- **No payment system.** The product is free. Period.
- **No cohort management.** Every user is self-paced.
- **No heavy authentication.** Anonymous by default. Optional lightweight auth (magic link) can come later.
- **No mobile app.** Web-responsive is sufficient.
- **No real-time collaboration.** This is a solo learning tool.
- **No API access for third parties.** Internal use only.

---

## 16. Open Questions & Decisions

These items need resolution before or during development:

| # | Question | Options | Recommendation | Status |
|---|----------|---------|----------------|--------|
| 1 | Keep Anthropic as fallback or fully migrate to Gemini? | A) Keep both behind adapter, B) Full Gemini migration | A — adapter pattern keeps options open, minimal extra work | OPEN |
| 2 | How does the LLM evaluate external links (Google Sheets, etc.) it can't access? | A) Evaluate only the written summary, B) Require students to paste key data/screenshots, C) Use a screenshot service | B for MVP — require pasted content alongside links | OPEN |
| 3 | Should sprint datasets be real or synthetic? | A) Real public datasets, B) Custom synthetic data | B — synthetic data lets us control complexity and ensure the business scenario works perfectly | OPEN |
| 4 | Anonymous users vs. lightweight accounts? | A) Fully anonymous (localStorage for progress), B) Magic link email auth, C) GitHub OAuth | A for MVP — simplest, privacy-first. Consider B for Phase 2 when users need cross-device access | OPEN |
| 5 | Supabase free tier limits (500 MB, 50K rows) — is this enough? | A) Yes for MVP, B) Need to evaluate growth projections | A — 50K rows is more than enough for Phase 1. Revisit at 10K users | OPEN |
| 6 | Sprint 5 requires Python — how do students run code? | A) Local Python install, B) Google Colab link, C) In-browser code editor | B — Google Colab is free, requires no setup, and produces shareable notebooks | OPEN |

---

## 17. Appendix: Sprint Details

### Sprint 1 — Excel: Operational Bottleneck Analysis

**Business Scenario:** FastTrack Logistics has been losing $2.3M annually due to late deliveries. The VP of Operations has asked your team to identify the root causes using the last 12 months of delivery data.

**Dataset:** 5,000 delivery records with columns: order_id, origin_warehouse, destination_city, promised_delivery_date, actual_delivery_date, carrier, package_weight, route_type, weather_conditions, delay_reason

**Deliverables:**
1. Cleaned spreadsheet with calculated fields (days_late, on_time_flag, delay_category)
2. Pivot table analysis showing delay patterns by carrier, route, and warehouse
3. Executive memo (1 page) with top 3 findings and recommended actions

**Rubric:**
- Business Framing (20%) — Does the memo address the VP's actual question?
- Data Correctness (25%) — Are calculations accurate? Is the data properly cleaned?
- Technical Execution (25%) — Appropriate use of formulas, pivots, and formatting?
- Insight Quality (20%) — Are the findings actionable and evidence-based?
- Communication Clarity (10%) — Is the memo clear, concise, and professional?

---

### Sprint 2 — Excel: Revenue Leakage Analysis

**Business Scenario:** ShopRight, a 200-store retail chain, posted $450M in revenue last quarter but profits dropped 12% year-over-year. The CFO suspects margin erosion in specific product categories.

**Dataset:** 15,000 transaction records with columns: store_id, region, product_category, product_name, units_sold, revenue, cost_of_goods, discount_applied, return_flag, sale_date

**Deliverables:**
1. Margin analysis by product category and region
2. Identification of the top 5 "profit draining" categories
3. Recommendation summary with projected impact of proposed changes

**Rubric:** Same 5 categories as Sprint 1, weights adjusted for financial analysis emphasis.

---

### Sprint 3 — SQL: Core Metrics Dashboard

**Business Scenario:** StreamFlow, a B2B SaaS company with 12,000 subscribers, needs to understand their churn problem. The Head of Customer Success wants a metrics package they can review weekly.

**Dataset:** SQL database with tables: users, subscriptions, payments, support_tickets, feature_usage

**Deliverables:**
1. 10 SQL queries answering specific business questions (monthly churn rate, revenue by plan tier, average ticket resolution time, feature adoption rates, etc.)
2. Metrics summary document explaining what each number means for the business

**Rubric:** Technical Execution weighted higher (35%) for SQL accuracy.

---

### Sprint 4 — SQL: Joins & Segmentation

**Business Scenario:** QuickCart, an e-commerce platform, suspects that 80% of their revenue comes from 20% of customers. The CEO wants to know: who are these customers, what do they buy, and how do we get more of them?

**Dataset:** SQL database with tables: customers, orders, order_items, products, categories, reviews

**Deliverables:**
1. Multi-table JOIN analysis identifying revenue concentration
2. Customer segmentation (top tier, mid tier, one-time buyers)
3. Written answers to 5 executive questions provided in the brief

**Rubric:** Business Thinking weighted higher (25%) for strategic interpretation.

---

### Sprint 5 — Python: Automation Report

**Business Scenario:** The operations team at DataPulse Inc. spends 6 hours every Monday manually compiling a weekly performance report from three CSV exports. They need an automation solution.

**Dataset:** Three CSV files representing weekly exports: sales_data.csv, support_metrics.csv, marketing_kpis.csv

**Deliverables:**
1. Python script that reads all three CSVs, cleans and merges data, calculates KPIs, and outputs a formatted summary
2. Automated output file (CSV or formatted text)
3. GitHub repository with README explaining how to run the script

**Rubric:** Technical Execution (35%), Communication (15% — README quality matters).

---

### Sprint 6 — Dashboard: Executive KPI System

**Business Scenario:** The CEO of NexGen Analytics needs a single dashboard they can check every morning to understand company health. They've defined 8 KPIs they care about.

**Dataset:** Combined dataset from previous sprints (or new synthetic data representing 12 months of company operations)

**Deliverables:**
1. Public dashboard (Tableau Public, Google Looker Studio, or equivalent)
2. Annotated walkthrough document explaining each chart choice
3. Final case study synthesizing the entire bootcamp journey

**Rubric:** Visualization quality and business storytelling weighted highest. This is the capstone.

---

## End of PRD

*This document should be updated as development progresses and decisions are made. Each resolved open question should be marked DECIDED with the chosen option and rationale.*
