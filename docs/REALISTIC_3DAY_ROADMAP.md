# Compadre — 3-Day Build Sprint
## Platform Transformation Roadmap

**Project:** Data Analyst Bootcamp → Compadre
**Builder:** Sway
**AI Partner:** Claude Code
**Last Updated:** February 20, 2026

---

## Context: What We're Doing and Why

The platform is being transformed from a demo-focused assessment tool into
**Compadre** — an interactive, portfolio-centered data analyst learning platform.

### What Already Works (Do Not Break)
- Assessment flow (api/chat.js + Supabase save)
- Sprint 1 submission + AI evaluation (api/submit.js, api/evaluate.js)
- Supabase database connection
- Landing page (index.html)
- App (app.html) — 5 views, React CDN

### What We're Building
- Compadre brand (name, voice, design)
- Optional auth (email/password + Google, anonymous sessions preserved)
- User profiles + progress saving
- Skippable tutorial level
- Sprint curriculum redesigned around Storytelling with Data (SWD) principles
- Real datasets replacing generated fake data
- LEARN → CHOOSE → BUILD → PUBLISH sprint flow
- Tableau Public guided experience
- Portfolio page (student's published work)

### The Prime Directive
> Build alongside existing code. Never delete something that works.
> Test after every task. If something breaks, stop and fix it before moving on.

---

## Day 1: Compadre Foundation
**Goal:** Rebrand to Compadre + add optional auth without breaking anything
**End-of-day check:** The platform looks and sounds like Compadre. Users can sign in, sign up, or skip. Anonymous sessions link to accounts on sign-in.

---

### Task 1.1 — Fix Git Status (5 min)
**What:** Commit the `landing.html` deletion that's been stuck in git limbo.
**Why:** Clean git state before any new work.
**How:**
```bash
git add -u
git commit -m "Clean up: remove landing.html (renamed to index.html in Phase 3)"
```
**Done when:** `git status` shows clean working tree.

---

### Task 1.2 — Rebrand Landing Page (index.html) (30 min)
**What:** Update index.html with Compadre name, tagline, and brand voice.
**Why:** The landing page is the first thing users see. It sets the tone.
**Changes:**
- Page title → "Compadre — Learn Data. Tell Stories. Build Your Portfolio."
- Hero headline → Compadre brand voice (warm, direct, not corporate)
- Replace all "Data Analyst Bootcamp" references with "Compadre"
- Tagline: "Learn data. Tell stories. Build something real."
- Keep all links, layout, and CTAs exactly as they are

**Done when:** Landing page loads with Compadre branding, all links still work.

---

### Task 1.3 — Rebrand App (app.html) (20 min)
**What:** Update app.html with Compadre name and Compadre voice.
**Why:** The platform and the guide are the same thing. Every message comes from Compadre.
**Changes:**
- Page title → "Compadre"
- Assessment intro message rewrites to Compadre voice
- Loading states, error messages → Compadre voice
- "Data Analyst Bootcamp" references → "Compadre"

**Voice guide:**
- Before: "Welcome to the Data Analyst Bootcamp assessment."
- After: "Hey — I'm Compadre. I'll be with you every step of the way. Let's figure out where you are and where you're headed."

**Done when:** App loads, assessment still works, everything says Compadre.

---

### Task 1.4 — Enable Supabase Auth (15 min)
**What:** Turn on email/password auth in Supabase dashboard.
**Why:** Foundation for all user profile and progress features.
**How:** Supabase dashboard → Authentication → Providers → Enable Email.
**Done when:** Email auth is enabled in Supabase (no code yet).

---

### Task 1.5 — Enable Google OAuth (20 min)
**What:** Configure Google OAuth in Supabase + Google Cloud Console.
**Why:** One-click Google login is the easiest path for most users.
**Steps:**
1. Google Cloud Console → Create OAuth credentials
2. Supabase → Authentication → Providers → Enable Google → paste credentials
3. Add authorized redirect URI from Supabase to Google Console

**Done when:** Google OAuth is active in Supabase (no code yet).

---

### Task 1.6 — Create Profiles Table in Supabase (15 min)
**What:** Add a `profiles` table and a `portfolio_projects` table to Supabase.
**Why:** Stores user display info and progress. Separate from auth.users (Supabase best practice).
**SQL to run in Supabase dashboard:**
```sql
-- User profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tutorial_completed BOOLEAN DEFAULT FALSE,
  current_sprint INTEGER DEFAULT 1,
  lessons_completed TEXT[] DEFAULT '{}',
  badges_earned TEXT[] DEFAULT '{}'
);

-- Portfolio projects (student's published Tableau work)
CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sprint_id INTEGER,
  project_title TEXT NOT NULL,
  dataset_name TEXT,
  tableau_url TEXT,
  business_question TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see and edit their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users manage own portfolio"
  ON portfolio_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Portfolio is public read"
  ON portfolio_projects FOR SELECT USING (true);
```
**Done when:** Tables appear in Supabase with correct columns and RLS enabled.

---

### Task 1.7 — Add Auth UI to app.html (45 min)
**What:** Add a sign-in/sign-up modal that appears on first load.
**Why:** Users need a way to create accounts and sign in. Must be optional.
**Design:**
```
┌─────────────────────────────────────┐
│  Welcome to Compadre                │
│                                     │
│  Save your progress and build a     │
│  portfolio — or just dive in.       │
│                                     │
│  [Continue with Google]             │
│                                     │
│  ─────────── or ───────────        │
│                                     │
│  Email ________________________     │
│  Password ______________________   │
│                                     │
│  [Sign In]   [Create Account]       │
│                                     │
│  Skip for now →                     │
│  (your progress won't be saved)     │
└─────────────────────────────────────┘
```

**Logic:**
- Show modal on first load (check localStorage for returning user)
- "Skip for now" closes modal, sets `isAnonymous = true`, continues with existing session ID
- Signed-in users: session ID links to their profile

**Done when:** Modal appears, all three paths (Google, email, skip) are clickable (wiring in next task).

---

### Task 1.8 — Add Auth Logic to app.html (45 min)
**What:** Wire up Supabase Auth SDK for real sign-in/sign-up/Google OAuth.
**Why:** Makes the UI actually work.
**How:** Add Supabase JS CDN to app.html, implement auth functions.

```html
<!-- Add to <head> in app.html -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

```javascript
// Auth state (add to React component state)
const [user, setUser] = useState(null);
const [isAnonymous, setIsAnonymous] = useState(false);
const [showAuthModal, setShowAuthModal] = useState(false);

// Initialize Supabase client
const supabase = window.supabase.createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// On mount: check if already signed in
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      setUser(session.user);
    } else if (!localStorage.getItem('compadre_skipped')) {
      setShowAuthModal(true);
    }
  });
}, []);
```

**Done when:** Sign in with email works. Sign in with Google works. Skip works. User state persists on refresh.

---

### Task 1.9 — Link Session ID to User Account (30 min)
**What:** When a user signs in after using the platform anonymously, link their session ID to their new account.
**Why:** No progress is lost when a user decides to create an account mid-session.
**How:**
```javascript
async function handleSignIn(user) {
  setUser(user);
  setShowAuthModal(false);

  // Get existing anonymous session ID
  const existingSessionId = localStorage.getItem('compadre_session_id');

  if (existingSessionId) {
    // Link anonymous session to user account in Supabase
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        display_name: user.user_metadata?.full_name || user.email,
        username: user.email?.split('@')[0]
      });

    // Update existing assessments to link to this user
    // (session_id is already stored — just note the link)
    localStorage.setItem('compadre_user_id', user.id);
  }
}
```
**Done when:** Sign in after anonymous use doesn't lose the session or assessment data.

---

### Task 1.10 — Day 1 Test (30 min)
**Test every path:**
- [ ] Landing page loads with Compadre branding
- [ ] App loads, auth modal appears for new users
- [ ] Sign up with email: creates account, modal closes, app continues
- [ ] Sign in with Google: OAuth flow completes, user is recognized
- [ ] Skip: modal closes, anonymous session continues
- [ ] Take assessment: still works end-to-end (don't skip this check)
- [ ] Sign in after skipping: session links correctly

---

### Day 1 Deliverables
```
✅ Git is clean
✅ Platform is branded as Compadre
✅ Auth modal: email / Google / skip
✅ Supabase Auth connected
✅ Profiles table created
✅ Session ID links to user on sign-in
✅ Assessment still works (nothing broken)
```

---

## Day 2: Tutorial + Curriculum Redesign
**Goal:** Add a skippable tutorial. Redesign Sprint 1 around SWD Principle 1 (Understand the Context) with a real dataset and LEARN → CHOOSE → BUILD flow.
**End-of-day check:** A user can complete the tutorial (or skip it), reach Sprint 1, go through the LEARN phase, choose their dataset, and land in the BUILD workspace.

---

### Task 2.1 — Build Tutorial View (60 min)
**What:** A new `tutorial` view in app.html that walks the user through how Compadre works.
**Why:** First-time users need orientation. But it must be skippable — no friction.
**Structure (5 short steps, each under 30 seconds to read):**

```
Step 1: "Here's how Compadre works."
  → Show the LEARN → CHOOSE → BUILD → PUBLISH flow visually

