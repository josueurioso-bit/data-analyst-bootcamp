# Technical Requirements Document
## Data School Readiness Engine

**Version:** 1.0
**Date:** February 13, 2026
**Author:** Josue (Creative Director / Product Owner)
**Status:** Draft
**Classification:** Internal
**Repository:** josueurioso-bit/data-analyst-bootcamp

---

## Revision History

| Version | Date | Author | Change Summary |
|---------|------|--------|----------------|
| 1.0 | Feb 13, 2026 | Josue | Initial TRD based on PRD v1.0 |

---

## Table of Contents

1. Introduction
2. System Overview
3. Technical Architecture
4. Database Design
5. API Specifications
6. Sprint Rubric Specifications
7. Security and Privacy Requirements
8. Target File Structure
9. Deployment and Infrastructure
10. Phased Implementation Plan
11. Open Technical Decisions
12. Testing Strategy
13. Success Metrics and Monitoring
14. Explicit Non-Goals

---

## 1. Introduction

### 1.1 Purpose

This Technical Requirements Document (TRD) translates the Data School Readiness Engine Product Requirements Document (PRD v1.0) into actionable engineering specifications. It defines the system architecture, database design, API contracts, integration patterns, security controls, and deployment strategy required to evolve the existing Milestone 0 assessment tool into a full apprenticeship simulation platform.

### 1.2 Scope

The TRD covers all six rollout phases (Phase 0 through Phase 5) of the Data School Readiness Engine, encompassing the foundation migration, assessment expansion, sprint system, portfolio generation, remaining sprint content, and final polish for public launch. The system takes users from skill diagnosis through six project-based sprints, producing portfolio-ready case studies at each stage.

### 1.3 Intended Audience

This document is intended for the product owner (Josue), any contributing developers, and AI-assisted development tools (Claude Code) being used to implement the system. It serves as the engineering companion to the PRD and should be referenced alongside it during development.

### 1.4 Reference Documents

