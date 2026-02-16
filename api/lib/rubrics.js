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
  name: 'Excel: Operational Bottleneck Analysis',

  // Ground truth: What the correct answers are
  expectedFindings: {
    primaryIssue: 'QuickMove carrier has ~35% late delivery rate',
    secondaryIssue: 'Phoenix warehouse has ~28% late delivery rate',
    falsePattern: 'Snow is correlated but NOT the root cause',
    costOpportunity: 'Economy routes are NOT slower than Express'
  },

  // Rubric categories with weights (must sum to 1.0)
  categories: [
    {
      name: 'Business Framing',
      weight: 0.20,
      criteria: [
        "Addresses VP's actual question (root causes of $2.3M loss)",
        'Frames findings in business/financial terms',
        'Provides actionable recommendations'
      ],
      scoringGuide: {
        excellent: 'Clear business framing, quantified impact, specific actions',
        good: 'Addresses business question with recommendations',
        adequate: 'Some business context, vague recommendations',
        poor: 'No business context, just technical findings'
      }
    },
    {
      name: 'Data Correctness',
      weight: 0.25,
      criteria: [
        'Identifies QuickMove carrier as primary issue (~35% late rate)',
        'Identifies Phoenix warehouse as secondary issue (~28% late rate)',
        'Recognizes snow correlation is NOT causation',
        'Identifies Economy route cost optimization opportunity'
      ],
      scoringGuide: {
        excellent: 'All 4 key patterns identified correctly',
        good: '3 out of 4 patterns identified',
        adequate: '2 out of 4 patterns identified',
        poor: '0-1 patterns identified'
      }
    },
    {
      name: 'Technical Execution',
      weight: 0.25,
      criteria: [
        'Mentions pivot tables or data aggregation',
        'Describes calculated fields (days_late, on_time_flag)',
        'Shows systematic analysis approach'
      ],
      scoringGuide: {
        excellent: 'Clear pivot table use, multiple calculated fields',
        good: 'Some aggregation mentioned, basic calculated fields',
        adequate: 'Vague mention of Excel tools',
        poor: 'No mention of technical approach'
      }
    },
    {
      name: 'Insight Quality',
      weight: 0.20,
      criteria: [
        'Prioritizes issues by impact (carrier > warehouse > weather)',
        'Distinguishes correlation from causation',
        'Recommendations are specific and measurable'
      ],
      scoringGuide: {
        excellent: 'Deep insights, clear prioritization, specific actions',
        good: 'Valid insights with some prioritization',
        adequate: 'Surface-level insights',
        poor: 'No prioritization or vague insights'
      }
    },
    {
      name: 'Communication Clarity',
      weight: 0.10,
      criteria: [
        'Memo is concise (1-page equivalent ~500 words)',
        'Professional business writing tone',
        'Findings backed by specific data points'
      ],
      scoringGuide: {
        excellent: 'Concise, professional, data-backed',
        good: 'Clear writing, mostly professional',
        adequate: 'Understandable but verbose or informal',
        poor: 'Unclear, unprofessional, no data support'
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