Step 2: "You'll learn one skill per sprint."
  → Show the 6 sprints mapped to SWD principles

Step 3: "You pick the data that matters to you."
  → Show examples of real datasets (MTA, NYC 311, Spotify, etc.)

Step 4: "Your final project is real. And it's yours."
  → Show example of a published Tableau Public viz

Step 5: "I'll be with you the whole way."
  → Compadre voice. Warm. Direct. "Let's start."
```

**UI:**
- Full-screen, minimal
- Progress dots at the bottom (1 of 5)
- "Skip tutorial" link always visible in top right
- "Next →" button to advance
- Final step: "Start Sprint 1" button

**Done when:** Tutorial renders, skip works, completing it sets `tutorial_completed = true` in profile.

---

### Task 2.2 — Save Tutorial State (15 min)
**What:** Mark tutorial as completed in user profile (Supabase) and localStorage (for anonymous users).
**Why:** Users should never see the tutorial twice.
**Done when:**
- Signed-in users: `profiles.tutorial_completed = true` saved to Supabase
- Anonymous users: `localStorage.setItem('compadre_tutorial_done', 'true')`
- On load: if tutorial_completed is true, skip straight to dashboard

---

### Task 2.3 — Redesign Sprint Flow: LEARN → CHOOSE → BUILD (45 min)
**What:** Add sub-steps to the sprint view. Currently it goes straight to workspace. Now it has phases.
**Why:** Teaching happens before doing. This is the core curriculum change.
**Implementation:** Add `sprintPhase` state to app.html: `'learn' | 'choose' | 'build' | 'publish'`

```
Sprint 1 view:
  if sprintPhase === 'learn'  → show LEARN phase content
  if sprintPhase === 'choose' → show CHOOSE phase (dataset picker)
  if sprintPhase === 'build'  → show existing workspace (no changes)
  if sprintPhase === 'publish'→ show PUBLISH phase (Tableau URL + portfolio)