- PRD v1.0: `docs/PRD.md` (source of truth for all feature decisions)
- Milestone 0 Codebase: `github.com/josueurioso-bit/data-analyst-bootcamp`
- Super Prompt: `docs/PRD_DataSRE.md` (development operating rules)
- Privacy Policy: `privacy.html` (Five C's ethical data framework)
- Rate Limiting Strategy: `docs/RATE_LIMITING.md`

### 1.5 Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| DSRE | Data School Readiness Engine (the product) |
| Phase A | Foundation skills assessment (existing 45-question diagnostic) |
| Phase B | Data skills diagnostic (new 15–20 question placement tool) |
| Sprint | A self-contained project module with business scenario, dataset, rubric, and deliverables |
| Five C's | Ethical data framework: Consent, Collection limits, Confidentiality, Control, Communication |
| LLM Adapter | Provider-agnostic abstraction layer for AI model calls (`api/lib/llm.js`) |
| PII | Personally Identifiable Information (explicitly excluded from all data collection) |

---

## 2. System Overview

### 2.1 Current State (Milestone 0)

The existing deployed application provides a conversational AI assessment evaluating six foundational pillars across 45 questions. It uses SQLite (ephemeral on Vercel), Anthropic Claude Haiku for AI, and a static HTML + React CDN frontend. The system produces readiness scores with color-coded results but currently ends at diagnosis with no pathway to action.

### 2.2 Target State (Full Platform)

The target system extends the assessment into a two-phase diagnostic (foundation + data skills), generates custom study plans, and routes users through six project-based sprints. Each sprint includes a business scenario, downloadable dataset, submission system, AI-powered rubric feedback, and automatic portfolio case study generation. The database migrates to Supabase for persistence, and the LLM provider migrates to Google Gemini for zero API cost.

### 2.3 High-Level Architecture

The system follows a serverless architecture pattern deployed on Vercel, with all state persisted in Supabase (PostgreSQL). The frontend remains a zero-build-step static HTML application using React 18 via CDN and Tailwind CSS. All LLM interactions are routed through a provider-agnostic adapter layer. Datasets are stored as static files in the repository.

| Layer | Current Technology | Target Technology | Rationale |
|-------|-------------------|-------------------|-----------|
| Frontend | Static HTML + React 18 CDN + Tailwind CSS | No change for MVP | Works, no build step, fast iteration |
| Backend | Vercel Serverless Functions (Node.js) | Same + 7 new API routes | Proven pattern, add sprint/feedback/portfolio endpoints |
| Database | SQLite via sql.js (WebAssembly) | Supabase (PostgreSQL, free tier) | Persistent storage that survives redeployments |
| AI Provider | Anthropic Claude Haiku | Google Gemini (free tier) | Eliminates ongoing API costs entirely |
| Hosting | Vercel (free tier) | No change | Free, auto-deploy from GitHub, reliable |
| File Storage | None | GitHub repo (static datasets) | Datasets as CSV/SQL files in `/data` directory |

---

## 3. Technical Architecture

### 3.1 Frontend Architecture

The frontend is a static HTML application with React 18 loaded via CDN. There is no build step, no bundler, and no compiled JavaScript. This is an intentional design decision for MVP to minimize toolchain complexity and enable rapid iteration. Tailwind CSS is loaded via CDN for styling.

#### 3.1.1 Routing Strategy

Client-side routing is handled within the React application using hash-based navigation or a lightweight router. The application renders different views based on the current route: assessment chat, results dashboard, sprint dashboard, sprint workspace, submission, feedback, and portfolio pages. All routing lives within the single `index.html` entry point.

#### 3.1.2 State Management

Application state is managed through React hooks (`useState`, `useReducer`, `useContext`). User identity is stored as an anonymous UUID in the browser. Because there is no authentication system (a deliberate non-goal for MVP), all progress tracking relies on this local identifier combined with Supabase records keyed to the anonymous UUID.

#### 3.1.3 Error Boundaries

React error boundaries must be implemented around each major feature area (assessment chat, sprint dashboard, sprint workspace, feedback display, portfolio view) to prevent cascading failures. Each boundary renders a user-friendly fallback UI with a retry option and logs the error for debugging. This is a Phase 0 deliverable addressing known Milestone 0 technical debt.

### 3.2 Backend Architecture

All server-side logic runs as Vercel Serverless Functions written in Node.js. Each API route is a single file under the `/api` directory. Shared utilities (database helpers, LLM adapter, rubric definitions) live in `/api/lib`. Functions are stateless; all persistent state lives in Supabase.

#### 3.2.1 API Route Inventory

| Endpoint | Method | Purpose | Phase |
|----------|--------|---------|-------|
| `/api/chat` | POST | Assessment conversation (update for two-phase flow) | 0–1 |
| `/api/export-csv` | GET | Export assessment data as CSV (existing) | 0 |
| `/api/sprints` | GET | Return sprint metadata and user progress | 2 |
| `/api/sprints/[id]` | GET | Return specific sprint details, dataset info, rubric | 2 |
| `/api/submit` | POST | Accept sprint submission with links and summary | 2 |
| `/api/feedback` | POST | Trigger rubric-based LLM evaluation, return scores | 2 |
| `/api/coach` | POST | Sprint-scoped Ask Coach Q&A (rate limited) | 2 |
| `/api/portfolio` | GET | Return generated case studies for a user | 3 |
| `/api/portfolio/generate` | POST | Trigger case study generation from submission | 3 |

#### 3.2.2 Shared Libraries

**`api/lib/db.js`:** Database helper module. Currently wraps SQLite via sql.js. Must be refactored in Phase 0 to use the Supabase JavaScript client (`@supabase/supabase-js`). All database operations across the application import from this single module, so the migration is contained to one file.

**`api/lib/llm.js`:** LLM provider adapter (new in Phase 0). Exports a single async function that accepts a system prompt, user message, and optional parameters, then routes the call to the configured provider. The active provider is determined by the `LLM_PROVIDER` environment variable (`"gemini"` or `"anthropic"`). Application code never imports provider SDKs directly.

**`api/lib/rubrics.js`:** Sprint rubric definitions (new in Phase 2). Exports structured rubric objects for each sprint containing category names, weights, scoring criteria, and maximum points. These definitions are passed to the LLM during feedback evaluation to ensure consistent, structured scoring.

### 3.3 LLM Integration Architecture

#### 3.3.1 Provider Adapter Pattern

All LLM calls are routed through `api/lib/llm.js`, which implements a provider-agnostic interface. Swapping the active provider requires changing a single environment variable (`LLM_PROVIDER=gemini` or `LLM_PROVIDER=anthropic`) with zero application code changes. The adapter handles provider-specific request formatting, response parsing, error handling, and rate limit awareness.

#### 3.3.2 Adapter Interface Contract

The adapter exports a function with the following signature and behavior:

| Parameter | Type | Description |
|-----------|------|-------------|
| `systemPrompt` | string | The system-level instruction for the LLM (context, persona, constraints) |
| `userMessage` | string | The user-facing input or conversation turn |
| `options.temperature` | number (0–1) | Controls response randomness; default 0.7 for conversation, 0.3 for evaluation |
| `options.maxTokens` | integer | Maximum response length; varies by use case |
| `options.responseFormat` | string | `"json"` to request structured JSON output where applicable |
| **Returns** | object | `{ content: string, usage: { inputTokens, outputTokens }, provider: string }` |

#### 3.3.3 Permitted LLM Use Cases (Strictly Four)

The system enforces exactly four LLM integration points. No freeform unlimited chat exists anywhere in the application. Any proposed feature that would create a fifth use case must be flagged and rejected.

| Use Case | Endpoint | Scope | Rate Limit |
|----------|----------|-------|------------|
| 1. Skill Assessment | `/api/chat` | Phase A (45 Qs) + Phase B (15–20 Qs) conversational flow | 1 active session per user |
| 2. Rubric Feedback | `/api/feedback` | Evaluates submission against sprint-specific rubric | 1 per submission |
| 3. Portfolio Writing | `/api/portfolio/generate` | Polishes case study write-ups from submission data | 1 per passed sprint |
| 4. Ask Coach Q&A | `/api/coach` | Sprint-scoped Q&A; teaches concepts, never gives answers | 20 questions per sprint |

#### 3.3.4 LLM Constraints and Safety

- All LLM responses must be parseable as structured JSON where the use case requires it
- Every interaction has a defined scope and endpoint; no open-ended unlimited conversations
- Rate limiting enforced per user session across all four use cases
- All prompts are logged for debugging with zero PII in logs
- System prompts include prompt injection guards to prevent misuse
- Ask Coach responses redirect rather than refuse: "I focus on SQL for this sprint, but that's a great Python question for Sprint 5"
- The Coach never completes deliverables for students; it teaches concepts and explains approaches

#### 3.3.5 Google Gemini Free Tier Limits

The target LLM provider (Google Gemini API free tier) operates within these constraints. The application must implement queuing and graceful degradation if these limits are approached.

- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

---

## 4. Database Design

### 4.1 Migration Strategy: SQLite to Supabase

The current SQLite database is ephemeral on Vercel (data lost on every redeployment). Phase 0 migrates to Supabase (PostgreSQL), which provides persistent storage on a free tier offering 500 MB storage and 2 GB transfer bandwidth. The migration is contained to `api/lib/db.js` since all database operations are already centralized through this module.

#### 4.1.1 Migration Steps

1. Provision a new Supabase project and obtain the project URL and anon key
2. Install `@supabase/supabase-js` as a dependency
3. Create all four tables (`assessments`, `users`, `submissions`, `portfolio_entries`) via Supabase SQL editor
4. Refactor `api/lib/db.js` to use the Supabase client instead of sql.js
5. Migrate any existing assessment data from the current SQLite instance
6. Update the seed data generator (`scripts/seed-data.js`) for the new schema
7. Verify the CSV export endpoint works with the new database
8. Remove sql.js dependency from the project

### 4.2 Table Schemas

#### 4.2.1 `assessments` (migrated from existing)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique assessment identifier |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | When the assessment was started |
| `consent_given` | BOOLEAN | NOT NULL | Whether the user opted in to data collection |
| `ip_hash` | VARCHAR(64) | NULLABLE | SHA-256 hash of IP (only if consent given) |
| `readiness_level` | INTEGER | CHECK (1–5) | Phase A readiness score (1–5) |
| `pillar_scores` | JSONB | NOT NULL | Phase A pillar breakdown (numeracy, reading, etc.) |
| `phase_b_results` | JSONB | NULLABLE | Phase B data skills diagnostic results (new) |
| `conversation_log` | JSONB | NULLABLE | Full conversation history for debugging |

#### 4.2.2 `users` (new, anonymous)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Anonymous user identifier |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` | Account creation timestamp |
| `assessment_id` | UUID | FK → `assessments.id`, NULLABLE | Links to their completed assessment |
| `study_plan` | JSONB | NULLABLE | Custom sprint sequence from Phase B results |
| `current_sprint` | INTEGER | DEFAULT 1, CHECK (1–6) | Active sprint number |

**Privacy note:** This table contains zero PII. No email, no password, no name. The UUID is generated client-side and stored in the browser. Users are anonymous by default per the Five C's framework.

#### 4.2.3 `submissions` (new)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique submission identifier |
| `user_id` | UUID | FK → `users.id`, NOT NULL | Who submitted |
| `sprint_id` | INTEGER | NOT NULL, CHECK (1–6) | Which sprint this submission is for |
| `google_sheets_url` | TEXT | NULLABLE | Link to Google Sheets deliverable |
| `github_url` | TEXT | NULLABLE | Link to GitHub repository |
| `tableau_url` | TEXT | NULLABLE | Link to Tableau Public dashboard |
| `business_summary` | TEXT | NOT NULL | Written summary (200–500 words) |
| `submitted_at` | TIMESTAMPTZ | DEFAULT `now()` | Submission timestamp |
| `feedback` | JSONB | NULLABLE | Structured rubric feedback (populated after eval) |
| `score` | INTEGER | NULLABLE | Total score out of 100 |
| `passed` | BOOLEAN | NULLABLE | Whether score >= 60 threshold |

**Constraint:** Only one active submission per user per sprint. Resubmissions replace the previous record. This is enforced via a UNIQUE constraint on `(user_id, sprint_id)`.

#### 4.2.4 `portfolio_entries` (new)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT `gen_random_uuid()` | Unique entry identifier |
| `user_id` | UUID | FK → `users.id`, NOT NULL | Portfolio owner |
| `sprint_id` | INTEGER | NOT NULL, CHECK (1–6) | Which sprint produced this entry |
| `case_study_markdown` | TEXT | NOT NULL | Case study in Markdown format |
| `case_study_html` | TEXT | NOT NULL | Case study rendered as HTML |
| `linkedin_summary` | TEXT | NOT NULL | Concise LinkedIn post summary |
| `published_at` | TIMESTAMPTZ | DEFAULT `now()` | When the entry was published |
| `public_url` | TEXT | UNIQUE, NOT NULL | Shareable URL slug for this case study |

### 4.3 Data Flow Diagrams

#### 4.3.1 Assessment Flow

```
Student opens app
    ↓
Phase A: Foundation assessment (existing conversational flow)
    ↓
Phase A results displayed with readiness level (1–5)
    ↓
If Readiness Level 1–2 → Continue directly to Phase B
If Readiness Level 3–5 → Show prep plan with resources, option to try Phase B anyway
    ↓
Phase B: Data skills diagnostic (new, 15–20 questions)
    ↓
Combined results + custom study plan generated
    ↓
Save to database (if consent given)
    ↓
Route to Sprint Dashboard with study plan loaded
```

#### 4.3.2 Sprint Execution Flow

```
Student opens assigned sprint from dashboard
    ↓
Downloads dataset, reads business problem and rubric preview
    ↓
Works on project externally (Excel, SQL tool, Python, Tableau)
    ↓
Submits links + business summary via /api/submit
    ↓
System triggers /api/feedback (LLM evaluates against rubric)
    ↓
Feedback displayed with per-category score breakdown
    ↓
If score >= 60: Trigger /api/portfolio/generate
    ↓
Case study page auto-generated with shareable URL
    ↓
Sprint marked complete → next sprint unlocked
```

### 4.4 Data Ethics Compliance

Every database interaction must comply with the Five C's ethical data framework established in Milestone 0. The following rules are non-negotiable:

- **Consent:** Data is only stored when the user explicitly opts in via the consent checkbox
- **Collection limits:** No PII is collected anywhere in the system (no names, emails, or raw IPs)
- **Confidentiality:** IP addresses are hashed with SHA-256 before storage; original IPs are never persisted
- **Control:** Users receive the full product experience regardless of their consent choice
- **Communication:** The privacy policy (`privacy.html`) explains all data practices at an 8th-grade reading level

---

## 5. API Specifications

### 5.1 POST `/api/chat` (Assessment Engine)

Handles the two-phase conversational assessment. This is an update to the existing Milestone 0 endpoint. The endpoint must maintain conversation context across multiple turns and transition naturally from Phase A to Phase B.

#### 5.1.1 Request Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | The user's conversational response |
| `conversationHistory` | array | Yes | Full chat history for context continuity |
| `userId` | string (UUID) | Yes | Anonymous user identifier |
| `consent` | boolean | Yes | Whether user consented to data storage |
| `phase` | string | No | `"a"` or `"b"` (auto-detected from conversation progress) |

#### 5.1.2 Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `reply` | string | The AI's conversational response (next question or transition) |
| `phase` | string | Current phase (`"a"` or `"b"`) |
| `progress` | object | `{ currentQuestion, totalQuestions, percentComplete }` |
| `assessmentComplete` | boolean | True when both phases are finished |
| `results` | object (nullable) | Combined Phase A + Phase B structured results (see PRD Section 6.2) |
| `studyPlan` | object (nullable) | Generated study plan with sprint assignments |

### 5.2 POST `/api/submit` (Sprint Submission)

Accepts student work for a specific sprint. Validates input, stores the submission in Supabase, and auto-triggers the feedback evaluation pipeline.

#### 5.2.1 Request Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string (UUID) | Yes | Anonymous user identifier |
| `sprintId` | integer (1–6) | Yes | The sprint being submitted for |
| `googleSheetsUrl` | string (URL) | Conditional | Required for Sprints 1–2 |
| `githubUrl` | string (URL) | Conditional | Required for Sprint 5 |
| `tableauUrl` | string (URL) | Conditional | Required for Sprint 6 |
| `businessSummary` | string (200–500 words) | Yes | Written summary of approach and findings |

#### 5.2.2 Validation Rules

- At least one external URL must be provided alongside the business summary
- URLs must be reachable (basic HTTP HEAD check; failure is a warning, not a blocker)
- Business summary must be between 200 and 500 words
- User must have the specified sprint available (not locked) in their study plan
- Resubmission replaces the previous submission for the same sprint

### 5.3 POST `/api/feedback` (Rubric Evaluation)

Triggers AI-powered rubric evaluation of a sprint submission. The LLM receives the submission content alongside the sprint-specific rubric and returns structured scoring.

#### 5.3.1 Feedback Response Schema (LLM Output)

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

| Field | Type | Description |
|-------|------|-------------|
| `sprint_id` | integer | The sprint evaluated |
| `score` | integer (0–100) | Total weighted score across all rubric categories |
| `rubric_scores` | object | Per-category scores: `business_framing`, `data_correctness`, `technical_execution`, `insight_quality`, `communication_clarity` |
| `rubric_scores[category].score` | integer | Score achieved for this category |
| `rubric_scores[category].max` | integer | Maximum possible score for this category |
| `rubric_scores[category].feedback` | string | Specific, actionable feedback for this category |
| `strengths` | array of strings | 2–3 specific things the student did well |
| `areas_to_improve` | array of strings | 2–3 specific areas with concrete improvement suggestions |
| `next_steps` | string | Recommended next action (resubmit, move to next sprint, etc.) |
| `pass` | boolean | True if score >= 60 |

### 5.4 POST `/api/coach` (Ask Coach Q&A)

Sprint-scoped AI assistant that teaches concepts without completing deliverables for the student. Strictly limited to 20 questions per sprint per user.

#### 5.4.1 Scoping and Guardrails

- Each sprint's coach has a unique system prompt constraining it to that sprint's skill area
- Sprint 1–2 coach: Excel/spreadsheet concepts only
- Sprint 3–4 coach: SQL concepts only
- Sprint 5 coach: Python basics and automation concepts only
- Sprint 6 coach: Visualization and dashboard design concepts only
- If a student asks the coach to produce a deliverable, it redirects: "I can explain the concept, but the actual work is yours to do"
- If a student asks about a topic outside the sprint scope, the coach redirects: "Great question — that's covered in Sprint [X]"

### 5.5 GET `/api/sprints` (Sprint Metadata)

Returns all six sprints with the user's progress status for dashboard rendering.

#### 5.5.1 Response Schema

```json
{
  "sprints": [
    {
      "id": 1,
      "title": "Excel: Operational Bottleneck Analysis",
      "scenario_preview": "FastTrack Logistics has been losing $2.3M annually...",
      "focus": "Excel",
      "estimated_time": "2 weeks",
      "status": "completed",
      "score": 78,
      "required_skills": ["Spreadsheet basics", "Pivot tables", "Business writing"]
    }
  ],
  "current_sprint": 2,
  "completed_count": 1,
  "study_plan": { "skip_sprints": [], "focus_sprints": [1,2,3,4,5,6] }
}
```

### 5.6 POST `/api/portfolio/generate` (Case Study Generation)

Triggers LLM-assisted case study generation from a passed sprint submission. This is one of the four permitted LLM use cases.

#### 5.6.1 Output Format

The generator produces three outputs per case study:

- **Markdown:** Structured case study following the template: Problem → Data → Method → Key Insights → Business Recommendation → Links to Artifacts
- **HTML:** Rendered version for the shareable public URL
- **LinkedIn Summary:** Concise 2–3 paragraph summary suitable for a LinkedIn post

---

## 6. Sprint Rubric Specifications

### 6.1 Universal Rubric Structure

Every sprint uses the same five evaluation categories. The weights vary per sprint to reflect the emphasis of each project. The passing threshold is 60 out of 100 for all sprints. Students who do not pass may resubmit.

| Category | What It Measures | Default Weight |
|----------|-----------------|----------------|
| Business Framing | Does the work address the stakeholder's actual question? | 20% |
| Data Correctness | Are calculations accurate? Is data properly cleaned? | 25% |
| Technical Execution | Appropriate use of tools, formulas, queries, or code? | 25% |
| Insight Quality | Are findings actionable and evidence-based? | 20% |
| Communication Clarity | Is the deliverable clear, concise, and professional? | 10% |

### 6.2 Sprint-Specific Weight Adjustments

| Sprint | Business Framing | Data Correctness | Technical Exec | Insight Quality | Communication |
|--------|-----------------|-----------------|----------------|-----------------|---------------|
| 1: Excel Operations | 20% | 25% | 25% | 20% | 10% |
| 2: Excel Revenue | 20% | 25% | 25% | 20% | 10% |
| 3: SQL Metrics | 15% | 20% | 35% | 20% | 10% |
| 4: SQL Joins | 25% | 20% | 25% | 20% | 10% |
| 5: Python Automation | 15% | 20% | 35% | 15% | 15% |
| 6: Dashboard Capstone | 20% | 15% | 20% | 25% | 20% |

### 6.3 Sprint Content Summary

| Sprint | Business Scenario | Dataset | Primary Deliverables |
|--------|------------------|---------|---------------------|
| 1 | FastTrack Logistics: $2.3M lost to late deliveries | 5,000 delivery records (CSV) | Cleaned spreadsheet + pivot analysis + executive memo |
| 2 | ShopRight Retail: $450M revenue but 12% profit drop | 15,000 transaction records (CSV) | Margin analysis + top 5 profit drains + recommendations |
| 3 | StreamFlow SaaS: 12,000 subscribers with churn problem | SQL database (users, subscriptions, payments, support_tickets, feature_usage) | 10 SQL queries + metrics summary document |
| 4 | QuickCart E-commerce: revenue concentration analysis | SQL database (customers, orders, order_items, products, categories, reviews) | Multi-table JOIN analysis + customer segmentation + executive answers |
| 5 | DataPulse Inc: 6-hour weekly manual report compilation | Three CSV files (sales, support, marketing) | Python script + automated output + GitHub repo with README |
| 6 | NexGen Analytics: CEO needs morning KPI dashboard | Combined dataset (12 months of operations) | Public dashboard + annotated walkthrough + final case study |

---

## 7. Security and Privacy Requirements

### 7.1 Authentication Model

The system uses anonymous-by-default authentication. Users are assigned a client-generated UUID stored in the browser. There is no login, no email collection, and no password. This is a deliberate design choice that aligns with the Five C's framework and the PRD's non-goals (no heavy authentication for MVP). Lightweight authentication (magic link) may be considered in a future phase for cross-device access.

### 7.2 Data Protection Controls

- No PII stored anywhere in the system (no names, emails, phone numbers, or raw IP addresses)
- IP addresses are hashed using SHA-256 before any storage; the original IP is never written to the database
- Consent checkbox must be checked before any data is persisted to Supabase
- Users who decline consent still receive the full product experience; data is simply not stored
- All database queries operate on anonymous UUIDs; no cross-referencing with external identity systems

### 7.3 API Security

- Rate limiting on `/api/chat` to prevent API abuse (Phase 0 deliverable)
- Ask Coach endpoint limited to 20 questions per sprint per user, enforced server-side
- All LLM system prompts include prompt injection guards
- No PII is included in any LLM prompt or logged output
- Supabase credentials (project URL and anon key) are stored as Vercel environment variables, never committed to the repository
- LLM API keys (Gemini and/or Anthropic) are stored as Vercel environment variables

### 7.4 Environment Variables

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `SUPABASE_URL` | Supabase project endpoint | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous access key | (generated by Supabase) |
| `LLM_PROVIDER` | Active LLM provider selection | `gemini` or `anthropic` |
| `GEMINI_API_KEY` | Google Gemini API credentials | (from Google AI Studio) |
| `ANTHROPIC_API_KEY` | Anthropic API credentials (fallback) | (from Anthropic Console) |

---

## 8. Target File Structure

The following is the complete target file structure for the application after all phases are implemented. Files marked **(existing)** carry forward from Milestone 0; files marked **(new)** are created during their respective rollout phases; files marked **(update)** require modification.

```
/data-analyst-bootcamp
├── index.html                      # (update, Phase 0–2) Main app entry point, add routing
├── privacy.html                    # (existing) Five C's privacy policy, no change
├── api/
│   ├── chat.js                     # (update, Phase 0–1) Assessment endpoint, add Phase B + adapter
│   ├── export-csv.js               # (update, Phase 0) CSV export, fix compat + use Supabase
│   ├── sprints.js                  # (new, Phase 2) Sprint metadata and user progress
│   ├── submit.js                   # (new, Phase 2) Submission handler with URL validation
│   ├── feedback.js                 # (new, Phase 2) Rubric-based LLM evaluation trigger
│   ├── coach.js                    # (new, Phase 2) Ask Coach Q&A with rate limiting
│   ├── portfolio.js                # (new, Phase 3) Portfolio retrieval and case study generation
│   └── lib/
│       ├── db.js                   # (update, Phase 0) Database helper, refactor for Supabase
│       ├── llm.js                  # (new, Phase 0) LLM provider adapter (Gemini/Anthropic)
│       └── rubrics.js              # (new, Phase 2) Sprint rubric definitions and weights
├── data/
│   ├── sprint-1-logistics.csv      # (new, Phase 2) Sprint 1 dataset, 5,000 records
│   ├── sprint-2-retail.csv         # (new, Phase 2) Sprint 2 dataset, 15,000 records
│   ├── sprint-3-subscriptions.sql  # (new, Phase 4) Sprint 3 SQL database dump
│   ├── sprint-4-ecommerce.sql      # (new, Phase 4) Sprint 4 SQL database dump
│   ├── sprint-5-operations.csv     # (new, Phase 4) Sprint 5 CSV exports (3 files)
│   └── sprint-6-kpi-data.csv       # (new, Phase 4) Sprint 6 combined KPI dataset
├── scripts/
│   ├── seed-data.js                # (update, Phase 0) Demo data generator, add new tables
│   └── verify-patterns.js          # (existing) Pattern analysis, no change
├── docs/
│   ├── DATA_ANALYST_CONTEXT.md     # (update) Dev context bible
│   ├── PRD.md                      # (existing) Product Requirements Document
│   └── RATE_LIMITING.md            # (existing) Rate limiting strategy, no change
├── package.json
└── .gitignore
```

---

## 9. Deployment and Infrastructure

### 9.1 Hosting Configuration

The application is deployed on Vercel's free tier with automatic deployments triggered by pushes to the main branch of the GitHub repository. Vercel handles SSL termination, CDN distribution, and serverless function execution. No custom domain is required for MVP (the default `.vercel.app` subdomain is sufficient).

### 9.2 Supabase Free Tier Constraints

| Resource | Free Tier Limit | Projected MVP Usage | Risk Level |
|----------|----------------|--------------------:|------------|
| Database Storage | 500 MB | < 50 MB (text-only, no media) | Low |
| Row Count | 50,000 rows | < 5,000 for Phase 1 (single user) | Low |
| Bandwidth | 2 GB/month | < 500 MB/month | Low |
| API Requests | Unlimited (with rate limits) | Moderate | Low |
| Concurrent Connections | Limited | Single user for Phase 1 | Low |

### 9.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Assessment response time | < 3 seconds per AI turn | Time from user message to AI reply displayed |
| Submission-to-feedback time | < 30 seconds | Time from submission to full rubric feedback displayed |
| Sprint dashboard load time | < 2 seconds | Time to initial render with user progress data |
| Portfolio page generation | < 15 seconds | Time from trigger to case study page ready |
| Ask Coach response time | < 5 seconds | Time from question to coach reply displayed |

---

## 10. Phased Implementation Plan

Each phase has explicit exit criteria that must be met before proceeding to the next phase. This maps directly to the PRD's rollout plan (Section 14) with additional technical specificity.

### 10.1 Phase 0: Foundation Fixes (Week 1)

**Goal:** Resolve all known technical debt before building new features.

- Migrate database from SQLite to Supabase (`api/lib/db.js` refactor)
- Implement rate limiting on `/api/chat`
- Add React error boundaries around all major UI sections
- Create the LLM provider adapter (`api/lib/llm.js`) with Gemini and Anthropic support
- Test Gemini API integration with existing Phase A assessment prompts
- Fix dashboard CSV compatibility issue

**Exit Criteria:** Assessment works end-to-end with Supabase and Gemini. No data loss on redeploy. Rate limiting active.

### 10.2 Phase 1: Assessment Expansion (Weeks 2–3)

**Goal:** Add Phase B data skills diagnostic and custom study plan generation.

- Write Phase B system prompt covering 15–20 questions across 5 skill areas
- Update `/api/chat` to handle two-phase assessment flow with natural transition
- Update results UI to show combined Phase A + Phase B results
- Build study plan generation logic from Phase B results
- Add "Begin Sprint" routing from results page to sprint dashboard
- Update database schema for Phase B results (`phase_b_results` JSONB column)

**Exit Criteria:** A user can complete a full two-phase assessment and receive a personalized study plan with a clear starting sprint assignment.

### 10.3 Phase 2: Sprint System (Weeks 4–6)

**Goal:** Build the complete sprint infrastructure for Sprints 1 and 2.

- Create sprint dashboard UI with progress indicators
- Build sprint workspace pages with full business context
- Generate synthetic datasets for Sprints 1 (5,000 records) and 2 (15,000 records)
- Define rubrics for Sprints 1 and 2 in `api/lib/rubrics.js`
- Build submission system (`/api/submit`) with URL validation
- Build rubric feedback system (`/api/feedback`) with structured JSON output
- Build Ask Coach endpoint (`/api/coach`) with rate limiting and sprint scoping
- Implement sprint progression logic (unlock next sprint after passing)

**Exit Criteria:** A user can complete Sprint 1 end-to-end: read the business problem, download data, submit work, receive feedback, see their score, and progress to Sprint 2.

### 10.4 Phase 3: Portfolio Generation (Weeks 7–8)

**Goal:** Auto-generate case studies from completed sprints.

- Build portfolio page generator (`/api/portfolio/generate`)
- Create case study templates (Markdown and HTML output)
- Build LinkedIn summary generator from case study content
- Create shareable public URLs for individual case studies
- Build portfolio index page showing all completed work

**Exit Criteria:** Completing a sprint automatically produces a shareable case study page with a unique URL and LinkedIn-ready summary.

### 10.5 Phase 4: Remaining Sprints (Weeks 9–12)

**Goal:** Build out Sprints 3–6 content.

- Create synthetic datasets for Sprints 3–6
- Write rubrics for Sprints 3–6 with adjusted category weights
- Configure Ask Coach system prompts for SQL, Python, and visualization topics
- Test full 6-sprint pathway end-to-end

**Exit Criteria:** A user can complete all 6 sprints and have a 6-piece portfolio.

### 10.6 Phase 5: Polish and Launch (Week 13+)

**Goal:** Prepare for public users.

- Build onboarding page with clear value proposition and visual sprint system diagram
- Complete mobile responsive testing and fixes
- Performance optimization (lazy loading, caching, query optimization)
- User testing with 3–5 external testers and iteration based on feedback
- Documentation updates (context bible, README, deployment guide)
- Public launch announcement

**Exit Criteria:** External users can discover, understand, and complete the full bootcamp pathway without guidance from the creator.

---

## 11. Open Technical Decisions

The following decisions from the PRD (Section 16) have technical implications that must be resolved during or before their relevant implementation phase. Each is referenced by its PRD question number.

| PRD # | Question | Recommendation | Technical Impact |
|-------|----------|----------------|------------------|
| 1 | Keep Anthropic as fallback or fully migrate to Gemini? | Keep both behind adapter (Option A) | LLM adapter must support two providers; minimal extra work |
| 2 | How does the LLM evaluate links it can't access? | Require pasted content alongside links (Option B) | Submission form needs a substantial text field; LLM evaluates text only |
| 3 | Should sprint datasets be real or synthetic? | Custom synthetic data (Option B) | Datasets generated via scripts; controlled complexity ensures rubric alignment |
| 4 | Anonymous users vs. lightweight accounts? | Fully anonymous with localStorage (Option A) | No auth system; UUID in browser; risk of data loss on device change |
| 5 | Supabase free tier limits sufficient? | Yes for MVP (Option A) | Monitor usage; revisit at 10K users |
| 6 | How do students run Python for Sprint 5? | Google Colab link (Option B) | No server-side code execution needed; deliverable is a Colab notebook URL |

---

## 12. Testing Strategy

### 12.1 Testing Approach

Given the vibecoding development workflow and single-developer context, testing is primarily manual and incremental. Each feature is verified via curl commands, browser testing, and expected output validation before moving to the next feature. Automated testing may be introduced in Phase 5 as part of launch preparation.

### 12.2 Verification Methods by Component

| Component | Verification Method | Success Criteria |
|-----------|-------------------|------------------|
| API Routes | curl/fetch commands with expected JSON responses | Correct status codes, valid JSON structure, expected data |
| Database Operations | Supabase dashboard inspection + query validation | Data persists across redeployments, schema constraints enforced |
| LLM Adapter | Test both providers with identical prompts | Equivalent response quality, structured JSON output, graceful error handling |
| Assessment Flow | Full end-to-end browser walkthrough | Natural conversation, correct scoring, valid study plan |
| Sprint Submission | Submit test deliverables, verify feedback | URLs validated, feedback returned < 30s, scores structured correctly |
| Portfolio Generation | Submit passing work, verify case study output | Case study generated, URL accessible, LinkedIn summary usable |
| Rate Limiting | Send requests exceeding limits | Requests blocked with informative error message |

### 12.3 End-to-End Smoke Test

Before each phase is considered complete, the following smoke test must pass: a single user can start from the beginning (open the app), complete the relevant new feature (assessment, sprint submission, portfolio generation), and see the expected output without errors. This validates the entire vertical slice.

---

## 13. Success Metrics and Monitoring

### 13.1 North Star Metric

**Number of completed, publicly published sprint case studies.** This single metric captures the entire product loop: assessment completed, sprint started, work submitted, rubric passed, and portfolio published. If this number grows, the product is working.

### 13.2 Technical Health Metrics

| Metric | Target | Collection Method |
|--------|--------|-------------------|
| Assessment completion rate | > 70% | Supabase query: completed assessments / started assessments |
| Phase B continuation rate | > 80% | Supabase query: Phase B results / Phase A completions |
| Sprint start rate | > 50% | Supabase query: users with submissions / users with study plans |
| Sprint completion rate | > 60% | Supabase query: passed submissions / total submissions |
| Submission-to-feedback latency | < 30 seconds | Server-side timestamp logging |
| Average rubric score by sprint | 65–80 range | Supabase aggregate query on `submissions.score` |
| Portfolio publication rate | > 80% | Supabase query: portfolio entries / passed submissions |
| Resubmission rate | 20–40% | Supabase query: submissions with replaced predecessors |
| LLM error rate | < 2% | Server-side error logging on adapter calls |
| API response time (p95) | < 5 seconds | Vercel function metrics |

---

## 14. Explicit Non-Goals

The following capabilities are explicitly out of scope for the MVP. These are not deferred features; they are deliberate exclusions that simplify the system and maintain the zero-cost operational model.

- No video hosting or video-based lessons (sprints are text + data)
- No complex LMS features (no grading curves, peer review, or instructor dashboards)
- No payment system (the product is free, permanently)
- No cohort management (every user is self-paced)
- No heavy authentication (anonymous by default; magic link auth is a future consideration)
- No mobile app (web-responsive design is sufficient)
- No real-time collaboration (this is a solo learning tool)
- No API access for third parties (internal use only)
- No TypeScript (static HTML + CDN React remains the frontend pattern for MVP)
- No server-side code execution (students run code in their own environments or Google Colab)

---

*End of Technical Requirements Document. This document should be updated as development progresses and technical decisions are finalized.*
