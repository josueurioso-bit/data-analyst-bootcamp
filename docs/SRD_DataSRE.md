# Safety Requirements Document
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
| 1.0 | Feb 13, 2026 | Josue | Initial SRD based on PRD v1.0 and TRD v1.0 |

---

## Table of Contents

1. Introduction
2. Current Build Status Assessment
3. Threat Model
4. Privacy and Data Ethics Requirements
5. API and Infrastructure Security
6. LLM Safety and Integrity
7. Client-Side Security
8. Operational Safety
9. Compliance and Legal Considerations
10. Safety Requirements by Rollout Phase
11. Risk Register
12. Incident Response Plan
13. Safety Verification Checklist
14. Definitions and Abbreviations

---

## 1. Introduction

### 1.1 Purpose

This Safety Requirements Document (SRD) defines all security, privacy, ethical, and operational safety controls required for the Data School Readiness Engine (DSRE). It identifies risks in the current Milestone 0 codebase, maps safety requirements to each rollout phase (Phase 0–5), and establishes verification criteria that must be met before features ship.

This document exists because DSRE handles user interactions with AI systems, collects behavioral data (assessment scores), and operates on free-tier infrastructure with inherent constraints. Safety is not an afterthought — it is a design requirement that must be addressed alongside every feature.

### 1.2 Scope

This SRD covers the full product lifecycle from the existing Milestone 0 deployment through the Phase 5 public launch. It addresses six safety domains: privacy and data ethics, API and infrastructure security, LLM safety and integrity, client-side security, operational safety, and compliance.

### 1.3 Reference Documents

| Document | Location | Relationship |
|----------|----------|-------------|
| PRD v1.0 | `docs/PRD.md` | Source of truth for feature decisions |
| TRD v1.0 | `docs/TRD.md` | Engineering specs and architecture |
| Privacy Policy | `privacy.html` | User-facing data practices |
| Rate Limiting Strategy | `docs/RATE_LIMITING.md` | API abuse prevention plan |
| Dev Context Bible | `docs/DATA_ANALYST_CONTEXT.md` | Codebase history and decisions |

### 1.4 Safety Philosophy

DSRE follows a "safe by default" design principle. The system is built for an educational context serving career-switchers who may not have technical sophistication. Safety decisions prioritize user trust and data minimalism over feature richness. When a trade-off exists between collecting more data and protecting privacy, privacy wins.

---

## 2. Current Build Status Assessment

### 2.1 What Exists (Milestone 0)

The deployed application at `data-analyst-bootcamp.vercel.app` includes a conversational AI assessment, SQLite database with ethical data collection, consent checkbox, privacy policy, IP hashing, and CSV export. The tech stack is static HTML + React 18 CDN + Tailwind CSS on the frontend, Vercel Serverless Functions (Node.js) on the backend, SQLite via sql.js for storage, and Anthropic Claude Haiku for AI.

### 2.2 Safety Gaps in Current Build

The following safety issues exist in the Milestone 0 codebase and must be resolved in Phase 0 before any new features are built.

**CRITICAL — Active Vulnerabilities**

| ID | Gap | File(s) Affected | Risk Level | Resolution Phase |
|----|-----|-------------------|------------|-----------------|
| SG-01 | No rate limiting on `/api/chat` | `api/chat.js` | CRITICAL | Phase 0 |
| SG-02 | Ephemeral SQLite on Vercel — data loss on every redeploy | `api/lib/db.js` | CRITICAL | Phase 0 |
| SG-03 | CORS set to wildcard (`*`) — any origin can call the API | `api/chat.js`, `api/export-csv.js` | HIGH | Phase 0 |
| SG-04 | No React error boundaries — JS errors crash entire UI | `index.html` | HIGH | Phase 0 |
| SG-05 | API key is sole protection against abuse — no usage monitoring | `api/chat.js` | HIGH | Phase 0 |

**HIGH — Design Weaknesses**

| ID | Gap | File(s) Affected | Risk Level | Resolution Phase |
|----|-----|-------------------|------------|-----------------|
| SG-06 | No input validation or sanitization on user messages | `api/chat.js` | HIGH | Phase 0 |
| SG-07 | No prompt injection guards in the system prompt | `api/chat.js` | HIGH | Phase 0 |
| SG-08 | Mixed module formats (ESM in chat.js, CJS in export-csv.js) — fragile imports | `api/chat.js`, `api/export-csv.js` | MEDIUM | Phase 0 |
| SG-09 | No request body size limit — memory exhaustion possible | `api/chat.js` | MEDIUM | Phase 0 |
| SG-10 | CSV export has no authentication — anyone can download all assessment data | `api/export-csv.js` | MEDIUM | Phase 0 |

