# Rubric Implementation Guide
## How AI Feedback Actually Works (Technical Reality Check)

**Purpose:** Clarify how Sprint evaluation works so you don't discover Day 3 that the AI can't actually check Excel formulas.

**Reality Check:** The AI cannot open Google Sheets files. It evaluates based on TEXT the user provides.

---

## The Hard Truth: What AI CAN and CANNOT Do

### ❌ What AI CANNOT Do (Without Complex Infrastructure)

1. **Cannot access Google Sheets**
   - AI cannot log into your Google account
   - AI cannot parse XLSX files uploaded as binary
   - AI cannot verify pivot table existence
   - AI cannot check formula correctness

2. **Cannot run Excel formulas**
   - AI cannot verify `=VLOOKUP(...)` actually works
   - AI cannot check if calculated fields are correct
   - AI cannot validate data cleaning steps

3. **Cannot access external URLs directly**
   - Even with URL, AI cannot fetch the sheet without authentication
   - Server-side request fetching (SSRF) is blocked for security

### ✅ What AI CAN Do (With Current Setup)

1. **Evaluate text-based submissions**
   - Executive memo content (prose)
   - Descriptions of analysis performed
   - Findings and recommendations
   - Screenshots described by user

2. **Check for patterns in writing**
   - Did they mention pivot tables?
   - Did they identify the correct carriers/warehouses?
   - Do findings match expected patterns in dataset?
   - Is business framing appropriate?

3. **Score based on rubric criteria**
   - Compare submission text to rubric requirements
   - Assign scores 0-100 for each category
   - Provide qualitative feedback

---

## MVP Solution: Text + Screenshots Approach

For the demo, use this workflow:

### What User Submits

**Submission Form Fields:**

1. **Google Sheets Link** (URL)
   - Format validation only (must be valid URL)
   - NOT accessed by AI - just saved for reference
   - User's responsibility to make it public/viewable

2. **Work Summary** (Large textarea, 500-1000 chars)
   - "Describe your analysis:"
   - What pivot tables did you create?
   - What calculated fields did you add?
   - What patterns did you find?
   - What are your top 3 findings?

3. **Executive Memo** (Textarea, 500 chars max)
   - The 1-page summary they'd send to the VP
   - This is the PRIMARY evaluation artifact

4. **Screenshot Descriptions** (Optional for MVP)
   - "Paste screenshots of your pivot tables if you want"
   - AI can't "see" images, but user describes what's in them

### What AI Evaluates

The AI reads:
- Executive memo (primary)
- Work summary (supporting)
- Screenshot descriptions (bonus)

It checks against the rubric:
- Did they identify QuickMove carrier (35% late rate)?
- Did they identify Phoenix warehouse (28% late rate)?
- Did they mention using pivot tables?
- Did they frame findings in business terms?
- Is the writing clear and concise?

---

## Rubric Implementation Pattern

### Step 1: Define Rubric in Code

**File:** `api/lib/rubrics.js`

```javascript
const sprint1Rubric = {
  id: 'sprint-1-rubric',
  name: 'Excel: Operational Bottleneck Analysis',
  
  // Ground truth: What the correct answers are
  expectedFindings: {
    primaryIssue: 'QuickMove carrier has 35% late delivery rate',
    secondaryIssue: 'Phoenix warehouse has 28% late delivery rate',
    falsePattern: 'Snow is correlated but NOT the root cause',
    costOpportunity: 'Economy routes are NOT slower than Express'
  },
  
  // Rubric categories with weights
  categories: [
    {
      name: 'Business Framing',
      weight: 0.20,
      criteria: [
        'Addresses VP\'s actual question (root causes of $2.3M loss)',
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
        'Identifies QuickMove carrier as primary issue (35% late rate)',
        'Identifies Phoenix warehouse as secondary issue (28% late rate)',
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

module.exports = { sprint1Rubric };
```

### Step 2: Build Evaluation Prompt

**File:** `api/evaluate.js`

```javascript
const { callLLM } = require('./lib/llm.js');
const { sprint1Rubric } = require('./lib/rubrics.js');

async function evaluateSubmission(submissionText, workSummary) {
  // Build evaluation prompt with ground truth
  const evaluationPrompt = `You are an expert data analyst evaluator.

SPRINT: Excel Operational Bottleneck Analysis
BUSINESS CONTEXT: FastTrack Logistics, $2.3M annual loss from late deliveries

GROUND TRUTH (Correct Findings):
The dataset contains these patterns:
1. QuickMove carrier: 35% late delivery rate (PRIMARY ISSUE)
2. Phoenix warehouse: 28% late delivery rate (SECONDARY ISSUE)
3. Snow conditions: Correlated with delays but NOT the root cause
4. Economy routes: NOT slower than Express (cost optimization opportunity)

STUDENT'S SUBMISSION:

EXECUTIVE MEMO:
"""
${submissionText}
"""

