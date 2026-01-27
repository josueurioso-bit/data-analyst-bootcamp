/**
 * Seed Data Generator
 *
 * Generates 100 realistic assessment records with INTENTIONAL patterns
 * for demo purposes. The patterns are designed to show:
 *
 * PRIMARY INSIGHT: 68% of students struggle with reading comprehension
 * SECONDARY INSIGHT: 62% struggle with communication
 *
 * TEACHING MOMENT: This demonstrates how aggregate data reveals patterns
 * that individual assessments wouldn't show. This is the core value
 * proposition of your analytics system!
 *
 * Run with: node scripts/seed-data.js
 */

const { initDb, getDb, saveDb, getDbPath } = require('../api/lib/db.js');

// =========================================================
// CONFIGURATION
// =========================================================

// Score ranges for each pillar (based on number of questions)
const PILLAR_CONFIG = {
  numeracy:      { max: 10, weakThreshold: 4 },  // 10 questions
  reading:       { max: 5,  weakThreshold: 2 },  // 5 questions
  computer:      { max: 10, weakThreshold: 4 },  // 10 questions
  logic:         { max: 8,  weakThreshold: 3 },  // 8 questions
  communication: { max: 5,  weakThreshold: 2 },  // 5 questions
  mindset:       { max: 7,  weakThreshold: 3 }   // 7 questions
};

// Readiness level distribution (must sum to 1.0)
// TEACHING MOMENT: This creates a realistic bell curve centered on Level 2
const READINESS_DISTRIBUTION = [
  { level: 1, title: 'Ready to Start',           probability: 0.15 },
  { level: 2, title: 'Ready with Quick Prep',    probability: 0.40 }, // Largest group
  { level: 3, title: 'Need Foundation Work',     probability: 0.25 },
  { level: 4, title: 'Need Comprehensive Prep',  probability: 0.15 },
  { level: 5, title: 'Not Yet Ready',            probability: 0.05 }
];

// Target weakness percentages (the patterns we want to reveal)
const WEAKNESS_TARGETS = {
  reading:       0.68,  // 68% struggle - PRIMARY finding for demo
  communication: 0.62,  // 62% struggle - SECONDARY finding
  logic:         0.45,  // 45% struggle
  numeracy:      0.30,  // 30% struggle
  computer:      0.25,  // 25% struggle
  mindset:       0.20   // 20% struggle - least common weakness
};

// =========================================================
// HELPER FUNCTIONS
// =========================================================

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select readiness level based on probability distribution
 *
 * TEACHING MOMENT: This uses cumulative probability to select
 * from a weighted distribution. Math.random() gives 0-1, and we
 * find which "bucket" it falls into.
 */
function selectReadinessLevel() {
  const rand = Math.random();
  let cumulative = 0;

  for (const config of READINESS_DISTRIBUTION) {
    cumulative += config.probability;
    if (rand <= cumulative) {
      return { level: config.level, title: config.title };
    }
  }

  // Fallback (shouldn't happen if probabilities sum to 1.0)
  return READINESS_DISTRIBUTION[READINESS_DISTRIBUTION.length - 1];
}

/**
 * Generate base scores for a student at a given readiness level
 *
 * TEACHING MOMENT: Higher readiness levels correlate with higher scores,
 * but there's still randomness to make it realistic.
 */
function generateBaseScores(readinessLevel) {
  let scores = {
    numeracy:      randomInt(2, PILLAR_CONFIG.numeracy.max),
    reading:       randomInt(1, PILLAR_CONFIG.reading.max),
    computer:      randomInt(2, PILLAR_CONFIG.computer.max),
    logic:         randomInt(2, PILLAR_CONFIG.logic.max),
    communication: randomInt(1, PILLAR_CONFIG.communication.max),
    mindset:       randomInt(2, PILLAR_CONFIG.mindset.max)
  };

  // Adjust based on readiness level
  if (readinessLevel === 1) {
    // Level 1 = strong across the board (boost all scores)
    scores.numeracy      = Math.max(scores.numeracy, randomInt(7, 10));
    scores.reading       = Math.max(scores.reading, randomInt(4, 5));
    scores.computer      = Math.max(scores.computer, randomInt(7, 10));
    scores.logic         = Math.max(scores.logic, randomInt(6, 8));
    scores.communication = Math.max(scores.communication, randomInt(4, 5));
    scores.mindset       = Math.max(scores.mindset, randomInt(5, 7));
  } else if (readinessLevel === 2) {
    // Level 2 = mostly good with some gaps
    scores.numeracy      = Math.max(scores.numeracy, randomInt(5, 8));
    scores.computer      = Math.max(scores.computer, randomInt(5, 8));
    scores.mindset       = Math.max(scores.mindset, randomInt(4, 6));
  } else if (readinessLevel === 4) {
    // Level 4 = struggling in multiple areas
    scores.numeracy      = Math.min(scores.numeracy, randomInt(3, 6));
    scores.reading       = Math.min(scores.reading, randomInt(1, 3));
    scores.logic         = Math.min(scores.logic, randomInt(2, 4));
    scores.communication = Math.min(scores.communication, randomInt(1, 3));
  } else if (readinessLevel === 5) {
    // Level 5 = weak across the board
    scores.numeracy      = Math.min(scores.numeracy, randomInt(1, 4));
    scores.reading       = Math.min(scores.reading, randomInt(0, 2));
    scores.computer      = Math.min(scores.computer, randomInt(1, 4));
    scores.logic         = Math.min(scores.logic, randomInt(1, 3));
    scores.communication = Math.min(scores.communication, randomInt(0, 2));
    scores.mindset       = Math.min(scores.mindset, randomInt(1, 3));
  }

  return scores;
}

