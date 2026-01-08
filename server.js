// Backend Server for Milestone 0 Assessment
// This keeps your API key private and handles all AI requests

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON requests

// Your Anthropic API key - stored as environment variable
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'Milestone 0 Assessment Backend',
    version: '1.0'
  });
});

// Main chat endpoint - handles conversation with Claude
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Validate request
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Invalid request: messages array required' 
      });
    }

    // Check API key is configured
    if (!ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error: API key not set' 
      });
    }

    // System prompt for assessment
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
    res.json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Test endpoint to verify setup
app.get('/api/test', async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'API key not configured' 
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 50,
        messages: [
          { role: 'user', content: 'Say hello in 3 words' }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ 
        success: true, 
        message: 'Backend working correctly!',
        test_response: data.content[0].text
      });
    } else {
      res.status(response.status).json({ 
        success: false, 
        error: 'API key invalid or rate limited' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🔑 API key configured: ${ANTHROPIC_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌐 Ready to accept requests`);
});

module.exports = app;