**MEDIUM — Operational Risks**

| ID | Gap | File(s) Affected | Risk Level | Resolution Phase |
|----|-----|-------------------|------------|-----------------|
| SG-11 | No structured error logging — console.error only | All API files | MEDIUM | Phase 0 |
| SG-12 | No health check endpoint for monitoring | None (missing) | MEDIUM | Phase 0 |
| SG-13 | Conversation history sent in full on every request — growing payload | `api/chat.js`, `index.html` | LOW | Phase 1 |
| SG-14 | No Content Security Policy headers | `index.html` | LOW | Phase 5 |

### 2.3 What Works Well

The following safety measures are already implemented and should be preserved:

- IP hashing via SHA-256 before any storage (`api/chat.js` → `hashIp()`)
- Consent checkbox with opt-out model — data only saved when `consentGiven === true`
- Graceful degradation — database errors do not break the quiz experience
- API key stored in Vercel environment variables, never committed to the repo
- `.gitignore` correctly excludes `.env`, `.db`, and `node_modules`
- Privacy policy written at 8th-grade reading level explaining all data practices

---

## 3. Threat Model

### 3.1 Threat Actors

| Actor | Motivation | Capability | Likelihood |
|-------|-----------|-----------|-----------|
| Casual abuser | Drain API credits for fun or vandalism | Can script HTTP requests, no sophistication required | HIGH |
| Prompt injector | Extract system prompts, bypass assessment logic, or manipulate scores | Intermediate — understands LLM behavior | MEDIUM |
| Data scraper | Harvest assessment data from the CSV export endpoint | Low — basic HTTP knowledge | MEDIUM |
| Competitive actor | Copy product logic, datasets, or rubric designs | Moderate — can reverse-engineer public endpoints | LOW |
| Sophisticated attacker | Compromise infrastructure, exfiltrate data, or inject malicious content | Advanced — targets Vercel/Supabase misconfigurations | LOW |

### 3.2 Attack Surfaces

| Surface | Entry Point | What's Exposed | Mitigation Section |
|---------|-------------|---------------|-------------------|
| Assessment API | `POST /api/chat` | LLM system prompt, API credits, assessment logic | Section 5 (API Security), Section 6 (LLM Safety) |
| CSV Export | `GET /api/export-csv` | All stored assessment records | Section 5.4 |
| Sprint Submission | `POST /api/submit` | Submission storage, URL validation logic | Section 5.5 |
| Ask Coach | `POST /api/coach` | LLM credits, prompt context | Section 6 (LLM Safety) |
| Feedback Engine | `POST /api/feedback` | LLM credits, rubric definitions | Section 6 (LLM Safety) |
| Frontend | `index.html` (browser) | User session, localStorage UUID, XSS surface | Section 7 (Client-Side) |
| External URLs | Submitted Google Sheets, GitHub, Tableau links | SSRF risk during URL validation | Section 5.5 |

### 3.3 Data Classification

| Data Type | Classification | Storage Location | Sensitivity |
|-----------|---------------|-----------------|-------------|
| Assessment pillar scores | Internal | Supabase `assessments` | LOW — anonymous, no PII |
| IP hash (SHA-256) | Internal | Supabase `assessments` | LOW — one-way, irreversible |
| Anonymous UUID | Session | Browser localStorage + Supabase `users` | LOW — no identity link |
| Sprint submissions (URLs + text) | User Content | Supabase `submissions` | MEDIUM — contains user work product |
| LLM conversation logs | Debug | Supabase `assessments.conversation_log` | MEDIUM — could contain incidental PII from user messages |
| API keys | Secret | Vercel environment variables | CRITICAL — never stored in code or logs |
| Supabase credentials | Secret | Vercel environment variables | CRITICAL — never stored in code or logs |

---

## 4. Privacy and Data Ethics Requirements

### 4.1 Five C's Framework (Non-Negotiable)

The Five C's framework established in Milestone 0 governs all data handling. These are not guidelines — they are hard requirements that override feature requests.

**4.1.1 Consent**

