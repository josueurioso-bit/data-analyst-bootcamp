# Supabase Migration Plan
## Phase 0: SQLite → PostgreSQL Migration

**Status:** Draft
**Owner:** Josue
**Critical Path:** YES — Phase 1+ cannot proceed without this
**Estimated Time:** 4-6 hours (includes testing)

---

## 1. Problem Statement

**Current State:**
- SQLite database at `/tmp/assessments.db` on Vercel
- Data is ephemeral — wiped on every deployment
- Demo data needs to be regenerated manually
- No safe way to collect production data

**Target State:**
- Supabase PostgreSQL database (persistent)
- Data survives redeployments
- Free tier: 500MB storage, 50K rows (sufficient for 10K users)
- Automatic backups included

**Why This Must Be First:**
Phase 1 adds Phase B assessment data. If we build that on SQLite, we'll have to migrate it later anyway. Do it now.

---

## 2. Pre-Migration Checklist

Before starting the migration:

### 2.1 Supabase Setup
- [ ] Create Supabase account (free tier)
- [ ] Create new project: `data-analyst-bootcamp`
- [ ] Note connection string: `postgres://[user]:[pass]@[host]:5432/[db]`
- [ ] Install Supabase client: `npm install @supabase/supabase-js`

### 2.2 Backup Current Data
Even though it's demo data, preserve it:
- [ ] Export current SQLite to CSV: `curl https://data-analyst-bootcamp.vercel.app/api/export-csv > backup.csv`
- [ ] Store backup in `scripts/migration-backup.csv` (gitignored)
- [ ] Commit this plan to git before making ANY code changes

### 2.3 Testing Environment
- [ ] Local Vercel CLI installed: `npm install -g vercel`
- [ ] Can run `vercel dev` successfully
- [ ] Browser DevTools open for console monitoring

---

## 3. Migration Steps (Execute in Order)

### Step 1: Create Supabase Schema
**File:** New file `scripts/create-schema.sql`

```sql
-- Create assessments table matching current SQLite schema
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Pillar scores (same as current)
  numeracy_score INTEGER,
  reading_score INTEGER,
  computer_score INTEGER,
  logic_score INTEGER,
  communication_score INTEGER,
  mindset_score INTEGER,
  
  -- Overall assessment
  readiness_level INTEGER,
  readiness_title TEXT,
  
  -- Ethics & security
  user_ip_hash TEXT,
  consent_given BOOLEAN DEFAULT TRUE
);

-- Create index on session_id for fast lookups
CREATE INDEX idx_session_id ON assessments(session_id);

-- Create index on timestamp for sorted queries
CREATE INDEX idx_timestamp ON assessments(timestamp DESC);
```

**Execute:** Copy this into Supabase SQL Editor and run.

**Verify:** Check "Table Editor" tab in Supabase — should see `assessments` table.

---

### Step 2: Update Database Library
**File:** `api/lib/db.js`

**Current approach:** sql.js (WebAssembly SQLite)
**New approach:** Supabase client

**Action:** Replace entire file with Supabase implementation:

```javascript
// New api/lib/db.js using Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Insert assessment record
 */
async function insertAssessment(assessment) {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        session_id: assessment.sessionId,
        numeracy_score: assessment.numeracyScore,
        reading_score: assessment.readingScore,
        computer_score: assessment.computerScore,
        logic_score: assessment.logicScore,
        communication_score: assessment.communicationScore,
        mindset_score: assessment.mindsetScore,
        readiness_level: assessment.readinessLevel,
        readiness_title: assessment.readinessTitle,
        user_ip_hash: assessment.ipHash,
        consent_given: assessment.consentGiven
      }]);

    if (error) {
      console.error('[DB] Insert error:', error.message);
      return false;
    }

    console.log('[DB] Assessment inserted successfully');
    return true;
  } catch (error) {
    console.error('[DB] Insert exception:', error.message);
    return false;
  }
}

/**
 * Get all assessments (for CSV export)
 */
async function getAllAssessments() {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[DB] Query error:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[DB] Query exception:', error.message);
    return [];
  }
}

/**
 * Get assessment count
 */
async function getAssessmentCount() {
  try {
    const { count, error } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[DB] Count error:', error.message);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[DB] Count exception:', error.message);
    return 0;
  }
}

module.exports = {
  insertAssessment,
  getAllAssessments,
  getAssessmentCount
};
```

**Verify:** File saved, no syntax errors.

---

### Step 3: Update Environment Variables
**Location:** Vercel Dashboard → Project Settings → Environment Variables

Add two new variables:
- `SUPABASE_URL` = `https://[project-ref].supabase.co`
- `SUPABASE_ANON_KEY` = `[your-anon-key]` (from Supabase project settings)

**Also update locally:**
Edit `.env` file:
```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
```

**Verify:** `echo $SUPABASE_URL` in terminal shows the value (after sourcing `.env`).

