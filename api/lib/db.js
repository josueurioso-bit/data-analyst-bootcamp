/**
 * Database Helper Module
 *
 * TEACHING MOMENT: This module handles all SQLite database operations.
 * We use sql.js (SQLite compiled to WebAssembly) which works everywhere
 * without requiring native build tools.
 *
 * Key concepts:
 * - SQLite stores everything in a single file (assessments.db)
 * - We load the file into memory, make changes, then save back to disk
 * - Prepared statements (?) prevent SQL injection attacks
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Singleton database instance
let db = null;
let SQL = null;

// Determine database file path based on environment
function getDbPath() {
  // In production (Vercel), use /tmp which is the only writable location
  // In development, use the project root
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return '/tmp/assessments.db';
  }
  return path.join(process.cwd(), 'assessments.db');
}

/**
 * Initialize the database connection
 *
 * TEACHING MOMENT: sql.js is async because it needs to load WebAssembly.
 * We cache the connection so we only initialize once.
 */
async function initDb() {
  if (db) return db;

  // Initialize sql.js (loads WebAssembly)
  if (!SQL) {
    SQL = await initSqlJs();
  }

  const dbPath = getDbPath();
  console.log(`[DB] Database path: ${dbPath}`);

  // Try to load existing database file
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('[DB] Loaded existing database');
    } else {
      // Create new database
      db = new SQL.Database();
      console.log('[DB] Created new database');
    }
  } catch (error) {
    console.error('[DB] Error loading database, creating new:', error.message);
    db = new SQL.Database();
  }

  // Create table if it doesn't exist
  // TEACHING MOMENT: CREATE TABLE IF NOT EXISTS is idempotent -
  // safe to run multiple times without errors
  db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,

      -- Pillar scores (match quiz output)
      -- Each pillar has a different max score based on number of questions
      numeracy_score INTEGER,      -- out of 10
      reading_score INTEGER,       -- out of 5
      computer_score INTEGER,      -- out of 10
      logic_score INTEGER,         -- out of 8
      communication_score INTEGER, -- out of 5
      mindset_score INTEGER,       -- out of 7

      -- Overall assessment result
      readiness_level INTEGER,     -- 1-5 scale
      readiness_title TEXT,        -- "Ready to Start", etc.

      -- Ethics & security
      user_ip_hash TEXT,           -- SHA-256 hash, NOT raw IP
      consent_given BOOLEAN DEFAULT 1
    );
  `);

  // Save to file after creating table
  saveDb();

  return db;
}

/**
 * Save database to file
 *
 * TEACHING MOMENT: sql.js keeps everything in memory.
 * We must explicitly write to disk to persist changes.
 */
function saveDb() {
  if (!db) return;

  try {
    const dbPath = getDbPath();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log('[DB] Database saved to disk');
  } catch (error) {
    console.error('[DB] Error saving database:', error.message);
  }
}

/**
 * Get database instance (async)
 *
 * Usage:
 *   const db = await getDb();
 *   db.run('INSERT INTO assessments ...');
 */
async function getDb() {
  return await initDb();
}

/**
 * Insert an assessment record
 *
 * TEACHING MOMENT: We use a prepared statement with ? placeholders.
 * This prevents SQL injection - user input can't become SQL code.
 *
 * @param {Object} assessment - The assessment data to insert
 * @returns {boolean} - True if insert succeeded
 */
async function insertAssessment(assessment) {
  const database = await getDb();

  try {
    // TEACHING MOMENT: Prepared statements
    // The ? marks are placeholders that get safely replaced with values.
    // This is MUCH safer than string concatenation like:
    // `INSERT INTO assessments VALUES ('${sessionId}', ...)` <-- DANGEROUS!

    database.run(`
      INSERT INTO assessments (
        session_id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assessment.sessionId,
      assessment.numeracyScore,
      assessment.readingScore,
      assessment.computerScore,
      assessment.logicScore,
      assessment.communicationScore,
      assessment.mindsetScore,
      assessment.readinessLevel,
      assessment.readinessTitle,
      assessment.ipHash,
      assessment.consentGiven ? 1 : 0
    ]);

    // Save changes to disk
    saveDb();

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
 * @returns {Array} - Array of assessment objects
 */
async function getAllAssessments() {
  const database = await getDb();

  try {
    const results = database.exec(`
      SELECT
        session_id,
        timestamp,
        numeracy_score,
        reading_score,
        computer_score,
        logic_score,
        communication_score,
        mindset_score,
        readiness_level,
        readiness_title
      FROM assessments
      ORDER BY timestamp DESC
    `);

    // sql.js returns results in a specific format, convert to objects
    if (results.length === 0) return [];

    const columns = results[0].columns;
    const values = results[0].values;

    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });
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
  const database = await getDb();

  try {
    const results = database.exec('SELECT COUNT(*) as count FROM assessments');
    if (results.length === 0) return 0;
    return results[0].values[0][0];
  } catch (error) {
    console.error('[DB] Count error:', error.message);
    return 0;
  }
}

// Export for use in other modules
// TEACHING MOMENT: CommonJS exports work with both require() and dynamic import()
module.exports = {
  getDb,
  initDb,
  saveDb,
  insertAssessment,
  getAllAssessments,
  getAssessmentCount,
  getDbPath
};