```

Progress bar at top of sprint view shows which phase you're in.

**Done when:** Phase navigation works. "Continue →" advances to next phase. "Back" goes to previous phase.

---

### Task 2.4 — Write LEARN Phase: SWD Principle 1 (45 min)
**What:** Lesson content for Sprint 1's LEARN phase — "Understand the Context."
**Why:** Every sprint teaches one SWD principle. Sprint 1 teaches the most important one: knowing your audience before you touch the data.
**Content structure:**

```
Lesson 1 (2 min read):
  Headline: "Before you build a chart, answer three questions."
  1. Who is your audience?
  2. What do they need to decide?
  3. What would change their mind?
  → Compadre explains each with a real example

Lesson 2 (2 min read):
  Headline: "Context is what separates insight from information."
  → A data point means nothing without context
  → Example: "Sales are up 10%" — so what? Up from what? Compared to whom?
  → Show before/after: decontextualized data vs. contextualized insight

Mini-exercise (1 min):
  "You're presenting to a VP who has 3 minutes. Which of these
   opening lines works better?"
  A) "Our dataset contains 5,432 records across 12 months."
  B) "One carrier is responsible for 68% of your late deliveries."
  → User picks. Compadre responds with why B is correct.

Lesson 3 (1 min read):
  "For your project: define your audience before you open the data."
  → Who are you presenting to?
  → What decision are they trying to make?
  → You'll write this down in the CHOOSE phase.

