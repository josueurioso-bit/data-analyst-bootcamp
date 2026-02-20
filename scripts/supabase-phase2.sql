CREATE TABLE sprints (id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT, business_scenario TEXT, dataset_url TEXT, deliverables JSONB, rubric_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE submissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id TEXT NOT NULL, sprint_id INTEGER NOT NULL REFERENCES sprints(id), submission_text TEXT NOT NULL, submission_urls JSONB, score INTEGER, feedback JSONB, status TEXT NOT NULL DEFAULT 'pending', submitted_at TIMESTAMPTZ DEFAULT NOW(), evaluated_at TIMESTAMPTZ);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprints are readable by everyone" ON sprints FOR SELECT USING (true);
CREATE POLICY "Submissions are insertable" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Submissions are readable" ON submissions FOR SELECT USING (true);
CREATE POLICY "Submissions are updatable" ON submissions FOR UPDATE USING (true);

INSERT INTO sprints (id, title, description, rubric_id) VALUES (1, 'Excel: Operational Bottleneck Analysis', 'Analyze delivery data to find root causes of late shipments at FastTrack Logistics.', 'sprint-1-rubric');

UPDATE sprints SET business_scenario = E'You\'ve just been hired as a Junior Data Analyst at FastTrack Logistics. The VP of Operations is concerned: late deliveries cost the company $2.3M last year.\n\nShe hands you a dataset of 5,000 delivery records and says: "Find out WHY our deliveries are late. I need answers by Friday."\n\nYour job: Analyze the data in Excel/Google Sheets, identify the root causes, and write a 1-page executive memo with your findings and recommendations.', dataset_url = '/data/sprint-1-deliveries.csv', deliverables = '["Download and explore the delivery dataset (5,000 rows)","Create pivot tables to analyze late delivery patterns","Add calculated fields (days_late, on_time flag)","Identify the primary and secondary causes of delays","Distinguish correlation from causation in the data","Write a 1-page executive memo to the VP of Operations"]'::jsonb WHERE id = 1;

INSERT INTO sprints (id, title, description) VALUES (2, 'SQL: Customer Segmentation', 'Query a database to segment customers and identify high-value groups.');
INSERT INTO sprints (id, title, description) VALUES (3, 'SQL + Excel: Sales Pipeline Analysis', 'Combine SQL queries with Excel dashboards to analyze sales funnel performance.');
INSERT INTO sprints (id, title, description) VALUES (4, 'Python: Automated Reporting', 'Build a Python script to automate weekly KPI reporting.');
INSERT INTO sprints (id, title, description) VALUES (5, 'Python + Viz: Market Analysis Dashboard', 'Create interactive visualizations to present market research findings.');
INSERT INTO sprints (id, title, description) VALUES (6, 'Capstone: End-to-End Analysis', 'Complete a full data analysis project from data collection to presentation.');

-- =============================================
-- PHASE 4: Compadre Transformation
-- Run this block after Phase 2 SQL above.
-- Requires Supabase Auth to be enabled first.
-- =============================================

-- User profiles (linked to auth.users)
-- Separate from auth.users — Supabase best practice
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username            TEXT UNIQUE,
  display_name        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  tutorial_completed  BOOLEAN DEFAULT FALSE,
  current_sprint      INTEGER DEFAULT 1,
  lessons_completed   TEXT[] DEFAULT '{}',
  badges_earned       TEXT[] DEFAULT '{}'
);

-- Portfolio projects (student's published Tableau work)
CREATE TABLE portfolio_projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sprint_id         INTEGER,
  project_title     TEXT NOT NULL,
  dataset_name      TEXT,
  tableau_url       TEXT,
  business_question TEXT,
  published_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only see and edit their own data
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users manage own portfolio"
  ON portfolio_projects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Portfolio is public read"
  ON portfolio_projects FOR SELECT
  USING (true);
