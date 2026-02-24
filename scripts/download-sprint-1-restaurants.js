/**
 * Download Sprint 1 Dataset — NYC Restaurant Inspections (DOHMH)
 *
 * Fetches a filtered sample from NYC Open Data:
 *   - Grades A, B, C only (excludes pre-inspection N/Z/P placeholders)
 *   - Inspections from 2023-01-01 onwards
 *   - 2,000 rows, ordered most recent first
 *   - 10 columns relevant to the Sprint 1 analysis
 *
 * Source: https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j
 * Full dataset: ~400K rows. This sample is for local dev + testing.
 * Students download the full dataset directly from NYC Open Data.
 *
 * Run: node scripts/download-sprint-1-restaurants.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// =========================================================
// TEACHING MOMENT: NYC Open Data Socrata API (SoQL)
// The $where, $select, $order params are SoQL — Socrata Query Language.
// It's similar to SQL. No API key needed for small requests.
// For production apps, register for an app token to raise rate limits.
// Docs: https://dev.socrata.com/docs/queries/
// =========================================================

const BASE = 'https://data.cityofnewyork.us/resource/43nn-pn8j.csv';

const url = new URL(BASE);
url.searchParams.set('$limit',  '2000');
url.searchParams.set('$where',  "grade in ('A','B','C') and inspection_date>='2023-01-01'");
url.searchParams.set('$select', 'camis,dba,boro,cuisine_description,inspection_date,critical_flag,score,grade,grade_date,inspection_type');
url.searchParams.set('$order',  'inspection_date desc');

const OUTPUT = path.join(__dirname, '..', 'data', 'sprint-1-restaurants-sample.csv');

console.log('Downloading NYC Restaurant Inspections sample...');
console.log('Source: NYC Open Data — DOHMH Restaurant Inspections');
console.log('Filter: Grade A/B/C, 2023-present, 2,000 rows\n');

https.get(url.toString(), (res) => {
  if (res.statusCode !== 200) {
    console.error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
    process.exit(1);
  }

  let raw = '';
  res.on('data', chunk => { raw += chunk; });

  res.on('end', () => {
    fs.writeFileSync(OUTPUT, raw);

    const lines   = raw.trim().split('\n');
    const header  = lines[0];
    const dataRows = lines.length - 1;
    const cols    = header.split(',').map(c => c.replace(/"/g, '').trim());

    console.log(`✓ Saved → data/sprint-1-restaurants-sample.csv`);
    console.log(`  Rows:    ${dataRows}`);
    console.log(`  Columns: ${cols.length} (${cols.join(', ')})\n`);

    // Quick distribution summary
    const boroughs = {};
    const grades   = {};

    // =========================================================
    // TEACHING MOMENT: Quoted CSV parsing
    // Some restaurant names contain commas ("BASKIN ROBBINS, INC").
    // A naive .split(',') breaks on these. We track whether we're
    // inside a quoted field and only split on unquoted commas.
    // =========================================================
    function parseCSVLine(line) {
      const fields = [];
      let cur = '', inQuotes = false;
      for (const ch of line) {
        if (ch === '"')              { inQuotes = !inQuotes; }
        else if (ch === ',' && !inQuotes) { fields.push(cur); cur = ''; }
        else                         { cur += ch; }
      }
      fields.push(cur);
      return fields;
    }

    lines.slice(1).forEach(line => {
      if (!line.trim()) return;
      const parts = parseCSVLine(line);
      const boro  = parts[2]?.trim();  // boro is column index 2
      const grade = parts[7]?.trim();  // grade is column index 7
      if (boro)  boroughs[boro]  = (boroughs[boro]  || 0) + 1;
      if (grade) grades[grade]   = (grades[grade]   || 0) + 1;
    });

    console.log('Borough distribution:');
    Object.entries(boroughs).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      const bar = '█'.repeat(Math.round(v / dataRows * 30));
      console.log(`  ${k.padEnd(14)} ${String(v).padStart(4)}  ${bar}`);
    });

    console.log('\nGrade distribution:');
    Object.entries(grades).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
      const pct = ((v / dataRows) * 100).toFixed(1);
      console.log(`  Grade ${k}:  ${String(v).padStart(4)} (${pct}%)`);
    });

    console.log('\nFull dataset download URL (for students):');
    console.log('  https://data.cityofnewyork.us/api/views/43nn-pn8j/rows.csv?accessType=DOWNLOAD');
  });

  res.on('error', err => {
    console.error('Stream error:', err.message);
    process.exit(1);
  });

}).on('error', err => {
  console.error('Request error:', err.message);
  process.exit(1);
});
