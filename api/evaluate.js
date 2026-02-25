// Sprint Evaluation API — AI scores student submissions against rubric
// Pattern matches chat.js: ESM, CORS, rate limiting, input validation

import crypto from 'crypto';

function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (xfwd) return xfwd.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  const { setCorsHeaders } = await import('./lib/cors.js');
  setCorsHeaders(req, res, 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const { checkRateLimit } = await import('./lib/rateLimiter.js');
  const ipHash = hashIp(getClientIp(req));
  const rateCheck = checkRateLimit(ipHash);
  if (!rateCheck.allowed) {
    res.setHeader('Retry-After', rateCheck.retryAfterSeconds);
    return res.status(429).json({ error: 'Too many requests.', retryAfterSeconds: rateCheck.retryAfterSeconds });
  }

  const { submission_id } = req.body || {};

  if (!submission_id || typeof submission_id !== 'string') {
    return res.status(400).json({ error: 'submission_id is required' });
  }

  try {
    const { getSubmissionById, updateSubmission } = await import('./lib/db-supabase.js');
    const { sprint1Rubric, validateScores } = await import('./lib/rubrics.js');
    const { sendMessage } = await import('./lib/llm.js');

    // Load submission
    const submission = await getSubmissionById(submission_id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (submission.status === 'evaluated') {
      return res.status(200).json({ feedback: submission.feedback, score: submission.score });
    }

    // Build evaluation prompt
    const rubric = sprint1Rubric;
    const evaluationPrompt = buildEvaluationPrompt(submission, rubric);

    // Call LLM with low temperature for consistent scoring
    const { text: aiText } = await sendMessage(
      'You are a rubric evaluator. Return ONLY valid JSON with no markdown formatting.',
      [{ role: 'user', content: evaluationPrompt }],
      { maxTokens: 2000, temperature: 0.3 }
    );

    // Parse JSON response (handle markdown fences, fall back to brace-counting)
    let feedback = parseJsonResponse(aiText);
    if (!feedback) {
      console.error('[Evaluate] Failed to parse AI response:', aiText.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse evaluation response' });
    }

    // Validate and correct scores server-side
    const valid = validateScores(feedback);
    if (!valid) {
      console.error('[Evaluate] Score validation failed');
      return res.status(500).json({ error: 'Evaluation produced invalid scores' });
    }

    // Save to database
    const updated = await updateSubmission(submission_id, {
      score: feedback.overall_score,
      feedback: feedback,
      status: 'evaluated',
      evaluated_at: new Date().toISOString()
    });

    if (!updated) {
      console.error('[Evaluate] Failed to save evaluation results');
    }

    return res.status(200).json(feedback);

  } catch (error) {
    console.error('[Evaluate] Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({ error: 'Evaluation failed', details: error.message });
  }
}

/**
 * Build the evaluation prompt with ground truth + rubric + student submission
 *
 * @param {Object} submission - Full submission row from DB (text + URLs)
 * @param {Object} rubric - Sprint rubric object
 */
function buildEvaluationPrompt(submission, rubric) {
  const memoText = submission.submission_text;
  const tableauUrl = submission.submission_urls?.google_sheets || null;

  // Build ground truth list dynamically from rubric.expectedFindings
  const findingLines = Object.entries(rubric.expectedFindings)
    .map(([, value], i) => `${i + 1}. ${value}`)
    .join('\n');

  // Build category score keys for the required JSON output
  const categoryScoreKeys = rubric.categories
    .map(c => `    "${c.name}": { "score": 0, "feedback": "..." }`)
    .join(',\n');

  return `You are an expert data analyst evaluator scoring a student's sprint submission.

SPRINT: ${rubric.name}
BUSINESS CONTEXT: ${rubric.businessContext}

WHAT A STRONG ANALYSIS SHOULD FIND:
${findingLines}

STUDENT'S TABLEAU VISUALIZATION:
${tableauUrl ? `URL submitted: ${tableauUrl}` : 'No Tableau URL submitted — score Tableau Visualization category at 0.'}

STUDENT'S EXECUTIVE MEMO:
"""
${memoText}
"""

RUBRIC CATEGORIES:
${rubric.categories.map(c => `- ${c.name} (${c.weight * 100}%): ${c.criteria.join('; ')}`).join('\n')}

EVALUATION INSTRUCTIONS:
- Score each category 0-100, then calculate weighted overall score.
- Be encouraging but accurate. Note what they got right and what they missed.
- For Tableau Visualization: if no URL was submitted, score is 0. If a URL was submitted, trust that it works and score based on what the memo describes about the charts.

REQUIRED OUTPUT FORMAT (JSON ONLY, no markdown fences):
{
  "category_scores": {
${categoryScoreKeys}
  },
  "overall_score": 0,
  "overall_feedback": "2-3 sentences summarizing performance",
  "strengths": ["specific strength 1", "specific strength 2"],
  "areas_for_improvement": ["specific gap 1", "specific gap 2"],
  "passed": true,
  "next_steps": "One concrete thing to do next"
}`;
}

/**
 * Parse JSON from AI response, handling markdown fences and brace-counting
 */
function parseJsonResponse(text) {
  // Try 1: Strip markdown fences and parse directly
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // continue to fallback
  }

  // Try 2: Brace-counting extraction (same pattern as chat.js)
  try {
    const firstBrace = text.indexOf('{');
    if (firstBrace === -1) return null;

    let depth = 0;
    for (let i = firstBrace; i < text.length; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
      if (depth === 0) {
        return JSON.parse(text.substring(firstBrace, i + 1));
      }
    }
  } catch {
    // fall through
  }

  return null;
}