| Requirement ID | Requirement | Verification |
|---------------|-------------|-------------|
| PR-01 | No data is stored in Supabase unless the user has actively opted in via the consent checkbox | Test: complete assessment with consent unchecked, verify zero database writes |
| PR-02 | The consent checkbox defaults to checked (opt-out model), matching current behavior | UI inspection |
| PR-03 | Consent state is passed to the backend on every API request that could trigger a database write | Code review of all POST endpoints |
| PR-04 | Users who decline consent receive the identical product experience — assessment results display on screen, sprint access is unaffected | End-to-end test with consent off |

**4.1.2 Collection Limits**

| Requirement ID | Requirement | Verification |
|---------------|-------------|-------------|
| PR-05 | No PII is collected anywhere: no names, emails, phone numbers, physical addresses, or raw IP addresses | Schema audit of all four Supabase tables |
| PR-06 | IP addresses are hashed with SHA-256 before any storage — the raw IP never reaches the database | Code review of `hashIp()` in every endpoint that stores data |
| PR-07 | Individual question-level answers are NOT stored — only aggregate pillar scores | Schema audit: no `answers` or `responses` column exists |
| PR-08 | Conversation logs stored for debugging must be flagged as potentially containing incidental PII and purged on a 30-day rolling basis | Supabase scheduled function or manual process |

**4.1.3 Confidentiality**

| Requirement ID | Requirement | Verification |
|---------------|-------------|-------------|
| PR-09 | All database queries operate on anonymous UUIDs — no cross-referencing with external identity systems | Code review of all Supabase queries |
| PR-10 | The CSV export endpoint must not expose IP hashes in the exported data | Test: download CSV, confirm no `ip_hash` column |
| PR-11 | Supabase Row Level Security (RLS) policies must prevent users from querying other users' data | Supabase dashboard policy audit |

**4.1.4 Control**

| Requirement ID | Requirement | Verification |
|---------------|-------------|-------------|
| PR-12 | Users can take the full assessment, complete all sprints, and publish portfolios without ever consenting to data collection | Full pathway test with consent off |
| PR-13 | The consent checkbox can be toggled at any point during the session and takes effect immediately for subsequent API calls | UI + backend test |

**4.1.5 Communication**

| Requirement ID | Requirement | Verification |
|---------------|-------------|-------------|
| PR-14 | The privacy policy (`privacy.html`) is maintained at or below an 8th-grade reading level | Readability score check (Flesch-Kincaid) |
| PR-15 | Any new data collection (Phase B results, submissions, portfolio entries) must be reflected in an updated privacy policy before the feature ships | Document review before each phase release |
| PR-16 | The privacy policy must be accessible from every page of the application, not just the assessment page | UI audit |

### 4.2 Conversation Log Handling

LLM conversations may contain incidental PII if a user volunteers personal information during the assessment (e.g., "My name is Alex and I work at..."). The following rules apply:

| Requirement ID | Requirement |
|---------------|-------------|
| PR-17 | Conversation logs are stored only if consent is given |
| PR-18 | Logs are stored in a JSONB column, not as flat text, to enable selective field access |
| PR-19 | Logs are used only for debugging assessment quality and LLM behavior — never for marketing, profiling, or resale |
| PR-20 | A 30-day retention policy must be implemented — logs older than 30 days are automatically deleted |

---

## 5. API and Infrastructure Security

### 5.1 Rate Limiting (Phase 0 — Critical)

| Requirement ID | Requirement | Endpoint | Limit |
|---------------|-------------|----------|-------|
| API-01 | Rate limiting must be enforced on the assessment endpoint | `POST /api/chat` | 20 requests per IP hash per hour |
| API-02 | Rate limiting must be enforced on the coach endpoint | `POST /api/coach` | 20 questions per sprint per user UUID |
| API-03 | Rate limiting must be enforced on the submission endpoint | `POST /api/submit` | 5 submissions per sprint per user UUID per hour |
| API-04 | Rate limiting must be enforced on the feedback endpoint | `POST /api/feedback` | 1 evaluation per submission |
| API-05 | Rate-limited responses must return HTTP 429 with a `Retry-After` header and a user-friendly error message | All rate-limited endpoints | N/A |
| API-06 | Rate limit state must persist across serverless function invocations (Vercel KV or Upstash Redis) | All rate-limited endpoints | N/A |

### 5.2 CORS Hardening (Phase 0)

| Requirement ID | Requirement |
|---------------|-------------|
| API-07 | Replace wildcard CORS (`Access-Control-Allow-Origin: *`) with the specific production origin (`https://data-analyst-bootcamp.vercel.app`) |
| API-08 | In local development, allow `localhost` origins via environment-based CORS configuration |
| API-09 | The CSV export endpoint must have the same CORS restrictions as all other endpoints |