[Continue to Choose Your Data →]
```

**Done when:** LEARN phase renders with all 3 lessons and mini-exercise. "Continue" advances to CHOOSE.

---

### Task 2.5 — Research and Select Real Dataset for Sprint 1 (30 min)
**What:** Choose the real dataset that Sprint 1 will be built around.
**Why:** No more fake data. The student learns with the same data they'd see on the job.
**Evaluation criteria:**
- Downloadable as CSV (no API key required)
- Under 50MB (browser-friendly)
- Has a clear, interesting business question
- Relatable to NYC / Pursuit cohort
- Works well with pivot tables (Excel) AND Tableau visualizations

**Top 3 candidates to evaluate:**

| Dataset | Source | Size | Business Question |
|---|---|---|---|
| NYC 311 Service Requests | NYC Open Data | Filterable | Which neighborhoods wait longest for noise complaint resolution? |
| MTA Subway Ridership | MTA Open Data | Manageable | Which subway lines recovered slowest post-COVID? |
| NYC Restaurant Inspections | DOHMH / NYC Open Data | ~200K rows | Which cuisine types and boroughs have the worst health records? |

**Action:** Download all three, open in Excel, confirm they work. Pick the one with the clearest story.

**Done when:** One real dataset is downloaded and saved to `data/` folder. Old fake dataset (`data/sprint-1-deliveries.csv`) is kept but renamed to `data/sprint-1-deliveries-DEPRECATED.csv` (don't delete yet).

---

### Task 2.6 — Build CHOOSE Phase (30 min)
**What:** The CHOOSE phase UI where the student selects their dataset and defines their audience.
**Why:** Creative freedom is the core promise. The student picks what they care about.
**UI:**

```
CHOOSE YOUR DATA

Option A: Use the Sprint 1 starter dataset
  [NYC Restaurant Inspections — 200K rows, DOHMH]
  Great for pivot tables. Clear patterns. Good for first projects.

Option B: Find your own
  [Browse real datasets →]  (links to TheDataSchool_Resources.md sources)

─────────────────────────────────────

Before you start, answer these:

Who is your audience?
[______________________________________________]

What decision do you want them to make?
[______________________________________________]

[Start Building →]
```

**Done when:** User can select the starter dataset OR link to their own. Audience fields are required before advancing. Responses save to localStorage (and Supabase if signed in).

---

### Task 2.7 — Update Sprint 1 Business Scenario (30 min)
**What:** Rewrite the Sprint 1 business scenario to match the new real dataset.
**Why:** The old scenario (FastTrack Logistics) was built around fake embedded patterns. The new scenario should be an open-ended real-world framing.
**New framing (example using NYC Restaurant Inspections):**

```
Sprint 1: Understand the Context

You've just been brought in as a data analyst for the NYC Department
of Health. The Commissioner wants a briefing on restaurant inspection
trends before a press conference next week.

She has 5 minutes. She needs to know:
— Where are the biggest problem areas?
— Is it getting better or worse?
— What should the city prioritize?