/**
 * Enforce the target weakness patterns
 *
 * TEACHING MOMENT: This is where we "rig" the data to show the patterns
 * we want for the demo. In real data, patterns emerge naturally. Here,
 * we're creating synthetic data that demonstrates what insights look like.
 */
function enforcePatterns(scores) {
  // 68% should struggle with reading (score <= threshold)
  if (Math.random() < WEAKNESS_TARGETS.reading) {
    scores.reading = Math.min(scores.reading, PILLAR_CONFIG.reading.weakThreshold);
  }

  // 62% should struggle with communication
  if (Math.random() < WEAKNESS_TARGETS.communication) {
    scores.communication = Math.min(scores.communication, PILLAR_CONFIG.communication.weakThreshold);
  }

  // 45% should struggle with logic
  if (Math.random() < WEAKNESS_TARGETS.logic) {
    scores.logic = Math.min(scores.logic, PILLAR_CONFIG.logic.weakThreshold);
  }

  // 30% should struggle with numeracy
  if (Math.random() < WEAKNESS_TARGETS.numeracy) {
    scores.numeracy = Math.min(scores.numeracy, PILLAR_CONFIG.numeracy.weakThreshold);
  }

  // 25% should struggle with computer
  if (Math.random() < WEAKNESS_TARGETS.computer) {
    scores.computer = Math.min(scores.computer, PILLAR_CONFIG.computer.weakThreshold);
  }

  // 20% should struggle with mindset
  if (Math.random() < WEAKNESS_TARGETS.mindset) {
    scores.mindset = Math.min(scores.mindset, PILLAR_CONFIG.mindset.weakThreshold);
  }

  return scores;
}

/**
 * Generate a random timestamp within the last 30 days
 */
function generateTimestamp() {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo);
  return new Date(randomTime).toISOString().replace('T', ' ').substring(0, 19);
}

// =========================================================
// MAIN SEED FUNCTION
// =========================================================

async function seedDatabase() {
  console.log('='.repeat(50));
  console.log('SEED DATA GENERATOR');
  console.log('='.repeat(50));
  console.log();
  console.log(`Database: ${getDbPath()}`);
  console.log('Target: 100 records with intentional patterns');
  console.log();

  // Initialize database
  await initDb();
  const db = await getDb();

  // Clear existing demo data (keep any real assessments)
  console.log('Clearing existing demo records...');
  db.run("DELETE FROM assessments WHERE session_id LIKE 'demo_%'");
  saveDb();

  console.log('Generating 100 new demo records...\n');

  // Generate 100 records
  for (let i = 0; i < 100; i++) {
    const readinessData = selectReadinessLevel();
    let scores = generateBaseScores(readinessData.level);
    scores = enforcePatterns(scores);

    const sessionId = `demo_${String(i + 1).padStart(3, '0')}_${Date.now()}`;
    const timestamp = generateTimestamp();

    // Insert record
    db.run(`
      INSERT INTO assessments (
        session_id,
        timestamp,
        numeracy_score,
        reading_score,
        computer_score,
        logic_score,
        communication_score,
        mindset_score,
        readiness_level,
        readiness_title,
        user_ip_hash,
        consent_given
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      timestamp,
      scores.numeracy,
      scores.reading,
      scores.computer,
      scores.logic,
      scores.communication,
      scores.mindset,
      readinessData.level,
      readinessData.title,
      null,  // Demo data doesn't need IP tracking
      1      // consent_given = true
    ]);

    // Progress indicator
    if ((i + 1) % 20 === 0) {
      console.log(`  Generated ${i + 1} records...`);
    }
  }

  // Save all changes to disk
  saveDb();

  console.log('\n' + '='.repeat(50));
  console.log('SEED DATA COMPLETE');
  console.log('='.repeat(50));

  // Verify the patterns
  console.log('\nVerifying patterns:\n');

  // Total count
  const totalResult = db.exec('SELECT COUNT(*) FROM assessments');
  const total = totalResult[0].values[0][0];
  console.log(`Total assessments: ${total}`);

  // Reading weakness
  const readingResult = db.exec(`
    SELECT COUNT(*) FROM assessments
    WHERE reading_score <= ${PILLAR_CONFIG.reading.weakThreshold}
  `);
  const readingWeak = readingResult[0].values[0][0];
  const readingPct = ((readingWeak / total) * 100).toFixed(0);
  console.log(`Reading weakness: ${readingWeak} students (${readingPct}%) - Target: 68%`);

  // Communication weakness
  const commResult = db.exec(`
    SELECT COUNT(*) FROM assessments
    WHERE communication_score <= ${PILLAR_CONFIG.communication.weakThreshold}
  `);
  const commWeak = commResult[0].values[0][0];
  const commPct = ((commWeak / total) * 100).toFixed(0);
  console.log(`Communication weakness: ${commWeak} students (${commPct}%) - Target: 62%`);

  // Readiness distribution
  console.log('\nReadiness level distribution:');
  const distResult = db.exec(`
    SELECT readiness_level, readiness_title, COUNT(*) as count
    FROM assessments
    GROUP BY readiness_level
    ORDER BY readiness_level
  `);

  if (distResult.length > 0) {
    distResult[0].values.forEach(row => {
      const [level, title, count] = row;
      const pct = ((count / total) * 100).toFixed(0);
      console.log(`  Level ${level} (${title}): ${count} students (${pct}%)`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('Ready for CSV export and dashboard testing!');
  console.log('='.repeat(50));
}

// Run if called directly
if (require.main === module) {
  seedDatabase().catch(error => {
    console.error('\nSEED ERROR:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