### 5.3 Input Validation (Phase 0)

| Requirement ID | Requirement | Endpoint |
|---------------|-------------|----------|
| API-10 | Validate that `messages` is an array with a maximum length of 200 entries | `POST /api/chat` |
| API-11 | Validate that each message object contains only `role` (string: "user" or "assistant") and `content` (string, max 5,000 characters) | `POST /api/chat` |
| API-12 | Reject request bodies exceeding 500 KB | All POST endpoints |
| API-13 | Validate `sprintId` is an integer between 1 and 6 | `POST /api/submit`, `POST /api/feedback`, `POST /api/coach` |
| API-14 | Validate `userId` matches UUID v4 format | All endpoints accepting userId |
| API-15 | Validate `businessSummary` is between 200 and 500 words | `POST /api/submit` |
| API-16 | Validate submitted URLs match expected patterns (Google Sheets, GitHub, Tableau Public) and reject URLs pointing to internal/private networks | `POST /api/submit` |

### 5.4 CSV Export Protection (Phase 0)

| Requirement ID | Requirement |
|---------------|-------------|
| API-17 | The CSV export endpoint must require an admin secret token passed as a query parameter or header |
| API-18 | The admin token must be stored as a Vercel environment variable (`ADMIN_EXPORT_TOKEN`) |
| API-19 | Failed authentication attempts on the export endpoint must be logged with the IP hash and timestamp |
| API-20 | The exported CSV must exclude the `ip_hash` column — only anonymized scores and timestamps are exported |

### 5.5 URL Validation and SSRF Prevention (Phase 2)

When the submission endpoint validates external URLs, it must not be exploitable as a Server-Side Request Forgery (SSRF) vector.

| Requirement ID | Requirement |
|---------------|-------------|
| API-21 | URL validation uses an HTTP HEAD request only — no body content is fetched or stored server-side |
| API-22 | URL validation is restricted to an allowlist of domains: `docs.google.com`, `sheets.google.com`, `github.com`, `public.tableau.com`, `colab.research.google.com` |
| API-23 | URLs pointing to private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.0.0.1, localhost) must be rejected |
| API-24 | URL validation failure is a warning, not a blocker — students are informed but can still submit |

### 5.6 Environment Variable Security