WORK SUMMARY:
"""
${workSummary}
"""

RUBRIC:
${JSON.stringify(sprint1Rubric, null, 2)}

EVALUATION INSTRUCTIONS:

1. **Check Data Correctness (25%):**
   - Did they identify QuickMove as the primary issue? (Yes/No)
   - Did they identify Phoenix warehouse? (Yes/No)
   - Did they recognize snow as correlation, not causation? (Yes/No)
   - Did they find the Economy route opportunity? (Yes/No)
   - Score: (Number of Yes answers / 4) * 100

2. **Business Framing (20%):**
   - Do they address the VP's actual question?
   - Do they frame in business/financial terms?
   - Are recommendations actionable?
   - Score: 0-100 based on rubric

3. **Technical Execution (25%):**
   - Do they mention pivot tables or aggregation?
   - Do they describe calculated fields?
   - Score: 0-100 based on evidence

4. **Insight Quality (20%):**
   - Do they prioritize by impact?
   - Do they distinguish correlation vs causation?
   - Are recommendations specific?
   - Score: 0-100

5. **Communication Clarity (10%):**
   - Is it concise (~500 words)?
   - Is it professional?
   - Are findings data-backed?
   - Score: 0-100

REQUIRED OUTPUT FORMAT (JSON ONLY, NO MARKDOWN):
{
  "category_scores": {
    "Business Framing": {
      "score": 0-100,
      "feedback": "2-3 sentences on this category"
    },
    "Data Correctness": {
      "score": 0-100,
      "feedback": "What patterns they found/missed"
    },
    "Technical Execution": {
      "score": 0-100,
      "feedback": "Evidence of Excel skills"
    },
    "Insight Quality": {
      "score": 0-100,
      "feedback": "Quality of analysis"
    },
    "Communication Clarity": {
      "score": 0-100,
      "feedback": "Writing quality"
    }
  },
  "overall_score": 0-100,
  "weighted_calculation": "Show: (20*BF + 25*DC + 25*TE + 20*IQ + 10*CC) / 100",
  "overall_feedback": "2-3 sentences summarizing performance",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "areas_for_improvement": ["Specific gap 1", "Specific gap 2"],
  "passed": true/false,
  "next_steps": "If passed: Sprint 2. If failed: Specific advice for retry."
}`;

  const llmResponse = await callLLM({
    systemPrompt: 'You are a rubric evaluator. Return ONLY valid JSON with no markdown formatting.',
    messages: [{ role: 'user', content: evaluationPrompt }],
    maxTokens: 2000,
    temperature: 0.3 // Lower temperature for more consistent scoring
  });

  if (!llmResponse.success) {
    throw new Error('LLM evaluation failed: ' + llmResponse.error);
  }

  // Parse JSON response (handle markdown fences if present)
  let feedbackJSON;
  try {
    const cleanedResponse = llmResponse.content
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    feedbackJSON = JSON.parse(cleanedResponse);
  } catch (parseError) {
    console.error('[Evaluate] JSON parse error:', llmResponse.content);
    throw new Error('Failed to parse AI feedback as JSON');
  }

  return feedbackJSON;
}

module.exports = { evaluateSubmission };
```

### Step 3: Validate Scores Server-Side

**CRITICAL:** Don't trust AI scores blindly. Validate them.

```javascript
function validateScores(feedback) {
  // Check all category scores are 0-100
  for (const category of Object.values(feedback.category_scores)) {
    if (category.score < 0 || category.score > 100 || isNaN(category.score)) {
      console.error('[Evaluate] Invalid score:', category);
      return false;
    }
  }
  
  // Recalculate overall score based on weights
  const rubric = sprint1Rubric;
  let weightedSum = 0;
  
  weightedSum += feedback.category_scores['Business Framing'].score * 0.20;
  weightedSum += feedback.category_scores['Data Correctness'].score * 0.25;
  weightedSum += feedback.category_scores['Technical Execution'].score * 0.25;
  weightedSum += feedback.category_scores['Insight Quality'].score * 0.20;
  weightedSum += feedback.category_scores['Communication Clarity'].score * 0.10;
  
  const calculatedOverall = Math.round(weightedSum);
  
  // Verify AI's calculation is correct (within 5 points tolerance)
  if (Math.abs(calculatedOverall - feedback.overall_score) > 5) {
    console.warn('[Evaluate] AI score mismatch. Overriding with calculated:', calculatedOverall);
    feedback.overall_score = calculatedOverall;
  }
  
  // Set pass/fail threshold
  feedback.passed = feedback.overall_score >= 75;
  
  return true;
}
```

---

## Example Evaluation Flow

### Good Submission (Should Score 80-90)

