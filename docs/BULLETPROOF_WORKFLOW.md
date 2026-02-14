# Bulletproof Vibe Coding Workflow
## Your Complete System for AI-Assisted Development

**Last Updated:** February 14, 2026
**For:** Josue (and future you)
**Purpose:** A reusable process for every project, forever

---

## 🎯 The Philosophy

**Vibe coding is NOT winging it.** It's **systematic delegation** to AI with clear constraints.

You are the **director**. The AI is the **crew**. The Document Trinity is your **screenplay**.

This workflow maximizes AI assistance while maintaining **human control** over:
1. Product vision (what gets built)
2. Architecture decisions (how it's structured)  
3. Safety boundaries (what's protected)
4. Quality standards (when it's done)

---

## 📚 **Your Document System**

### The Document Trinity (Required for Every Project)

| Document | Purpose | Read By | Updated When |
|----------|---------|---------|--------------|
| **PRD** | What and why | Everyone | When features change |
| **TRD** | How (technically) | Developers, AI | When architecture changes |
| **SRD** | Safety guardrails | Developers, AI | When risks are discovered |

### Support Documents (Created Once, Reused Forever)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| `.clauderules` | AI system prompt | **Every project** — copy and customize |
| `SESSION_START.md` | Pre-coding checklist | **Every coding session** |
| `MIGRATION_PLAN.md` | Major infrastructure changes | When changing databases, providers, etc. |
| `LLM_ADAPTER_SPEC.md` | Provider abstraction guide | When integrating AI models |
| `DATASET_GENERATION_SPEC.md` | Synthetic data creation | When building data-heavy features |

### Project-Specific Docs (As Needed)

- `DATA_ANALYST_CONTEXT.md` — Existing codebase history (for ongoing projects)
- `RATE_LIMITING.md` — API abuse prevention strategy
- `DEPLOYMENT.md` — Platform-specific deployment steps
- `SESSION_LOG.md` — Development journal (what worked, what didn't)

---

## 🔄 **The Complete Workflow Loop**

### Phase 0: Before Writing Any Code

#### Step 1: Problem Definition (1-2 hours)
**Output:** PRD Section 2 (Problem Statement)

Ask yourself:
- Who is this for? (user persona)
- What specific pain do they feel? (the problem)
- What exists today? (current state)
- What's missing? (the gap)

**Example:** "Career switchers can't afford $10K bootcamps. Free resources exist but are scattered with no structure. The gap: no guided pathway from assessment to portfolio."

#### Step 2: Product Vision (2-3 hours)
**Output:** PRD Sections 1, 3, 5, 6, 7 (Executive Summary, Vision, Core Loop, Features)

Define:
- What's the **minimum** version that proves the concept?
- What's the **one metric** that matters most?
- What are we **explicitly NOT building**? (non-goals)
- How does the user flow from start to finish? (core product loop)

**Tool:** Use Claude to help structure these sections. Feed it your rough thoughts, have it organize into PRD format.

#### Step 3: Technical Planning (3-4 hours)
**Output:** TRD Sections 3, 4, 5, 10 (Architecture, Database, APIs, Phased Plan)

Decide:
- Tech stack (frontend, backend, database, hosting)
- Database schema (tables, columns, relationships)
- API routes (what endpoints exist, what they do)
- **Phases** (what gets built in what order, with exit criteria)

**Critical:** Define phases with **clear exit criteria** (see TRD Section 10).

#### Step 4: Safety Audit (2-3 hours)
**Output:** SRD Sections 2, 3, 4, 10 (Current gaps, Threat model, Requirements, Phase mapping)

Identify:
- What could go wrong? (threat actors, attack surfaces)
- What data are we collecting? (privacy requirements)
- What constraints exist? (free tier limits, rate limits)
- What must work before shipping? (verification checklist)

**Tool:** Use the SRD template from this project. Copy and adapt.

#### Step 5: Workflow Setup (1 hour)
**Output:** `.clauderules`, `SESSION_START.md`, folder structure

Actions:
- Copy `.clauderules` template, customize for your project
- Copy `SESSION_START.md`, adjust for your workflow
- Create `docs/` folder for all documentation
- Create `scripts/` folder for generation/validation scripts
- Set up Git repo and `.gitignore`

**Total Phase 0 Time:** 10-15 hours of planning before any code

**Why worth it:** Prevents 40+ hours of wasted effort from building the wrong thing, choosing wrong architecture, or discovering security holes in production.

---

### Phase 1+: Building Features

#### Each Coding Session (Repeat This Loop)

**1. SESSION START (10 minutes)**
- [ ] Follow `SESSION_START.md` checklist
- [ ] Pull latest code: `git pull origin main`
- [ ] Load Document Trinity in VS Code
- [ ] Define today's goal (one sentence)
- [ ] Identify which phase you're in
- [ ] Check exit criteria for current phase

**2. CONTEXT LOADING (5 minutes)**
First prompt to Claude Code:

```
I'm working on [TODAY'S GOAL].

Current phase: [Phase X]
Files to modify: [list them]

Before we start, please:
1. Read .clauderules
2. Read docs/PRD.md Section [relevant section]
3. Read docs/TRD.md Section [relevant section]
4. Check docs/SRD.md for safety requirements related to [feature name]

Once you've reviewed those, show me a plan for how we'll accomplish this task. 
Break it into 3-5 steps. Wait for my approval before writing any code.
```

**3. PLAN REVIEW (5-10 minutes)**
- Claude shows you the plan
- You verify it aligns with Document Trinity
- You check for SRD violations (security, privacy, constraints)
- You approve, request changes, or reject

**4. INCREMENTAL BUILDING (1-3 hours)**
- Build ONE feature at a time
- Test after each change (curl, browser, Supabase dashboard)
- Commit after each working increment
- If Claude suggests something that conflicts with your docs → point to the constraint

**Example conversation:**
```
Claude: "I'll add TypeScript for better type safety"
You: "Check .clauderules — TypeScript is explicitly out of scope for MVP. 
      Reason: No build step is a hard constraint. Suggest alternatives."
Claude: "Understood. I'll use JSDoc comments for type hints instead."
```

**5. VERIFICATION (15-30 minutes)**
- Run the phase-specific verification checklist (SRD Section 13)
- Complete the end-to-end smoke test (TRD Section 12)
- Check browser console for errors
- Check Vercel logs for errors
- Test with consent ON and consent OFF

**6. COMMIT & DEPLOY (10 minutes)**
```bash
git add -A
git commit -m "[PHASE X] Feature description

- Bullet point what changed
- Why it changed
- What was tested

Verified: [test method]"

git push origin main
```

Vercel auto-deploys. Wait 2 minutes, test production.

**7. SESSION END (5 minutes)**
- [ ] Update `SESSION_LOG.md` with session notes
- [ ] If decisions were made → update PRD/TRD/SRD
- [ ] If you discovered a new pattern → add to `.clauderules`
- [ ] If you got stuck → document the blocker

**Total per Session:** 2-4 hours of focused work

---

### Phase Completion (Before Moving to Next Phase)

**1. Exit Criteria Review**
- [ ] All requirements from TRD Section 10.[phase] are met
- [ ] All safety checks from SRD Section 10.[phase] pass
- [ ] End-to-end smoke test works
- [ ] Phase-specific verification checklist complete

**2. Documentation Update**
- [ ] PRD: Mark "Open Questions" as DECIDED
- [ ] TRD: Update "Current State" section
- [ ] SRD: Update "Risk Register" with anything discovered
- [ ] SESSION_LOG: Summary of phase learnings

**3. Demo Recording (Optional but Recommended)**
- Record 2-minute Loom video showing the feature working
- Saves for portfolio, presentations, and debugging

**4. Phase Retrospective**
Ask yourself:
- What went well?
- What was harder than expected?
- What would I do differently next time?
- What should I add to my workflow documents?

**Only then:** Move to next phase.

---

## 🛡️ **Safety Net: When Things Go Wrong**

### If Code Breaks
```bash
# Immediate rollback
git log --oneline -5  # Find last working commit
git reset --hard <commit-hash>
git push origin main --force

# Vercel auto-deploys the rollback
```

### If AI Suggests Something Dangerous
**Don't just accept it.** Check:
1. Does this violate `.clauderules`?
2. Does this create a security hole (SRD)?
3. Does this conflict with our architecture (TRD)?

If yes → **Push back.** Ask Claude to revise.

### If You're Stuck for >2 Hours
**Stop coding.** Instead:
1. Document exactly what's not working
2. Review the relevant sections of PRD/TRD/SRD
3. Ask Claude for alternative approaches
4. If still stuck → take a break, come back tomorrow
5. If stuck after 2 sessions → ask for help (Discord, Twitter, etc.)

### If Vercel Deployment Fails
Check the build logs for:
- Missing environment variables
- npm install failures
- Syntax errors

Fix locally first, then redeploy.

---

## 🔁 **Reusable Patterns for Future Projects**

### Starting a New Project? Copy These:

1. **Document Templates**
   - `docs/PRD_TEMPLATE.md` (from PRD_DataSRE.md structure)
   - `docs/TRD_TEMPLATE.md` (from TRD_DataSRE.md structure)
   - `docs/SRD_TEMPLATE.md` (from SRD_DataSRE.md structure)

2. **Workflow Files**
   - `.clauderules` (customize constraints for new project)
   - `docs/SESSION_START.md` (adjust checklist as needed)
   - `.gitignore` (preserves secrets)

3. **Tech Stack Defaults**
   - Frontend: Static HTML + React CDN (no build step)
   - Backend: Vercel Serverless Functions
   - Database: Supabase PostgreSQL (persistent)
   - AI: Provider-agnostic adapter pattern
   - Hosting: Vercel (free tier)

4. **Core Principles (Never Change)**
   - Document Trinity before code
   - One phase at a time
   - Test incrementally
   - Commit frequently
   - Safety first

---

## 📊 **Success Metrics for Your Workflow**

Track these over time to see if your process is improving:

| Metric | Target | Meaning |
|--------|--------|---------|
| **Planning time : Coding time** | 1:4 ratio | 10 hours planning → 40 hours coding |
| **Rollbacks per phase** | < 2 | Caught issues before production |
| **Features shipped per week** | 2-3 | Steady progress without rushing |
| **Documentation lag** | < 1 day | Docs updated same day as decisions |
| **Phase exit criteria pass rate** | 100% | Never moved on with incomplete work |

**If metrics are off:**
- Too many rollbacks? → Plan more, code less
- Too few features? → Phases too big, break them down
- Docs lagging? → Build it into session-end routine

---

## 🎓 **Lessons from Your Data Analyst Bootcamp Build**

### What Worked
✅ **Document Trinity before coding** — Saved you from rebuilding 3 times
✅ **Phase 0 foundation fixes** — Prevented technical debt accumulation
✅ **Five C's privacy framework** — Made ethical data easy to implement
✅ **Explicit non-goals** — Prevented scope creep

### What You Learned the Hard Way
❌ **SQLite on Vercel is ephemeral** — Lost data on deployments (now migrating to Supabase)
❌ **No rate limiting = API abuse risk** — Exposed API key with no protection (adding in Phase 0)
❌ **Dashboard CSV mismatch** — Didn't verify compatibility between systems (now documented)

### Patterns to Reuse
🔁 **LLM Adapter Pattern** — Makes provider switching trivial
🔁 **Graceful Degradation** — Database errors don't crash the quiz
🔁 **Consent Checkbox** — Simple opt-out model respects privacy
🔁 **Seed Data Generator** — Creates realistic test data with patterns

---

## 🚀 **Your Next Steps (For This Project)**

### Immediate Actions (Next Session)

1. **Copy all generated documents** from this conversation to your repo:
   ```bash
   # In your project root
   cp .clauderules .
   cp SESSION_START.md docs/
   cp MIGRATION_PLAN.md docs/
   cp LLM_ADAPTER_SPEC.md docs/
   cp DATASET_GENERATION_SPEC.md docs/
   ```

2. **Read through each document**, customize for your project

3. **Commit the workflow system**:
   ```bash
   git add docs/ .clauderules
   git commit -m "Add bulletproof vibe coding workflow system

   - .clauderules: AI system prompt with constraints
   - SESSION_START.md: Pre-coding checklist
   - MIGRATION_PLAN.md: Supabase migration steps
   - LLM_ADAPTER_SPEC.md: Provider abstraction contract
   - DATASET_GENERATION_SPEC.md: Synthetic data guide

   These documents close workflow gaps identified in planning review."
   
   git push origin main
   ```

4. **Start Phase 0** following the new process

### Phase 0 Execution Order

| Task | Estimated Time | Dependency |
|------|---------------|------------|
| 1. Supabase migration | 4-6 hours | None (start here) |
| 2. Rate limiting | 2-3 hours | After migration |
| 3. LLM adapter | 3-4 hours | None (parallel with #1-2) |
| 4. Error boundaries | 1-2 hours | After migration |
| 5. CORS restriction | 30 min | After migration |
| 6. Input validation | 1-2 hours | After migration |

**Total Phase 0: 12-18 hours**

**Success Criteria:** All SG-01 through SG-10 gaps from SRD Section 2.2 are resolved.

---

## 📖 **TL;DR: The Workflow in 10 Steps**

1. **Plan before building** (Document Trinity)
2. **Load context before coding** (SESSION_START checklist)
3. **Build one feature at a time** (vertical slices)
4. **Test after every change** (manual verification)
5. **Commit after every win** (atomic commits)
6. **Verify against checklists** (SRD, TRD exit criteria)
7. **Deploy frequently** (Vercel auto-deploy)
8. **Update docs when you learn** (capture decisions)
9. **Complete phases fully** (don't skip ahead)
10. **Reflect and improve** (session logs, retrospectives)

---

**Remember:** The workflow itself is a living document. As you learn what works for YOU, update these files. In 6 months, you'll have a process that's uniquely optimized for your brain.

**Now go build. You're ready.**