---

### Step 4: Update package.json
**File:** `package.json`

**Remove:** `"sql.js": "^1.11.0"`
**Add:** `"@supabase/supabase-js": "^2.38.0"`

**Run:** `npm install`

**Verify:** `node_modules/@supabase` folder exists.

---

### Step 5: Test Locally
**Command:** `vercel dev`

**Test 1: Insert Assessment**
- Navigate to `http://localhost:3000`
- Complete a test assessment (make up answers)
- Check terminal logs for `[DB] Assessment inserted successfully`
- Check Supabase dashboard "Table Editor" — should see 1 row

**Test 2: CSV Export**
- `curl http://localhost:3000/api/export-csv`
- Should return CSV with your test assessment

**Test 3: Verify Consent Respects**
- Uncheck consent checkbox in UI
- Complete another assessment
- Verify: No new row in Supabase (because consent = false)

**All tests passing?** → Proceed to Step 6.
**Any test failing?** → Fix before deploying.

---

### Step 6: Deploy to Production
**Commands:**
```bash
git add -A
git commit -m "Migrate database from SQLite to Supabase

- Replace api/lib/db.js with Supabase client
- Update package.json dependencies
- Add environment variables for Supabase connection
- Preserve all existing functionality (graceful degradation on errors)

Verified locally with curl testing."

git push origin main
```

**Vercel auto-deploys.**

**Verify Deployment:**
1. Check Vercel deployment logs — should show "Build succeeded"
2. Visit https://data-analyst-bootcamp.vercel.app
3. Complete a test assessment
4. Check Supabase dashboard — should see new row
5. Check CSV export: `curl https://data-analyst-bootcamp.vercel.app/api/export-csv`

---

### Step 7: Data Persistence Test (Critical!)
This is THE test that proves migration worked:

1. Note current assessment count in Supabase
2. Make a trivial code change (add a comment to index.html)
3. Commit and push (triggers redeploy)
4. Wait for deployment to complete
5. Check Supabase — data should STILL BE THERE

**If data persists:** Migration successful! ✅
**If data is gone:** Migration failed. Rollback and debug.

---

## 4. Rollback Plan

If anything breaks:

```bash
# Revert to last working commit
git log --oneline -5  # Find the commit before migration
git reset --hard <commit-hash>
git push origin main --force
```

This reverts to SQLite. You lose persistence, but the quiz works.

---

## 5. Post-Migration Cleanup

### 5.1 Remove Dead Code
**Files to delete:**
- `test-db.js` (SQLite-specific)
- `scripts/seed-data.js` (SQLite-specific)
- `scripts/verify-patterns.js` (SQLite-specific)

**Action:** 
```bash
git rm test-db.js scripts/seed-data.js scripts/verify-patterns.js
git commit -m "Remove SQLite-specific scripts after Supabase migration"
```

### 5.2 Update Documentation
**File:** `docs/DATA_ANALYST_CONTEXT.md`

Update Section 5 (Database Schema) to reflect Supabase PostgreSQL instead of SQLite.

**File:** `README.md`

Update "Tech Stack" section to list Supabase instead of SQLite.

---

## 6. Success Criteria

Migration is complete when ALL of these are true:

- [ ] New assessments save to Supabase
- [ ] CSV export returns Supabase data
- [ ] Data persists across redeployments
- [ ] Consent checkbox still controls data saving
- [ ] No errors in browser console
- [ ] No errors in Vercel function logs
- [ ] Old SQLite files removed from repo
- [ ] Docs updated to reflect new database
- [ ] Supabase dashboard shows live data

---

## 7. Known Risks

| Risk | Mitigation |
|------|-----------|
| Supabase free tier exhausted | Monitor row count; alert at 40K rows |
| Connection string leaked in logs | Never log connection string; audit all console.log statements |
| Supabase downtime | Graceful degradation — quiz still works, data just doesn't save |
| Migration breaks CSV export | Test CSV export explicitly before declaring success |

---

## 8. Time Estimate

| Task | Time |
|------|------|
| Supabase account setup | 15 min |
| Schema creation | 10 min |
| Code changes (db.js rewrite) | 30 min |
| Environment variable setup | 10 min |
| Local testing | 45 min |
| Deployment | 10 min |
| Production verification | 20 min |
| Data persistence test | 30 min |
| Documentation updates | 30 min |
| **Total** | **3.5 hours** |

Add buffer for unexpected issues: **4-6 hours total**.

---

## 9. Next Steps After Migration

Once Supabase migration is complete, you can:
- [ ] Mark Phase 0 complete (one requirement down)
- [ ] Move on to rate limiting implementation
- [ ] Begin Phase 1 (Phase B assessment expansion)

**Do NOT proceed to Phase 1 until this migration is done and verified.**

---

*This plan should be executed in a single session to avoid partial states. Set aside a half-day for this work.*
