// Verified Vercel Serverless Function for Milestone 0 Assessment
// This file goes in: /api/chat.js

import crypto from 'crypto';

/**
 * Hash IP address for privacy
 *
 * TEACHING MOMENT: We NEVER store raw IP addresses.
 * SHA-256 is a one-way hash - you can't reverse it to get the original IP.
 * This protects user privacy while still allowing us to detect duplicates.
 */
function hashIp(ip) {
  if (!ip) return null;
  return crypto.createHash('sha256').update(ip).digest('hex');
}

/**
 * Extract client IP from request headers
 *
 * TEACHING MOMENT: When behind a proxy (like Vercel), the real client IP
 * is in the x-forwarded-for header, not the socket address.
 */
function getClientIp(req) {
  const xfwd = req.headers['x-forwarded-for'];
  if (xfwd) {
    return xfwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || null;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract messages and consent status from request
    // TEACHING MOMENT: consentGiven will be added by frontend in Session 3
    // For now, we default to true (will save data)
    const { messages, consentGiven = true } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request: messages array required'
      });
    }

    // Check API key
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error: API key not set' 
      });
    }

    // System prompt
    const systemPrompt = `You are an encouraging AI tutor conducting the Milestone 0 baseline assessment for a Data Analyst Bootcamp. Your goal is to evaluate whether students have the foundational skills needed to START learning data analysis.

## YOUR ROLE
- Supportive mentor conducting a natural conversation, not a rigid quiz
- You're assessing FOUNDATION skills (numeracy, reading, computer literacy, logic, communication, mindset)
- You are NOT testing data analysis skills (Excel, SQL, etc.) - that comes later
- Be encouraging but honest - frame gaps as "opportunities to learn"

## ASSESSMENT STRUCTURE - 6 PILLARS (45 questions total)

### 1. BASIC NUMERACY (10 questions)
Test: Simple arithmetic, percentages, fractions, decimals, estimation
Examples:
- "What is 10% of 200?"
- "Which is larger: 1/2 or 1/4?"
- "If you have 45 + 37, what's the answer?"
- "A product costs $80 and is 25% off. What's the sale price?"

Scoring:
- 9-10: STRONG (Green)
- 7-8: ADEQUATE (Green)
- 5-6: BASIC (Yellow)
- 3-4: WEAK (Orange)
- 0-2: GAP (Red)

### 2. READING COMPREHENSION (5 questions)
Test: Following instructions, extracting information
Examples:
- "A company had 45 complaints in January and 60 in February. Did complaints increase or decrease?"

Scoring:
- 5/5: STRONG (Green)
- 4/5: GOOD (Green)
- 3/5: ADEQUATE (Yellow)
- 1-2: WEAK (Orange)
- 0: GAP (Red)

### 3. COMPUTER LITERACY (10 questions)
Test: File management, shortcuts, troubleshooting
Examples:
- "How do you save a document?"
- "What does Ctrl+Z do?"
- "What's the difference between .csv and .xlsx?"

Scoring:
- 9-10: CONFIDENT (Green)
- 7-8: ADEQUATE (Green)
- 5-6: BASIC (Yellow)
- 3-4: WEAK (Orange)
- 0-2: GAP (Red)

### 4. LOGICAL THINKING (8 questions)
Test: Patterns, if-then logic, problem decomposition
Examples:
- "What comes next: 2, 4, 6, 8, ?"
- "If sales go up when temperature rises, does temperature cause sales?"

Scoring:
- 7-8: STRONG (Green)
- 5-6: GOOD (Green)
- 3-4: BASIC (Yellow)
- 1-2: WEAK (Orange)
- 0: GAP (Red)

### 5. COMMUNICATION BASICS (5 questions)
Test: Writing clearly, explaining simply
Examples:
- "Explain what 'average' means to someone who's never heard the term"

Scoring:
- 5/5: EXCELLENT (Green)
- 4/5: GOOD (Green)
- 3/5: ADEQUATE (Yellow)
- 1-2: WEAK (Orange)
- 0: GAP (Red)

### 6. LEARNING MINDSET (7 questions)
Test: Self-direction, handling mistakes, resilience
Examples:
- "You get an error message. What do you do first?"
- "How many hours per week can you commit to learning?"

Scoring:
- 6-7: EXCELLENT (Green)
- 5: GOOD (Green)
- 3-4: DEVELOPING (Yellow)
- 1-2: WEAK (Orange)
- 0: NOT READY (Red)

## CONVERSATION FLOW
1. Start warmly
2. Work through each pillar naturally
3. Give immediate feedback
4. Track scores internally
5. After all 6 pillars: Provide complete results

## 5 READINESS LEVELS

**Level 1: READY TO START** ✅
- All/most pillars Green
- Action: Begin Milestone 1

**Level 2: READY WITH QUICK PREP** ✅⚠️
- Mix of Green and Yellow
- Action: 1-2 week prep

**Level 3: NEED FOUNDATION WORK** ⚠️
- Some Orange
- Action: 4-6 week foundation program

**Level 4: NEED COMPREHENSIVE PREP** 🛠️
- Multiple Orange, some Red
- Action: 8-12 week prep

**Level 5: NOT YET READY** 📚
- Multiple Red
- Action: Build foundations first (6-12 months)

## FINAL OUTPUT FORMAT
After completing all pillars, provide results as JSON:

{
  "assessment_complete": true,
  "pillars": {
    "numeracy": {"score": X, "level": "STRONG/ADEQUATE/BASIC/WEAK/GAP", "color": "green/yellow/orange/red"},
    "reading": {"score": X, "level": "...", "color": "..."},
    "computer": {"score": X, "level": "...", "color": "..."},
    "logic": {"score": X, "level": "...", "color": "..."},
    "communication": {"score": X, "level": "...", "color": "..."},
    "mindset": {"score": X, "level": "...", "color": "..."}
  },
  "readiness_level": 1-5,
  "readiness_title": "Ready to Start / Ready with Quick Prep / etc",
  "overall_message": "Encouraging summary",
  "strengths": ["List strong areas"],
  "areas_to_develop": ["Specific gaps"],
  "next_steps": "Concrete action plan",
  "estimated_prep_time": "0 weeks / 1-2 weeks / etc"
}

Be warm, encouraging, and natural!`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(response.status).json({
        error: 'AI service error',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();

    // =========================================================
    // DATABASE SAVE LOGIC
    // TEACHING MOMENT: We check if this response contains final
    // assessment results. The AI returns JSON with "assessment_complete": true
    // when the quiz is finished.
    // =========================================================

    const aiText = data.content?.[0]?.text || '';
    let assessmentResults = null;

    // Try to extract JSON assessment results from the AI response
    try {
      // Look for JSON object with assessment_complete: true
      const jsonMatch = aiText.match(/\{[\s\S]*"assessment_complete":\s*true[\s\S]*\}/);
      if (jsonMatch) {
        assessmentResults = JSON.parse(jsonMatch[0]);
        console.log('[Chat] Assessment complete detected');
      }
    } catch (parseError) {
      // Not a final result, just a normal conversation turn - that's fine
      console.log('[Chat] No assessment results in this response (normal)');
    }

    // If we have completed assessment results AND user consented, save to database
    if (assessmentResults && assessmentResults.assessment_complete && consentGiven === true) {
      try {
        // Dynamic import of database helper (CommonJS module)
        const { insertAssessment } = await import('./lib/db.js');

        const clientIp = getClientIp(req);
        const ipHash = hashIp(clientIp);
        const pillars = assessmentResults.pillars || {};

        // Prepare assessment data for database
        const assessmentData = {
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          numeracyScore: pillars.numeracy?.score || 0,
          readingScore: pillars.reading?.score || 0,
          computerScore: pillars.computer?.score || 0,
          logicScore: pillars.logic?.score || 0,
          communicationScore: pillars.communication?.score || 0,
          mindsetScore: pillars.mindset?.score || 0,
          readinessLevel: assessmentResults.readiness_level || 0,
          readinessTitle: assessmentResults.readiness_title || '',
          ipHash: ipHash,
          consentGiven: true
        };

        const success = await insertAssessment(assessmentData);

        if (success) {
          console.log('[Chat] Assessment saved to database (user consented)');
        } else {
          console.error('[Chat] Failed to save assessment to database');
        }
      } catch (dbError) {
        // TEACHING MOMENT: Database errors should NOT break the quiz!
        // The user still gets their results even if we can't save them.
        console.error('[Chat] Database error (quiz still works):', dbError.message);
      }
    } else if (assessmentResults && assessmentResults.assessment_complete) {
      // Assessment complete but user opted out
      console.log('[Chat] Assessment NOT saved (user opted out of data collection)');
    }

    // Always return the AI response to the frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
