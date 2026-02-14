# Session Start Checklist
## Use this before EVERY coding session with Claude Code

**Purpose:** Prevent wasted effort by ensuring context is loaded and goals are clear.

---

## ✅ **Pre-Session Setup (5 minutes)**

### 1. **Environment Check**
- [ ] Git status is clean (no uncommitted changes from last session)
- [ ] Latest code pulled from GitHub: `git pull origin main`
- [ ] Vercel deployment is healthy: Check https://data-analyst-bootcamp.vercel.app
- [ ] API key environment variables are set in Vercel dashboard

### 2. **Context Loading**
Open these files in VS Code (Claude Code needs to see them):
- [ ] `docs/PRD_DataSRE.md`
- [ ] `docs/TRD_DataSRE.md`
- [ ] `docs/SRD_DataSRE.md`
- [ ] `.clauderules`
- [ ] The specific file(s) you plan to modify today

### 3. **Phase Verification**
- [ ] Confirm which phase you're in: Phase 0 / 1 / 2 / 3 / 4 / 5
- [ ] Review exit criteria for current phase (see TRD Section 10)
- [ ] Check "Open Questions" in PRD Section 16 for decisions needed

---

## 🎯 **Define Today's Goal (2 minutes)**

Write ONE sentence describing what you want to accomplish:

**Today's Goal:**
_Example: "Migrate database from SQLite to Supabase and verify data persists across redeployment."_

**Expected Outcome:**
_Example: "Can submit test assessment, redeploy to Vercel, and still see the data in Supabase dashboard."_

**Files I'll Modify:**
_Example: `api/lib/db.js`, `package.json`, `.env`_

---

## 🧭 **Navigation Check**

Answer these questions before coding:

1. **Does this task appear in the current phase's TRD implementation plan?**
   - ✅ Yes → Proceed
   - ❌ No → Is it critical? If not, defer to the correct phase

2. **Are there any SRD safety requirements for this feature?**
   - Check SRD Section 10 for phase-specific requirements
   - Note any security checks needed (rate limiting, input validation, etc.)

3. **What's my rollback plan if this breaks?**
   - Know your last working commit hash: `git log --oneline -3`
   - Practice: `git reset --hard <commit-hash>` (DON'T run yet, just know how)

4. **How will I verify this works?**
   - API route → `curl` command
   - UI feature → Browser action + console check
   - Database change → Supabase dashboard query

---

## 🤖 **First Prompt to Claude Code**

Copy this template and fill in the blanks:

```
I'm working on [TODAY'S GOAL].

Current phase: [Phase 0/1/2/3/4/5]
Files to modify: [list them]

Before we start, please:
1. Read .clauderules
2. Read docs/PRD_DataSRE.md Section [relevant section]
3. Read docs/TRD_DataSRE.md Section [relevant section]
4. Check docs/SRD_DataSRE.md for safety requirements related to [feature name]

Once you've reviewed those, show me a plan for how we'll accomplish this task. 
Break it into 3-5 steps. Wait for my approval before writing any code.
```

---

## 🚫 **Red Flags — STOP and Rethink**

If any of these are true, pause and reconsider:

- [ ] You're not sure which phase this task belongs to
- [ ] You haven't read the relevant sections of PRD/TRD/SRD today
- [ ] You're about to modify a file you don't fully understand
- [ ] You're about to add a new npm dependency you haven't researched
- [ ] You're working on a "nice to have" feature instead of phase requirements
- [ ] You're tired, frustrated, or rushing
- [ ] You haven't committed working code in the last 2 hours

**If ANY box is checked:** Take a break, re-read docs, or ask for help.

---

## ✅ **End-of-Session Checklist**

Before you stop coding:

- [ ] All code is committed with descriptive message
- [ ] Changes are pushed to GitHub
- [ ] Vercel deployment succeeded (check dashboard)
- [ ] Feature works in production, not just locally
- [ ] Updated relevant docs if decisions were made
- [ ] Notes written for next session (if you got stuck)

---

## 📝 **Session Notes Template**

Keep a running log. Copy this after each session:

```
## Session [DATE] - [DURATION]

**Goal:** [What you planned to do]
**Achieved:** [What actually got done]
**Blocked By:** [Any obstacles]
**Next Session:** [What to tackle next]
**Decisions Made:** [Any PRD/TRD/SRD updates needed]

**Commits:**
- [commit hash]: [message]
- [commit hash]: [message]
```

Save these in `docs/SESSION_LOG.md` (append to the file).

---

## 🎓 **Learning Checkpoint**

After every 3 sessions, ask yourself:

- What pattern did I learn that I can reuse?
- What mistake did I repeat that I should document?
- What Claude Code suggestion surprised me (good or bad)?
- What should I add to `.clauderules` for next time?

Update your docs and move forward smarter.

---

**Remember:** Vibe coding is about DIRECTION, not SPEED. Take 10 minutes to load context properly, save yourself 2 hours of fixing broken code.