Your job: analyze the inspection data, build a clear visualization
in Tableau, and present one key insight she can act on.
```

**Done when:** Sprint 1 workspace displays updated scenario. Old FastTrack scenario is commented out (not deleted).

---

### Task 2.8 — Update Assessment Voice to Compadre (20 min)
**What:** Rewrite the assessment system prompt in api/chat.js to match Compadre's voice.
**Why:** The assessment is the first thing users hear from Compadre. It needs to sound like Compadre.
**Voice change:**
- Before: Formal, diagnostic, clinical
- After: Warm, curious, conversational — like a knowledgeable friend asking questions

**Done when:** Assessment intro sounds like Compadre. Functionality is unchanged.

---

### Task 2.9 — Day 2 Test (30 min)
- [ ] Tutorial appears for new users
- [ ] Tutorial can be skipped
- [ ] Tutorial doesn't appear again after completion
- [ ] Sprint 1 shows LEARN → CHOOSE → BUILD phases
- [ ] LEARN phase content renders correctly
- [ ] Mini-exercise works and gives feedback
- [ ] CHOOSE phase: dataset selection works, audience fields required
- [ ] "Start Building →" advances to BUILD (existing workspace — unchanged)
- [ ] Assessment still works end-to-end

---

### Day 2 Deliverables
```
✅ Tutorial: 5-step, skippable, completion saved
✅ Sprint 1 has LEARN → CHOOSE → BUILD phase flow
✅ LEARN phase teaches SWD Principle 1 (Understand the Context)
✅ Real dataset selected, downloaded, saved to data/
✅ CHOOSE phase: dataset picker + audience definition
✅ Business scenario updated to match real data
✅ Assessment voice sounds like Compadre
✅ Everything from Day 1 still works
```

---

## Day 3: Tableau + Portfolio + Polish
**Goal:** Add Tableau guided experience to Sprint 1. Build the portfolio page. Full integration test and deploy.
**End-of-day check:** A user can complete the full loop — assessment → tutorial → sprint LEARN → CHOOSE → BUILD → PUBLISH — and their project appears in their portfolio.

---

### Task 3.1 — Write Tableau Guided Instructions for Sprint 1 (45 min)
**What:** Step-by-step Tableau instructions embedded in the BUILD phase.
**Why:** No videos. Compadre guides you through Tableau inside the app.
**Structure:**

```
TABLEAU GUIDE: Sprint 1

Step 1: Connect your data
  → Open Tableau Public
  → File → Open → select your CSV
  → Compadre tip: "Check your data types first.
    Dates should be Date, not String."

Step 2: Explore your dataset
  → Drag a dimension to Rows, a measure to Columns
  → Start with something simple — what's the distribution?
  → Compadre tip: "Before you build the 'real' chart,
    build a messy one just to see what's there."

Step 3: Build your first visualization
  → Apply the SWD principle: who is your audience?
  → Choose the right chart type for your question
  → Compadre tip: "Bar charts are almost always the right answer.
    Start there. Earn the right to use something fancier."

