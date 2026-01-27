/**
 * Pattern Verification Script
 *
 * Analyzes the database to show the patterns in your data.
 * This output can be used as talking points for your demo!
 *
 * Run with: node scripts/verify-patterns.js
 */

const { initDb, getDb, getDbPath } = require('../api/lib/db.js');

// Pillar configuration (same as seed script)
const PILLARS = [
  { name: 'Reading',       column: 'reading_score',       threshold: 2, max: 5 },
  { name: 'Communication', column: 'communication_score', threshold: 2, max: 5 },
  { name: 'Logic',         column: 'logic_score',         threshold: 3, max: 8 },
  { name: 'Numeracy',      column: 'numeracy_score',      threshold: 4, max: 10 },
  { name: 'Computer',      column: 'computer_score',      threshold: 4, max: 10 },
  { name: 'Mindset',       column: 'mindset_score',       threshold: 3, max: 7 }
];

async function analyzePatterns() {
  console.log('='.repeat(60));
  console.log('BOOTCAMP ASSESSMENT DATA ANALYSIS');
  console.log('='.repeat(60));
  console.log();
  console.log(`Database: ${getDbPath()}`);
  console.log();

  // Initialize and get database
  await initDb();
  const db = await getDb();

  // Total assessments
  const totalResult = db.exec('SELECT COUNT(*) FROM assessments');
  const total = totalResult[0].values[0][0];
  console.log(`Total Assessments: ${total}`);
  console.log();

  // =========================================================
  // READINESS LEVEL DISTRIBUTION
  // =========================================================
  console.log('-'.repeat(60));
  console.log('READINESS LEVEL DISTRIBUTION');
  console.log('-'.repeat(60));

  const readinessResult = db.exec(`
    SELECT readiness_level, readiness_title, COUNT(*) as count
    FROM assessments
    GROUP BY readiness_level
    ORDER BY readiness_level
  `);

  if (readinessResult.length > 0) {
    readinessResult[0].values.forEach(row => {
      const [level, title, count] = row;
      const pct = ((count / total) * 100).toFixed(1);
      const bar = '#'.repeat(Math.round(pct / 2));
      console.log(`  Level ${level}: ${String(count).padStart(3)} students (${pct.padStart(5)}%) ${bar}`);
      console.log(`         ${title}`);
    });
  }
  console.log();

  // =========================================================
  // PILLAR WEAKNESS ANALYSIS
  // =========================================================
  console.log('-'.repeat(60));
  console.log('PILLAR WEAKNESS ANALYSIS (Sorted by Struggle Rate)');
  console.log('-'.repeat(60));

  const pillarStats = [];

  for (const pillar of PILLARS) {
    // Count struggling students
    const weakResult = db.exec(`
      SELECT COUNT(*) FROM assessments
      WHERE ${pillar.column} <= ${pillar.threshold}
    `);
    const weakCount = weakResult[0].values[0][0];

    // Calculate average
    const avgResult = db.exec(`
      SELECT AVG(${pillar.column}) FROM assessments
    `);
    const avgScore = avgResult[0].values[0][0];

    pillarStats.push({
      name: pillar.name,
      weakCount,
      weakPct: (weakCount / total) * 100,
      avgScore,
      max: pillar.max,
      avgPct: (avgScore / pillar.max) * 100
    });
  }

  // Sort by weakness percentage (highest first)
  pillarStats.sort((a, b) => b.weakPct - a.weakPct);

  pillarStats.forEach((stat, index) => {
    const bar = '#'.repeat(Math.round(stat.weakPct / 2));
    const marker = index === 0 ? ' <-- PRIMARY WEAKNESS' : (index === 1 ? ' <-- SECONDARY' : '');
    console.log();
    console.log(`  ${stat.name}:${marker}`);
    console.log(`    Struggling: ${stat.weakCount} students (${stat.weakPct.toFixed(1)}%) ${bar}`);
    console.log(`    Average:    ${stat.avgScore.toFixed(1)}/${stat.max} (${stat.avgPct.toFixed(1)}%)`);
  });
  console.log();

  // =========================================================
  // KEY INSIGHTS FOR DEMO
  // =========================================================
  console.log('='.repeat(60));
  console.log('KEY INSIGHTS FOR YOUR DEMO');
  console.log('='.repeat(60));
  console.log();

  const primary = pillarStats[0];
  const secondary = pillarStats[1];

  console.log(`  PRIMARY FINDING:`);
  console.log(`  "${primary.weakPct.toFixed(0)}% of students struggle with ${primary.name.toLowerCase()}"`);
  console.log();
  console.log(`  SECONDARY FINDING:`);
  console.log(`  "${secondary.weakPct.toFixed(0)}% of students struggle with ${secondary.name.toLowerCase()}"`);
  console.log();
  console.log(`  IMPACT STATEMENT:`);
  console.log(`  "Without this data, I was guessing what to teach.`);
  console.log(`   Now I know to prioritize ${primary.name.toLowerCase()} and ${secondary.name.toLowerCase()}`);
  console.log(`   support materials before technical training."`);
  console.log();

  // =========================================================
  // SCORE DISTRIBUTION SUMMARY
  // =========================================================
  console.log('-'.repeat(60));
  console.log('AVERAGE SCORES BY PILLAR');
  console.log('-'.repeat(60));

  // Sort by average score (lowest first)
  const sortedByAvg = [...pillarStats].sort((a, b) => a.avgPct - b.avgPct);

  sortedByAvg.forEach(stat => {
    const barLength = Math.round(stat.avgPct / 2);
    const bar = '█'.repeat(barLength) + '░'.repeat(50 - barLength);
    console.log(`  ${stat.name.padEnd(14)} ${bar} ${stat.avgPct.toFixed(0)}%`);
  });
  console.log();

  console.log('='.repeat(60));
  console.log('Analysis complete! Use these insights for your demo.');
  console.log('='.repeat(60));
}

// Run if called directly
if (require.main === module) {
  analyzePatterns().catch(error => {
    console.error('\nANALYSIS ERROR:', error);
    process.exit(1);
  });
}

module.exports = { analyzePatterns };
