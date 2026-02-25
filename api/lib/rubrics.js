/**
 * Sprint Rubrics — Scoring definitions and validation for sprint evaluations
 *
 * TEACHING MOMENT: The AI evaluates student submissions against these rubrics,
 * but we DON'T trust the AI's math blindly. We recalculate the weighted score
 * server-side and override the AI if it's off by more than 5 points.
 */

const sprint1Rubric = {
  id: 'sprint-1-rubric',
  sprintId: 1,
  name: 'NYC Restaurant Inspections: Inspection Budget Analysis',
  businessContext: 'NYC Health Commissioner allocating next year\'s restaurant inspection budget based on data-driven risk patterns from the DOHMH inspection database',

  // Ground truth: What a strong analysis should identify in the NYC data
  // These are the patterns a student should surface when working with the dataset
  expectedFindings: {
    boroughVariation:   'Grade distribution (A/B/C rates) varies meaningfully across the 5 boroughs — at least one borough stands out as higher risk',
    cuisinePatterns:    'Certain cuisine categories show disproportionately high C-grade or violation rates compared to the citywide average',
    timeTrend:          'Grade trends over 2022–present show whether inspection outcomes are improving, stable, or worsening',
    dataStructureNote:  'The dataset has multiple rows per restaurant (one per inspection visit) — correct analysis aggregates to most-recent grade or counts unique restaurants'
  },

  // Rubric categories with weights (must sum to 1.0)
  categories: [
    {
      name: 'Audience & Context',
      weight: 0.20,
      criteria: [
        'Addresses the Health Commissioner\'s actual question (where to allocate inspection budget)',
        'Frames findings for a non-technical policy audience — numbers in plain language',
        'Provides specific, actionable recommendations (which boroughs or cuisine types to prioritize)'
      ],
      scoringGuide: {
        excellent: 'Budget-focused framing, specific recommendations, executive-ready language',
        good: 'Addresses the Commissioner\'s question with clear recommendations',
        adequate: 'Some business context but recommendations are vague or generic',
        poor: 'No audience consideration — just a raw data dump'
      }
    },
    {
      name: 'Data Analysis',
      weight: 0.25,
      criteria: [
        'Correctly identifies grade distribution by borough (A/B/C breakdown)',
        'Identifies cuisine categories with above-average C-grade or violation rates',
        'Analyzes time trend — are inspection outcomes improving or worsening since 2022?',
        'Handles the multi-row structure correctly (one restaurant can have multiple inspection rows)'
      ],
      scoringGuide: {
        excellent: 'All 4 patterns correctly identified and supported with numbers',
        good: '3 out of 4 patterns identified',
        adequate: '2 out of 4 patterns identified',
        poor: '0–1 patterns identified, or data is clearly misread'
      }
    },
    {
      name: 'Tableau Visualization',
      weight: 0.25,
      criteria: [
        'Submitted a working Tableau Public URL',
        'Dashboard includes at least 2 charts (e.g., bar chart by borough + breakdown by cuisine type)',
        'Charts support the specific findings stated in the memo',
        'Includes at least one reference line (mean or median) to anchor the audience\'s interpretation'
      ],
      scoringGuide: {
        excellent: 'Working URL, 2+ charts, charts match findings, reference line present',
        good: 'Working URL, 2 charts, generally connected to findings',
        adequate: 'URL present but charts are basic or loosely connected to memo',
        poor: 'No URL submitted, or URL does not load a published visualization'
      }
    },
    {
      name: 'SWD Principle: Context First',
      weight: 0.20,
      criteria: [
        'Opens with the decision or question (problem-first), not the data',
        'Clearly identifies the audience and what they need to decide',
        'One clear main takeaway — the single most important thing for the Commissioner to know'
      ],
      scoringGuide: {
        excellent: 'Strong problem framing, explicit audience, unmistakable main takeaway',
        good: 'Good context setup with a clear central finding',
        adequate: 'Some framing present but buried under data details',
        poor: 'Jumps straight into data without any framing or audience acknowledgment'
      }
    },
    {
      name: 'Communication Clarity',
      weight: 0.10,
      criteria: [
        'Memo length is appropriate — concise but complete (200–500 words)',
        'Professional tone appropriate for a government executive audience',
        'Key findings backed by specific data points (percentages, counts) from the analysis'
      ],
      scoringGuide: {
        excellent: 'Concise, professional, specific numbers cited throughout',
        good: 'Clear writing with some concrete data support',
        adequate: 'Understandable but verbose, informal, or light on data',
        poor: 'Unclear, no data support, or unprofessional tone'
      }
    }
  ]
};

// All rubrics indexed by ID
const rubrics = {
  'sprint-1-rubric': sprint1Rubric
};

/**
 * Get a rubric by its ID
 *
 * @param {string} rubricId - e.g. 'sprint-1-rubric'
 * @returns {Object|null} - Rubric object or null
 */
function getRubricById(rubricId) {
  return rubrics[rubricId] || null;
}

/**
 * Validate and correct AI-generated scores
 *
 * TEACHING MOMENT: AI can miscalculate weighted averages or hallucinate scores.
 * This function:
 * 1. Checks all scores are in 0-100 range
 * 2. Recalculates the weighted overall score
 * 3. Overrides the AI if it's off by more than 5 points
 * 4. Sets passed = score >= 75
 *
 * @param {Object} feedback - AI-generated feedback with category_scores and overall_score
 * @returns {boolean} - True if scores are valid (possibly corrected), false if unrecoverable
 */
function validateScores(feedback) {
  if (!feedback || !feedback.category_scores) {
    console.error('[Rubric] No category_scores in feedback');
    return false;
  }

  const categoryNames = sprint1Rubric.categories.map(c => c.name);

  // Check all required categories exist and scores are valid
  for (const cat of categoryNames) {
    const entry = feedback.category_scores[cat];
    if (!entry || typeof entry.score !== 'number') {
      console.error(`[Rubric] Missing or invalid score for "${cat}"`);
      return false;
    }
    // Clamp to 0-100
    if (entry.score < 0) entry.score = 0;
    if (entry.score > 100) entry.score = 100;
    entry.score = Math.round(entry.score);
  }

  // Recalculate weighted overall
  let weightedSum = 0;
  for (const cat of sprint1Rubric.categories) {
    weightedSum += feedback.category_scores[cat.name].score * cat.weight;
  }
  const calculatedOverall = Math.round(weightedSum);

  // Override if AI's calculation is off by more than 5 points
  if (typeof feedback.overall_score !== 'number' ||
      Math.abs(calculatedOverall - feedback.overall_score) > 5) {
    console.warn(`[Rubric] Score mismatch: AI=${feedback.overall_score}, calculated=${calculatedOverall}. Overriding.`);
    feedback.overall_score = calculatedOverall;
  }

  // Set pass/fail (75 threshold)
  feedback.passed = feedback.overall_score >= 75;

  return true;
}

module.exports = { sprint1Rubric, getRubricById, validateScores };