**Executive Memo:**
> "Analysis of 12 months of FastTrack delivery data reveals two critical issues driving the $2.3M annual loss. First, QuickMove carrier has a 35% late delivery rate compared to 22% industry average, suggesting operational or capacity problems. Second, Phoenix warehouse shows a 28% delay rate, indicating local process issues. While snow conditions correlate with delays (18% higher in winter), they are not the root cause—carrier and warehouse performance issues persist year-round. Recommendations: (1) Audit QuickMove contract and consider alternative carriers (projected savings: $800K), (2) Investigate Phoenix warehouse staffing and process flows (projected savings: $650K), (3) Interestingly, Economy routes perform identically to Express routes, presenting a $200K cost optimization opportunity without service degradation."

**AI Evaluation:**
- **Data Correctness: 100** (all 4 patterns identified)
- **Business Framing: 90** (clear financial framing, specific recommendations)
- **Technical Execution: 80** (mentions analysis, though could detail Excel tools more)
- **Insight Quality: 85** (prioritized by impact, correlation vs causation clear)
- **Communication Clarity: 90** (concise, professional, data-backed)
- **Overall: 88** (weighted average)
- **Result: PASS** (>= 75)

### Weak Submission (Should Score 50-60)

**Executive Memo:**
> "I looked at the delivery data and found some problems. QuickMove is slower than other carriers. Phoenix has issues too. Snow makes deliveries late. We should probably fix these things. Maybe get better carriers or improve warehouse operations. The data shows this in the charts I made."

**AI Evaluation:**
- **Data Correctness: 50** (mentions QuickMove and Phoenix but no specifics)
- **Business Framing: 40** (no financial context, vague recommendations)
- **Technical Execution: 30** (vague mention of "charts")
- **Insight Quality: 45** (no prioritization, no causation distinction)
- **Communication Clarity: 60** (too brief, not data-backed)
- **Overall: 44** (weighted average)
- **Result: FAIL** (< 75)

---

## Testing Your Rubric Implementation

### Test Case 1: Perfect Submission

Create a test that mentions all 4 key findings explicitly.
Expected score: 85-95

### Test Case 2: Partial Submission

Only mentions 2 out of 4 findings.
Expected score: 60-70

### Test Case 3: Wrong Findings

Identifies wrong patterns (e.g., "Snow is the main problem").
Expected score: 30-40

### Test Case 4: Good Writing, Wrong Data

Professional writing but incorrect analysis.
Expected score: 50-60 (high communication, low data correctness)

---

## Common Pitfalls to Avoid

### ❌ Don't Do This:

1. **Expecting AI to open Google Sheets**
   - Won't work without complex OAuth + Google Sheets API integration
   - Not worth it for MVP

2. **Trusting AI scores without validation**
   - AI can hallucinate scores or miscalculate
   - Always recalculate overall score server-side

3. **Using vague rubric criteria**
   - "Good analysis" is too vague
   - "Identifies QuickMove as 35% late rate" is specific

4. **Not providing ground truth**
   - AI doesn't know what the correct patterns are
   - You must tell it in the evaluation prompt

### ✅ Do This Instead:

1. **Accept text-based submissions**
   - Google Sheets URL for reference only
   - Evaluate based on what user writes

2. **Validate scores programmatically**
   - Recalculate weighted average
   - Check for outliers (all 100s or all 0s)

3. **Use specific rubric criteria**
   - Name exact patterns to check for
   - Provide scoring guide (excellent/good/adequate/poor)

4. **Include ground truth in prompt**
   - Tell AI what the correct answers are
   - AI compares submission against ground truth

---

## Post-Demo Enhancements

After demo is successful, consider:

1. **Add screenshot upload**
   - Store images in Vercel Blob or Supabase Storage
   - Use Claude's vision capabilities to "see" pivot tables
   - Cost: ~$0.01 per image

2. **Add Google Sheets API integration**
   - Fetch actual sheet data
   - Verify formulas programmatically
   - Cost: Free (Google API), complexity: high

3. **Add plagiarism detection**
   - Check if memo is AI-generated
   - Require original analysis

4. **Add peer comparison**
   - "Your score is higher than 68% of students"
   - Motivational and informative

---

## TL;DR: How Rubrics Actually Work

1. **User submits:** Google Sheets URL (reference only) + Executive Memo (TEXT)
2. **AI evaluates:** Memo TEXT against rubric + ground truth
3. **AI returns:** Scores for each category + overall score (JSON)
4. **Server validates:** Recalculates overall score, checks 0-100 range
5. **User sees:** Scores + feedback + pass/fail

**Key Insight:** We're evaluating WRITING about analysis, not the actual Excel work. This is acceptable for MVP because:
- It's fast (~15 seconds)
- It's cheap (~$0.03 per evaluation)
- It scales (1 or 1000 students, same code)
- It proves the concept

**For production:** Add screenshot analysis or Sheets API for higher fidelity.

---

*Use this guide when implementing Day 3 feedback system. This is the reality of what's possible.*
