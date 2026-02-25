CREATE TABLE sprints (id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT, business_scenario TEXT, dataset_url TEXT, deliverables JSONB, rubric_id TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE submissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id TEXT NOT NULL, sprint_id INTEGER NOT NULL REFERENCES sprints(id), submission_text TEXT NOT NULL, submission_urls JSONB, score INTEGER, feedback JSONB, status TEXT NOT NULL DEFAULT 'pending', submitted_at TIMESTAMPTZ DEFAULT NOW(), evaluated_at TIMESTAMPTZ);

ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sprints are readable by everyone" ON sprints FOR SELECT USING (true);
CREATE POLICY "Submissions are insertable" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Submissions are readable" ON submissions FOR SELECT USING (true);
CREATE POLICY "Submissions are updatable" ON submissions FOR UPDATE USING (true);

INSERT INTO sprints (id, title, description, rubric_id, dataset_url, business_scenario, deliverables) VALUES (
  1,
  'Understand the Context',
  'Analyze NYC restaurant inspection data and build a Tableau visualization for the NYC Health Commissioner.',
  'sprint-1-rubric',
  '/data/sprint-1-restaurants-sample.csv',
  E'You''re a junior data analyst working with the NYC Department of Health and Mental Hygiene. The Health Commissioner is building next year''s inspection budget and needs data-backed answers.\n\nShe sends you the city''s restaurant inspection database and says: "I need to walk into the budget meeting knowing exactly where the problems are — which boroughs, which cuisine types, and whether things are getting better or worse."\n\nYour job: Analyze the inspection data, find the patterns that matter, and build a Tableau dashboard the Commissioner can present to the budget committee.',
  '["Download the NYC Restaurant Inspections dataset and filter to 2022-present in Excel","Explore the data: count restaurants by borough, grade distribution, and cuisine type","Create pivot tables showing Grade C rates by borough and by cuisine type","Identify 2-3 key findings - where are the highest-risk areas? Is the trend improving?","Build a Tableau Public dashboard with at least 2 charts supporting your findings","Publish to Tableau Public, then write a 1-paragraph executive summary for the Commissioner"]'::jsonb
);

INSERT INTO sprints (id, title, description) VALUES (2, 'Choose the Right Visual', 'Match your data to the right chart type so your audience actually understands what you''re showing.');
INSERT INTO sprints (id, title, description) VALUES (3, 'Eliminate Clutter', 'Strip away everything that doesn''t serve the story. Less is more — and harder than it sounds.');
INSERT INTO sprints (id, title, description) VALUES (4, 'Focus Attention', 'Use color, size, and positioning to guide your audience''s eye to what matters most.');
INSERT INTO sprints (id, title, description) VALUES (5, 'Think Like a Designer', 'Apply design principles to make your visualizations clear, trustworthy, and professional.');
INSERT INTO sprints (id, title, description) VALUES (6, 'Tell a Story — Capstone', 'Bring it all together. One dataset, one audience, one complete narrative. Your portfolio centerpiece.');

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
