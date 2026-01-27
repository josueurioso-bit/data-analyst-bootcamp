/**
 * Database Test Script
 *
 * Run this to verify your database is working correctly:
 *   node test-db.js
 *
 * This script:
 * 1. Initializes the database
 * 2. Inserts a test assessment
 * 3. Queries all assessments
 * 4. Shows the count
 */

const {
  initDb,
  insertAssessment,
  getAllAssessments,
  getAssessmentCount,
  getDbPath
} = require('./api/lib/db.js');

async function testDatabase() {
  console.log('='.repeat(50));
  console.log('DATABASE TEST');
  console.log('='.repeat(50));
  console.log();

  // Show database path
  console.log(`Database path: ${getDbPath()}`);
  console.log();

  // Initialize database
  console.log('1. Initializing database...');
  await initDb();
  console.log('   Done!\n');

  // Insert a test record
  console.log('2. Inserting test assessment...');
  const testAssessment = {
    sessionId: `test_${Date.now()}`,
    numeracyScore: 8,
    readingScore: 3,
    computerScore: 7,
    logicScore: 6,
    communicationScore: 4,
    mindsetScore: 5,
    readinessLevel: 2,
    readinessTitle: 'Ready with Quick Prep',
    ipHash: 'test_hash_abc123',
    consentGiven: true
  };

  const success = await insertAssessment(testAssessment);
  console.log(`   Insert ${success ? 'succeeded' : 'FAILED'}!\n`);

  // Get count
  console.log('3. Counting assessments...');
  const count = await getAssessmentCount();
  console.log(`   Total assessments: ${count}\n`);

  // Get all assessments
  console.log('4. Fetching all assessments...');
  const assessments = await getAllAssessments();
  console.log(`   Retrieved ${assessments.length} records\n`);

  // Show first few records
  if (assessments.length > 0) {
    console.log('5. Sample data (most recent):');
    const sample = assessments.slice(0, 3);
    sample.forEach((row, i) => {
      console.log(`\n   Record ${i + 1}:`);
      console.log(`   - Session: ${row.session_id}`);
      console.log(`   - Timestamp: ${row.timestamp}`);
      console.log(`   - Scores: N=${row.numeracy_score}, R=${row.reading_score}, C=${row.computer_score}, L=${row.logic_score}, Co=${row.communication_score}, M=${row.mindset_score}`);
      console.log(`   - Readiness: Level ${row.readiness_level} (${row.readiness_title})`);
    });
  }

  console.log('\n' + '='.repeat(50));
  console.log('TEST COMPLETE');
  console.log('='.repeat(50));

  if (success && count > 0) {
    console.log('\nSUCCESS! Database is working correctly.');
    console.log(`\nYou can find the database file at:\n  ${getDbPath()}`);
  } else {
    console.log('\nWARNING: Something may be wrong. Check the errors above.');
  }
}

// Run the test
testDatabase().catch(error => {
  console.error('\nTEST FAILED:', error);
  process.exit(1);
});