Step 4: Clean it up
  → Remove chart junk (gridlines, borders, legends you don't need)
  → Add a clear title that states your finding, not your topic
    Bad title: "Restaurant Inspections by Borough"
    Good title: "Manhattan Has 3× More Grade A Restaurants Than the Bronx"

Step 5: Publish to Tableau Public
  → File → Save to Tableau Public
  → Copy your public URL
  → Paste it in Compadre to add it to your portfolio

[Paste your Tableau URL below ↓]
```

**Done when:** Tableau guide renders alongside the workspace. Steps are collapsible so they don't crowd the submission form.

---

### Task 3.2 — Add PUBLISH Phase (30 min)
**What:** The final phase where the student submits their Tableau Public URL and publishes to their portfolio.
**Why:** The deliverable is a real, shareable portfolio piece — not just text in a form.
**UI:**

```
PUBLISH YOUR WORK

Your Tableau Public URL:
[https://public.tableau.com/views/... _____________________]

Project title (what will show on your portfolio):
[________________________________________________]

What was your key finding?
[________________________________________________]

[Publish to Portfolio →]
```

**Logic:**
- Validate that URL starts with `https://public.tableau.com/`
- Save to `portfolio_projects` table in Supabase (if signed in)
- Save to localStorage (if anonymous)
- Show confirmation: "Your project is live. View your portfolio →"

**Done when:** PUBLISH phase submits, saves to Supabase, user sees confirmation.

---

### Task 3.3 — Build Portfolio View (45 min)
**What:** A new `portfolio` view in app.html showing the user's published projects.
**Why:** This is the payoff. The student sees their work collected in one place, shareable with employers.
**UI:**

```
YOUR PORTFOLIO

Gabriel's Projects  [Share Portfolio Link]

┌─────────────────────────────────────────┐
│  Sprint 1                               │
│  NYC Restaurant Inspections             │
│  "Manhattan Has 3× More Grade A         │
│   Restaurants Than the Bronx"           │
│                                         │
│  [View on Tableau Public →]             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Sprint 2 — Coming Soon                 │
│  Choose the right visual                │
│  🔒 Complete Sprint 1 to unlock         │
└─────────────────────────────────────────┘
```

**Done when:** Portfolio view renders. Published projects show with Tableau links. Locked sprints show "Coming Soon."

---

### Task 3.4 — Add Portfolio to Navigation (15 min)
**What:** Add "Portfolio" to the app navigation so users can reach it from anywhere.
**Why:** The portfolio should always be accessible — not buried after a sprint.
**Done when:** Navigation shows: Assessment | Dashboard | Portfolio (with user initial/avatar if signed in)

---

### Task 3.5 — Update Rubric for Real Dataset (45 min)
**What:** Update api/lib/rubrics.js to evaluate against the real dataset's patterns instead of the fake FastTrack patterns.
**Why:** The evaluation prompt currently references QuickMove carrier and Phoenix warehouse — patterns that no longer exist.
**New approach:** Since the student chooses their own dataset and business question, the rubric evaluates process and SWD principle application — not whether they found specific numbers.

**New Sprint 1 rubric categories:**

| Category | Weight | What it checks |
|---|---|---|
| Context clarity | 25% | Did they define audience + decision clearly? |
| SWD Principle 1 | 25% | Does their viz answer a specific question for a specific audience? |
| Data accuracy | 20% | Are the numbers they cite correct given the dataset? |
| Visual communication | 20% | Is the Tableau viz clear, clean, and readable? |
| Insight quality | 10% | Is the key finding actionable and clearly stated? |

**Done when:** api/lib/rubrics.js updated with new categories and weights. api/evaluate.js evaluation prompt updated to match.

---

### Task 3.6 — Full End-to-End Test (45 min)
Walk through the complete user journey:

- [ ] New user lands on index.html — sees Compadre branding
- [ ] Clicks "Get Started" → app.html loads → auth modal appears
- [ ] Signs up with email → modal closes → tutorial begins
- [ ] Completes tutorial (or skips) → assessment begins
- [ ] Assessment completes → results show → "Begin Sprint 1" button
- [ ] Sprint 1 loads → LEARN phase renders correctly
- [ ] Mini-exercise works
- [ ] Advances to CHOOSE → selects dataset → fills in audience fields
- [ ] Advances to BUILD → workspace loads (existing, unchanged)
- [ ] Tableau guide renders → steps are clear and accurate
- [ ] Advances to PUBLISH → pastes Tableau URL → publishes
- [ ] Portfolio view shows the published project
- [ ] Navigation works throughout
- [ ] Signs out → signs back in → progress is preserved

---

### Task 3.7 — Deploy and Smoke Test (30 min)
**What:** Push to GitHub → Vercel auto-deploys → test on production URL.
**Steps:**
```bash
git add .
git commit -m "Compadre transformation: brand, auth, tutorial, SWD curriculum, portfolio"
git push origin main
```
Then test on `https://data-analyst-bootcamp.vercel.app`:
- [ ] Landing page loads
- [ ] App loads
- [ ] Auth modal works (email + Google)
- [ ] Assessment completes
- [ ] No console errors
- [ ] No Vercel function errors in dashboard

---

### Day 3 Deliverables
```
✅ Tableau guided instructions in BUILD phase
✅ PUBLISH phase: Tableau URL submission
✅ Portfolio view: shows published projects
✅ Portfolio in navigation
✅ Rubric updated for real dataset + SWD evaluation
✅ Full E2E test passed
✅ Deployed to production
✅ Everything works on the live URL
```

---

## Summary: What the Platform Looks Like After 3 Days

### The User Experience

```
FIRST VISIT
  Landing page → "Welcome to Compadre"
  Auth modal → Sign up / Google / Skip
  Tutorial → 5 steps, skippable
  Assessment → 22 questions, Compadre voice
  Results → Sprint placement + study plan

SPRINT 1
  LEARN   → SWD Principle 1: Understand the Context
            Lessons + mini-exercise + Compadre tips
  CHOOSE  → Pick a real dataset (starter or your own)
            Define your audience and their decision
  BUILD   → Workspace + Tableau step-by-step guide
            AI chat available for questions
  PUBLISH → Paste Tableau Public URL
            Project goes live in portfolio

PORTFOLIO
  All published projects in one place
  Shareable link for job applications
  Locked sprints show what's coming next
```

### What's NOT Being Built in This Sprint
- Sprints 2-6 (designed later, one at a time)
- Advanced Tableau integration (MCP server, browser extension)
- Leaderboards or social features
- Email notifications
- Mobile app

---

## If You Fall Behind: What to Cut

**Never cut:**
- Auth (it's additive — doesn't break anything)
- LEARN phase content (core curriculum)
- Real dataset selection
- Portfolio page (it's the payoff)

**Simplify if needed:**
- Tutorial: cut to 3 steps instead of 5
- CHOOSE phase: remove "find your own dataset" option for now, just use the starter dataset
- Tableau guide: cut to 3 steps instead of 5
- Portfolio: just show the Tableau URL, skip the fancy card layout

**Defer entirely if blocked:**
- Google OAuth (email-only auth is fine for now)
- Portfolio sharing link (just show it, don't make it shareable yet)
- Rubric update (keep old rubric, update in next sprint)

---

## Task Checklist (Quick Reference)

### Day 1
- [ ] 1.1 Fix git status
- [ ] 1.2 Rebrand index.html
- [ ] 1.3 Rebrand app.html
- [ ] 1.4 Enable Supabase email auth
- [ ] 1.5 Enable Google OAuth
- [ ] 1.6 Create profiles + portfolio_projects tables
- [ ] 1.7 Auth modal UI
- [ ] 1.8 Auth logic (Supabase SDK)
- [ ] 1.9 Session ID → user account linking
- [ ] 1.10 Day 1 test

### Day 2
- [ ] 2.1 Tutorial view (5 steps, skippable)
- [ ] 2.2 Tutorial completion state
- [ ] 2.3 Sprint phase flow (LEARN → CHOOSE → BUILD)
- [ ] 2.4 LEARN phase content (SWD Principle 1)
- [ ] 2.5 Research and select real dataset
- [ ] 2.6 CHOOSE phase UI
- [ ] 2.7 Update Sprint 1 business scenario
- [ ] 2.8 Update assessment voice
- [ ] 2.9 Day 2 test

### Day 3
- [ ] 3.1 Tableau guided instructions
- [ ] 3.2 PUBLISH phase
- [ ] 3.3 Portfolio view
- [ ] 3.4 Portfolio in navigation
- [ ] 3.5 Update rubric for real dataset
- [ ] 3.6 Full E2E test
- [ ] 3.7 Deploy + smoke test

---

*This is the Compadre build. Three days. Small tasks. Nothing breaks.*