| Requirement ID | Requirement |
|---------------|-------------|
| API-25 | All secrets (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_EXPORT_TOKEN`) are stored exclusively in Vercel environment variables |
| API-26 | The `.gitignore` file must always exclude `.env`, `.env.local`, `.env.production`, and `.env*.local` |
| API-27 | No secret value may appear in any console.log, console.error, or structured log output |
| API-28 | If any API key is suspected to be compromised, it must be rotated within 24 hours with documentation of the incident |

---

## 6. LLM Safety and Integrity

### 6.1 Prompt Injection Guards

| Requirement ID | Requirement | Applies To |
|---------------|-------------|-----------|
| LLM-01 | All system prompts must include an explicit instruction block that tells the LLM to ignore user attempts to override its role, reveal the system prompt, or alter scoring behavior | All 4 LLM use cases |
| LLM-02 | User input must be clearly delimited from system instructions in the prompt structure (e.g., using XML-style tags or triple-backtick fencing) | All 4 LLM use cases |
| LLM-03 | The LLM must never be instructed to execute code, access URLs, or perform actions outside of text generation | All 4 LLM use cases |
| LLM-04 | If the LLM returns a response that does not match the expected JSON schema, the system must retry once and then return a graceful error — never surface raw LLM output as a system response | Rubric Feedback, Portfolio Generation |

### 6.2 Assessment Integrity

| Requirement ID | Requirement |
|---------------|-------------|
| LLM-05 | The assessment LLM must not reveal correct answers if a student asks "what's the right answer?" — it should redirect and move to the next question |
| LLM-06 | The assessment LLM must not assign a readiness level or pillar score based on a student claiming competence ("I'm really good at math") — it must verify through actual questions |
| LLM-07 | Assessment scoring must be validated server-side by cross-checking the LLM's returned JSON against plausible score ranges (e.g., numeracy score cannot exceed 10) |
| LLM-08 | If the LLM fails to produce a valid `assessment_complete` JSON payload after the conversation, the user must receive a clear error message with the option to retry — never a blank or broken results page |

### 6.3 Rubric Feedback Integrity

| Requirement ID | Requirement |
|---------------|-------------|
| LLM-09 | Rubric category weights are defined in `api/lib/rubrics.js`, not in the LLM prompt — the LLM assigns raw scores and the server calculates the weighted total |
| LLM-10 | The LLM must not be able to override the passing threshold (60/100) — pass/fail is computed server-side from the returned scores |
| LLM-11 | Rubric feedback must be constructive and educational — the system prompt must explicitly instruct the LLM to frame all criticism as growth opportunities |
| LLM-12 | If rubric feedback contains scores outside the valid range (e.g., a score of 15 on a max-10 category), the server must reject and retry |

### 6.4 Ask Coach Guardrails

| Requirement ID | Requirement |
|---------------|-------------|
| LLM-13 | The Coach must never produce complete deliverables (full SQL queries, complete Python scripts, finished memos) — it teaches concepts and explains approaches only |
| LLM-14 | The Coach must stay scoped to the current sprint's skill area — cross-sprint questions are redirected politely, not answered |
| LLM-15 | The 20-question-per-sprint limit is enforced server-side, not client-side — the backend tracks usage in Supabase and rejects requests beyond the limit |
| LLM-16 | The Coach must not reveal rubric scoring criteria beyond what's already visible in the rubric preview — it should not coach students on how to "game" the rubric |

### 6.5 LLM Output Sanitization

| Requirement ID | Requirement |
|---------------|-------------|
| LLM-17 | All LLM text output must be treated as untrusted content and rendered with appropriate escaping in the frontend (React's default JSX escaping is sufficient for text; `dangerouslySetInnerHTML` must never be used with LLM output) |
| LLM-18 | LLM responses must not contain executable code that could be rendered in the browser (e.g., script tags, event handlers, or markdown that renders as HTML with event handlers) |
| LLM-19 | If the LLM returns content that fails JSON parsing, the raw text must be logged for debugging but never displayed to the user as-is |

### 6.6 Provider Failover Safety

| Requirement ID | Requirement |
|---------------|-------------|
| LLM-20 | If the primary LLM provider (Gemini) returns an error or times out, the adapter must attempt the fallback provider (Anthropic) before returning an error to the user |
| LLM-21 | Provider failover must be transparent to the user — the response format and quality should be equivalent regardless of which provider served the request |
| LLM-22 | If both providers fail, the user must receive a clear, non-technical error message: "Our AI tutor is temporarily unavailable. Please try again in a few minutes." |
| LLM-23 | Gemini free tier limits (15 req/min, 1,500 req/day) must be tracked application-side — when approaching 80% of the daily limit, the system should automatically route new requests to the Anthropic fallback |

---

## 7. Client-Side Security

### 7.1 User Identity and Session Safety

| Requirement ID | Requirement |
|---------------|-------------|
| CS-01 | The anonymous UUID stored in the browser is generated using `crypto.randomUUID()` — not `Math.random()` or timestamp-based approaches |
| CS-02 | The UUID must never be exposed in URL parameters — it is passed in request bodies only |
| CS-03 | If the UUID is missing or corrupted in storage, a new one is generated automatically — the user starts fresh with no data loss to other users |

### 7.2 XSS Prevention

| Requirement ID | Requirement |
|---------------|-------------|
| CS-04 | All LLM-generated content is rendered through React's JSX escaping — raw HTML insertion (`dangerouslySetInnerHTML`) is prohibited for any LLM output |
| CS-05 | User-submitted text (business summaries) displayed in the UI must also pass through React's default escaping |
| CS-06 | External URLs displayed in the portfolio are rendered as plain text links, not embedded iframes, unless from the explicitly allowed domain list |

### 7.3 Content Security Policy (Phase 5)

| Requirement ID | Requirement |
|---------------|-------------|
| CS-07 | Before public launch, implement a Content Security Policy header that restricts script sources to `unpkg.com` (React), `cdn.tailwindcss.com` (Tailwind), and `self` |
| CS-08 | The CSP must block inline script execution except for the Babel-transpiled React code (use a nonce-based approach) |

---

## 8. Operational Safety

### 8.1 Graceful Degradation Rules

These rules are inherited from Milestone 0 and must be maintained across all new features.

| Requirement ID | Requirement |
|---------------|-------------|
| OP-01 | Database errors must never prevent a user from seeing their assessment results — results display from the LLM response regardless of database state |
| OP-02 | LLM provider errors must never crash the server — return a user-friendly error message and log the failure |
| OP-03 | Rate limit exhaustion must return a clear message with the `Retry-After` value, not a generic 500 error |
| OP-04 | Supabase downtime must not prevent the assessment conversation from functioning — degrade gracefully by skipping data persistence and notifying the user |
| OP-05 | If the Gemini free tier daily limit is reached, the system must either failover to Anthropic or display a clear "daily capacity reached, try again tomorrow" message |

### 8.2 Error Logging and Monitoring

| Requirement ID | Requirement |
|---------------|-------------|
| OP-06 | All API errors must be logged with: timestamp, endpoint, error type, error message, and IP hash (never raw IP) |
| OP-07 | LLM response parsing failures must be logged with the raw response (redacted for PII) for debugging assessment quality |
| OP-08 | A health check endpoint (`GET /api/health`) must be created that verifies: Supabase connectivity, LLM provider reachability, and returns the current rate limit counters |
| OP-09 | Console logs must never contain API keys, raw IPs, or user-submitted content that could include PII |

### 8.3 Deployment Safety

| Requirement ID | Requirement |
|---------------|-------------|
| OP-10 | All deployments to production are triggered by pushes to the `main` branch — no manual Vercel deployments |
| OP-11 | Before every merge to main, the safety verification checklist (Section 13) must be completed |
| OP-12 | Environment variables must be verified in the Vercel dashboard after any deployment that adds new variables |
| OP-13 | If a deployment breaks the assessment flow, Vercel's instant rollback feature must be used immediately — do not attempt live fixes |

### 8.4 Free Tier Risk Management

| Resource | Free Tier Limit | Safety Threshold (Trigger Alert) | Mitigation Action |
|----------|----------------|--------------------------------|-------------------|
| Gemini API | 1,500 requests/day | 1,200 requests (80%) | Failover to Anthropic |
| Supabase Storage | 500 MB | 400 MB (80%) | Purge conversation logs older than 30 days |
| Supabase Rows | 50,000 | 40,000 (80%) | Archive old assessment data to CSV, delete from database |
| Vercel Serverless | 100 GB-hours/month | 80 GB-hours (80%) | Investigate high-usage endpoints, optimize or add caching |

---

## 9. Compliance and Legal Considerations

### 9.1 Applicable Regulations

DSRE does not target specific regulated populations (e.g., children under 13, EU residents), but the following regulations should be considered as the product scales.

| Regulation | Applicability | Current Status | Action Needed |
|-----------|--------------|---------------|--------------|
| COPPA (Children's Online Privacy) | Potentially applicable if minors use the tool | Not addressed — no age gate exists | Add a Terms of Service page stating the platform is intended for users 18+, or implement age verification before Phase 5 |
| CCPA (California Consumer Privacy) | Applicable if California residents use the tool | Partially addressed — no PII is collected, so most CCPA requirements are satisfied by design | Monitor if the definition of "personal information" under CCPA expands to cover anonymous behavioral data |
| GDPR (EU General Data Protection) | Applicable if EU residents use the tool | Partially addressed — data minimization and consent mechanisms align with GDPR principles | If EU users are expected, add a GDPR-specific privacy notice and ensure right-to-erasure is possible (currently impossible due to anonymity) |
| FERPA (Education Records) | Not applicable — DSRE is not an educational institution | N/A | No action needed unless DSRE partners with an accredited institution |

### 9.2 Terms of Service

| Requirement ID | Requirement |
|---------------|-------------|
| CL-01 | Before public launch (Phase 5), a Terms of Service page must be published defining: acceptable use, age requirements (18+), disclaimers about AI-generated feedback, and data practices |
| CL-02 | The ToS must explicitly state that AI-generated rubric feedback is advisory, not an authoritative evaluation of professional competence |
| CL-03 | The ToS must note that portfolio case studies are the user's intellectual property — DSRE claims no ownership of user-submitted work |

### 9.3 AI Disclosure

| Requirement ID | Requirement |
|---------------|-------------|
| CL-04 | The onboarding page must clearly disclose that assessments, feedback, and coaching are powered by AI, not human instructors |
| CL-05 | Rubric feedback must include a visible label: "This feedback was generated by AI and is intended as a learning tool, not a professional evaluation" |

---

## 10. Safety Requirements by Rollout Phase

This section maps every safety requirement to its implementation phase, ensuring nothing is missed during development.

### Phase 0: Foundation Fixes

| Requirement IDs | Description |
|----------------|-------------|
| SG-01 through SG-12 | Resolve all critical and high safety gaps from Section 2.2 |
| API-01 through API-09 | Rate limiting, CORS hardening, input validation foundations |
| API-17 through API-20 | CSV export protection |
| API-25 through API-28 | Environment variable security verification |
| LLM-01 through LLM-04 | Prompt injection guards added to existing assessment prompt |
| OP-06 through OP-09 | Error logging and health check endpoint |
| OP-10 through OP-13 | Deployment safety procedures established |
| PR-01 through PR-06 | Five C's compliance verified for Supabase migration |

### Phase 1: Assessment Expansion

| Requirement IDs | Description |
|----------------|-------------|
| LLM-05 through LLM-08 | Assessment integrity for the expanded two-phase flow |
| PR-07, PR-08 | Collection limit verification for Phase B data |
| PR-15 | Privacy policy updated to reflect Phase B data collection |
| PR-17 through PR-20 | Conversation log handling rules |
| API-10 through API-12 | Input validation for expanded conversation payloads |

### Phase 2: Sprint System

| Requirement IDs | Description |
|----------------|-------------|
| API-13 through API-16 | Input validation for submission and coach endpoints |
| API-21 through API-24 | SSRF prevention in URL validation |
| LLM-09 through LLM-16 | Rubric feedback integrity and coach guardrails |
| LLM-17 through LLM-19 | LLM output sanitization |
| API-02 through API-04 | Rate limiting for coach, submit, and feedback endpoints |
| PR-11 | Supabase RLS policies for submission data |

### Phase 3: Portfolio Generation

| Requirement IDs | Description |
|----------------|-------------|
| CS-06 | External URL rendering in portfolio pages |
| CL-03 | Intellectual property disclosure for user-submitted work |
| PR-15 | Privacy policy updated for portfolio data collection |

### Phase 4: Remaining Sprints

No new safety requirements — apply all Phase 2 controls to Sprints 3–6.

### Phase 5: Polish and Launch

| Requirement IDs | Description |
|----------------|-------------|
| CS-07, CS-08 | Content Security Policy implementation |
| CS-14 | Final CSP header deployment |
| CL-01 through CL-05 | Terms of Service and AI disclosure |
| PR-14 through PR-16 | Final privacy policy review and readability check |
| OP-11 | Full safety checklist pass before public launch |

---

## 11. Risk Register

| Risk ID | Risk Description | Likelihood | Impact | Mitigation | Owner |
|---------|-----------------|-----------|--------|-----------|-------|
| R-01 | API key leak via commit or log | Low | Critical | `.gitignore` enforced, log audit, key rotation plan (API-25–28) | Phase 0 |
| R-02 | LLM prompt injection manipulates assessment scores | Medium | High | Prompt injection guards, server-side score validation (LLM-01–08) | Phase 0 |
| R-03 | Uncontrolled API spend from Claude Haiku calls | High | Medium | Rate limiting + Gemini migration + budget alerts (API-01, LLM-23) | Phase 0 |
| R-04 | Data loss from Vercel redeployment (current SQLite) | High | High | Supabase migration (SG-02) | Phase 0 |
| R-05 | Gemini free tier exhaustion during peak usage | Medium | Medium | Anthropic fallback, daily limit tracking (LLM-20–23) | Phase 0 |
| R-06 | User submits malicious URL that triggers SSRF | Low | Medium | Domain allowlist, private IP rejection (API-21–24) | Phase 2 |
| R-07 | User volunteers PII in conversation and it gets stored | Medium | Medium | 30-day log retention, PII warning in privacy policy (PR-17–20) | Phase 1 |
| R-08 | Coach gives direct answers instead of teaching | Medium | Low | System prompt guardrails, human spot-checks (LLM-13–16) | Phase 2 |
| R-09 | Minor uses the platform without age verification | Medium | Medium | Age disclosure in ToS, 18+ statement on onboarding page (CL-01) | Phase 5 |
| R-10 | LLM hallucinates feedback that misleads student career decisions | Low | Medium | AI disclosure label on all feedback (CL-04–05), rubric server-side validation (LLM-09–12) | Phase 2 |

---

## 12. Incident Response Plan

### 12.1 Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|--------------|---------|
| SEV-1 (Critical) | Data breach, API key compromised, production fully down | Within 1 hour | API key exposed in public commit |
| SEV-2 (High) | Feature broken for all users, LLM producing harmful output, data corruption | Within 4 hours | Assessment returning wrong scores for everyone |
| SEV-3 (Medium) | Feature degraded, rate limits not enforced, single endpoint down | Within 24 hours | CSV export returning empty results |
| SEV-4 (Low) | Cosmetic issues, non-critical logging failures, minor UX bugs | Within 1 week | Error boundary showing fallback UI unnecessarily |

### 12.2 Response Procedures

**SEV-1: API Key Compromise**
1. Immediately rotate the compromised key in the provider dashboard (Anthropic, Gemini, or Supabase)
2. Update the Vercel environment variable with the new key
3. Trigger a redeployment to pick up the new variable
4. Audit Vercel function logs for unauthorized usage during the exposure window
5. Document the incident with timeline, impact, and prevention measures

**SEV-1: Data Breach**
1. Assess scope — determine which data was exposed (note: no PII is stored by design)
2. If IP hashes were exposed, no action needed — SHA-256 hashes are irreversible
3. If conversation logs were exposed, assess for incidental PII content
4. Update the privacy policy if needed to disclose the incident
5. Document and implement additional controls to prevent recurrence

**SEV-2: LLM Producing Harmful Output**
1. Enable `DEMO_MODE=true` in Vercel environment variables to disable the assessment endpoint
2. Review the system prompt for vulnerabilities
3. Test the fix against the harmful input pattern
4. Redeploy with the updated prompt
5. Disable DEMO_MODE and verify normal operation

**General Escalation Path**
Since DSRE is a solo-operated product, the incident response chain is: detect → assess severity → apply immediate mitigation (DEMO_MODE or Vercel rollback) → investigate root cause → fix and redeploy → document.

---

## 13. Safety Verification Checklist

This checklist must be completed before each phase is marked done. It is the safety equivalent of the TRD's end-to-end smoke test.

### Pre-Deployment Checklist (Every Phase)

- [ ] No API keys, secrets, or raw IPs appear in any console.log statement
- [ ] `.gitignore` is unchanged and includes all sensitive file patterns
- [ ] All new POST endpoints validate input format and reject oversized payloads
- [ ] Rate limiting is active on all endpoints that trigger LLM calls or database writes
- [ ] CORS is restricted to the production origin (not wildcard)
- [ ] LLM system prompts include prompt injection guard blocks
- [ ] LLM output is validated against expected JSON schemas before use
- [ ] Database writes only occur when consent is verified as `true`
- [ ] No PII fields exist in any new or modified database table
- [ ] Error handling returns user-friendly messages, not stack traces or raw error objects
- [ ] Assessment can complete end-to-end with both consent on and consent off

### Phase-Specific Additions

**Phase 0 additions:**
- [ ] Supabase connection works, data persists across redeployment
- [ ] Rate limiting returns 429 with Retry-After header
- [ ] Health check endpoint returns all-green status
- [ ] CSV export requires admin token

**Phase 2 additions:**
- [ ] Coach refuses to produce complete deliverables (test with "write me the SQL query")
- [ ] Coach stays scoped to sprint topic (test with cross-sprint question)
- [ ] URL validation rejects private IP ranges
- [ ] Rubric scores are computed server-side, not taken directly from LLM output
- [ ] Supabase RLS policies prevent cross-user data access

**Phase 5 additions:**
- [ ] Content Security Policy header is active
- [ ] Terms of Service page is published and linked
- [ ] AI disclosure label appears on all feedback
- [ ] Privacy policy reflects all current data practices
- [ ] Age requirement (18+) is stated on the onboarding page

---

## 14. Definitions and Abbreviations

| Term | Definition |
|------|-----------|
| DSRE | Data School Readiness Engine |
| SRD | Safety Requirements Document |
| PII | Personally Identifiable Information (names, emails, phone numbers, raw IPs, physical addresses) |
| Five C's | Ethical data framework: Consent, Collection limits, Confidentiality, Control, Communication |
| SSRF | Server-Side Request Forgery — a vulnerability where the server is tricked into making requests to internal resources |
| RLS | Row Level Security — a Supabase/PostgreSQL feature that restricts which rows a query can access based on the requesting user |
| CSP | Content Security Policy — a browser security header that restricts which scripts and resources can execute on a page |
| CORS | Cross-Origin Resource Sharing — HTTP headers that control which domains can call your API |
| LLM | Large Language Model (the AI systems powering assessment, feedback, coaching, and portfolio generation) |
| UUID | Universally Unique Identifier — a randomly generated ID used to track anonymous users |

---

*End of Safety Requirements Document. This document should be updated as development progresses and new safety considerations arise. Each resolved risk should be marked with its resolution date and the phase in which it was addressed.*
