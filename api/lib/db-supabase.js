/**
 * Supabase Database Helper — Replaces SQLite (db.js)
 *
 * TEACHING MOMENT: SQLite on Vercel is "ephemeral" — the database file
 * gets wiped every time the serverless function cold-starts. That means
 * all your data disappears randomly!
 *
 * Supabase gives us a real PostgreSQL database that persists forever.
 * We talk to it via a REST API (no special drivers needed).
 *
 * Key differences from SQLite:
 * - No file system needed — it's a cloud database
 * - Data survives cold starts and redeployments
 * - We use fetch() to send requests, not SQL directly
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

/**
 * Make a request to the Supabase REST API
 *
 * TEACHING MOMENT: Supabase auto-generates a REST API from your tables.
 * Instead of writing SQL, you use URL parameters to filter, sort, and select.
 * Under the hood it's still PostgreSQL, but the REST layer makes it simple.
 *
 * @param {string} path - API path (e.g., '/rest/v1/assessments')
 * @param {Object} options - fetch options (method, headers, body)
 * @returns {Object} - { data, error }
 */
async function supabaseRequest(path, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[DB] Supabase credentials not configured');
    return { data: null, error: 'Database not configured' };
  }

  const url = `${SUPABASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[DB] Supabase error:', response.status, errorText);
    return { data: null, error: errorText };
  }

  // Some responses (like 201 Created) might have empty body
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data, error: null };
}

/**
 * Insert an assessment record
 *
 * TEACHING MOMENT: With Supabase REST API, an INSERT is just a POST request.
 * The column names in our JSON must match the table columns exactly.
 *
 * @param {Object} assessment - The assessment data to insert
 * @returns {boolean} - True if insert succeeded
 */
async function insertAssessment(assessment) {
  try {
    const { data, error } = await supabaseRequest('/rest/v1/assessments', {
      method: 'POST',
      body: JSON.stringify({
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
        consent_given: assessment.consentGiven ? true : false,
        // Phase B results stored as JSONB (null if Phase B wasn't completed)
        phase_b_results: assessment.phaseBResults || null
      })
    });

    if (error) {
      console.error('[DB] Insert error:', error);
      return false;
    }

    console.log('[DB] Assessment inserted successfully');
    return true;
  } catch (error) {
    console.error('[DB] Insert error:', error.message);
    return false;
  }
}

/**
 * Get all assessments for CSV export
 *
 * TEACHING MOMENT: A SELECT query in Supabase REST is just a GET request.
 * The ?select= parameter picks which columns to return.
 * The ?order= parameter sorts the results.
 *
 * @returns {Array} - Array of assessment objects
 */
async function getAllAssessments() {
  try {
    const columns = [
      'session_id',
      'timestamp',
      'numeracy_score',
      'reading_score',
      'computer_score',
      'logic_score',
      'communication_score',
      'mindset_score',
      'readiness_level',
      'readiness_title'
    ].join(',');

    const { data, error } = await supabaseRequest(
      `/rest/v1/assessments?select=${columns}&order=timestamp.desc`
    );

    if (error) {
      console.error('[DB] Query error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[DB] Query error:', error.message);
    return [];
  }
}

/**
 * Get count of assessments
 *
 * @returns {number} - Total number of assessments
 */
async function getAssessmentCount() {
  try {
    const { data, error } = await supabaseRequest(
      '/rest/v1/assessments?select=id',
      { headers: { 'Prefer': 'count=exact' }, prefer: 'count=exact' }
    );

    // Supabase returns count in the content-range header,
    // but with our simple approach we just count the array
    if (error) return 0;
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.error('[DB] Count error:', error.message);
    return 0;
  }
}

// =========================================================
// SPRINT SYSTEM — Phase 2 Functions
// =========================================================

/**
 * Get a sprint by its ID
 *
 * @param {number} sprintId - The sprint ID (1-6)
 * @returns {Object|null} - Sprint data or null if not found
 */
async function getSprintById(sprintId) {
  try {
    const { data, error } = await supabaseRequest(
      `/rest/v1/sprints?id=eq.${sprintId}&select=*`
    );

    if (error) {
      console.error('[DB] Sprint query error:', error);
      return null;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('[DB] Sprint query error:', error.message);
    return null;
  }
}

/**
 * Insert a new submission
 *
 * @param {Object} submission - { session_id, sprint_id, submission_text, submission_urls }
 * @returns {Object|null} - Created submission row (with id) or null on failure
 */
async function insertSubmission(submission) {
  try {
    const { data, error } = await supabaseRequest('/rest/v1/submissions', {
      method: 'POST',
      body: JSON.stringify({
        session_id: submission.session_id,
        sprint_id: submission.sprint_id,
        submission_text: submission.submission_text,
        submission_urls: submission.submission_urls || null,
        status: 'pending'
      })
    });

    if (error) {
      console.error('[DB] Submission insert error:', error);
      return null;
    }

    console.log('[DB] Submission inserted successfully');
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('[DB] Submission insert error:', error.message);
    return null;
  }
}

/**
 * Get a submission by its UUID
 *
 * @param {string} submissionId - UUID of the submission
 * @returns {Object|null} - Submission data or null
 */
async function getSubmissionById(submissionId) {
  try {
    const { data, error } = await supabaseRequest(
      `/rest/v1/submissions?id=eq.${submissionId}&select=*`
    );

    if (error) {
      console.error('[DB] Submission query error:', error);
      return null;
    }

    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('[DB] Submission query error:', error.message);
    return null;
  }
}

/**
 * Update a submission (e.g., after evaluation completes)
 *
 * @param {string} submissionId - UUID of the submission
 * @param {Object} updates - Fields to update (score, feedback, status, evaluated_at)
 * @returns {Object|null} - Updated submission row or null
 */
async function updateSubmission(submissionId, updates) {
  try {
    const { data, error } = await supabaseRequest(
      `/rest/v1/submissions?id=eq.${submissionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }
    );

    if (error) {
      console.error('[DB] Submission update error:', error);
      return null;
    }

    console.log('[DB] Submission updated successfully');
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('[DB] Submission update error:', error.message);
    return null;
  }
}

/**
 * Get all submissions for a session (portfolio view)
 *
 * @param {string} sessionId - The user's session UUID
 * @returns {Array} - Array of submission objects, newest first
 */
async function getSubmissionsBySessionId(sessionId) {
  try {
    const columns = 'id,sprint_id,submission_text,submission_urls,score,feedback,status,submitted_at,evaluated_at';
    const { data, error } = await supabaseRequest(
      `/rest/v1/submissions?session_id=eq.${encodeURIComponent(sessionId)}&select=${columns}&order=submitted_at.desc`
    );

    if (error) {
      console.error('[DB] Portfolio query error:', error);
      return [];
    }

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[DB] Portfolio query error:', error.message);
    return [];
  }
}

// Export the same interface as the old db.js + new sprint functions
// TEACHING MOMENT: By keeping the same function names and signatures,
// we can swap databases without changing any code that uses them.
module.exports = {
  insertAssessment,
  getAllAssessments,
  getAssessmentCount,
  getSprintById,
  insertSubmission,
  getSubmissionById,
  updateSubmission,
  getSubmissionsBySessionId
};
