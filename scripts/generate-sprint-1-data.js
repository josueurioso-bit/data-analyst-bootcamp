/**
 * Generate Sprint 1 Dataset — FastTrack Logistics Delivery Data
 *
 * Creates a 5,000-row CSV with embedded patterns that students must discover:
 *   1. QuickMove carrier: ~35% late rate (PRIMARY finding)
 *   2. Phoenix warehouse: ~28% late rate (SECONDARY finding)
 *   3. Snow: correlates with delays but NOT root cause
 *   4. Economy routes: NOT slower than Express (cost optimization opportunity)
 *
 * Run: node scripts/generate-sprint-1-data.js
 */

const fs = require('fs');
const path = require('path');

// --- Configuration ---

const TOTAL_ROWS = 5000;

const WAREHOUSES = ['Phoenix', 'Denver', 'Chicago', 'Atlanta'];
const CARRIERS = ['QuickMove', 'FastShip', 'LogiPro'];
const ROUTE_TYPES = ['Express', 'Economy'];
const DESTINATIONS = [
  'Los Angeles', 'New York', 'Houston', 'Miami', 'Seattle',
  'Dallas', 'Boston', 'San Francisco', 'Minneapolis', 'Nashville'
];
const WEATHER_CONDITIONS = ['Clear', 'Rain', 'Snow', 'Fog'];
const DELAY_REASONS = [
  'None', 'Carrier delay', 'Warehouse processing', 'Weather disruption',
  'Address issue', 'Customs hold', 'Vehicle breakdown', 'Sorting error'
];

// --- Helper Functions ---

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(options) {
  // options: [{ value, weight }, ...]
  const total = options.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * total;
  for (const opt of options) {
    r -= opt.weight;
    if (r <= 0) return opt.value;
  }
  return options[options.length - 1].value;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// --- Late-rate logic ---

/**
 * Determine if a delivery is late based on carrier + warehouse + weather.
 * This encodes the 4 patterns students must find.
 */
function isLate(carrier, warehouse, weather, routeType) {
  let lateProb = 0.12; // baseline: 12% late rate

  // Pattern 1: QuickMove is terrible (~35% overall late rate)
  if (carrier === 'QuickMove') {
    lateProb = 0.32;
  } else if (carrier === 'FastShip') {
    lateProb = 0.10;
  } else if (carrier === 'LogiPro') {
    lateProb = 0.08;
  }

  // Pattern 2: Phoenix warehouse adds delay (~28% overall)
  if (warehouse === 'Phoenix') {
    lateProb += 0.12;
  }

  // Pattern 3: Snow correlates (because QuickMove handles more snow routes)
  // but does NOT independently cause delays — only small bump
  if (weather === 'Snow') {
    lateProb += 0.03;
  }

  // Pattern 4: Economy routes are NOT slower — no penalty
  // (Students might assume Economy = slower, but data shows equal performance)

  // Cap probability
  lateProb = Math.min(lateProb, 0.65);

  return Math.random() < lateProb;
}

// --- Generate Rows ---

function generateRows() {
  const rows = [];
  // Date range: 2025-01-01 to 2025-12-31
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2025, 11, 31);
  const daySpan = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 1; i <= TOTAL_ROWS; i++) {
    const orderDate = addDays(startDate, random(0, daySpan));
    const month = orderDate.getMonth(); // 0-11

    const warehouse = pick(WAREHOUSES);
    const destination = pick(DESTINATIONS);
    const routeType = pick(ROUTE_TYPES);
    const packageWeight = (Math.random() * 49 + 1).toFixed(1); // 1.0 - 50.0 lbs

    // Carrier distribution: QuickMove gets more volume (pattern amplifier)
    const carrier = weightedPick([
      { value: 'QuickMove', weight: 40 },
      { value: 'FastShip', weight: 35 },
      { value: 'LogiPro', weight: 25 }
    ]);

    // Weather: Snow more likely in winter months (Nov-Mar) and for Denver/Chicago
    let weatherWeights;
    const isWinterMonth = month <= 2 || month >= 10;
    const isColdCity = warehouse === 'Denver' || warehouse === 'Chicago';

    if (isWinterMonth && isColdCity) {
      weatherWeights = [
        { value: 'Clear', weight: 30 },
        { value: 'Rain', weight: 15 },
        { value: 'Snow', weight: 45 },
        { value: 'Fog', weight: 10 }
      ];
    } else if (isWinterMonth) {
      weatherWeights = [
        { value: 'Clear', weight: 45 },
        { value: 'Rain', weight: 20 },
        { value: 'Snow', weight: 25 },
        { value: 'Fog', weight: 10 }
      ];
    } else {
      weatherWeights = [
        { value: 'Clear', weight: 60 },
        { value: 'Rain', weight: 25 },
        { value: 'Snow', weight: 3 },
        { value: 'Fog', weight: 12 }
      ];
    }

    const weather = weightedPick(weatherWeights);

    // Promise: 3-7 days from order
    const promiseDays = random(3, 7);
    const promisedDate = addDays(orderDate, promiseDays);

    // Determine if late
    const late = isLate(carrier, warehouse, weather, routeType);

    let actualDate;
    let delayReason;

    if (late) {
      // Late by 1-5 days
      const lateDays = random(1, 5);
      actualDate = addDays(promisedDate, lateDays);

      // Assign delay reason (weighted toward carrier/warehouse causes)
      if (carrier === 'QuickMove') {
        delayReason = weightedPick([
          { value: 'Carrier delay', weight: 50 },
          { value: 'Vehicle breakdown', weight: 20 },
          { value: 'Sorting error', weight: 15 },
          { value: 'Weather disruption', weight: 10 },
          { value: 'Address issue', weight: 5 }
        ]);
      } else if (warehouse === 'Phoenix') {
        delayReason = weightedPick([
          { value: 'Warehouse processing', weight: 45 },
          { value: 'Sorting error', weight: 25 },
          { value: 'Carrier delay', weight: 15 },
          { value: 'Weather disruption', weight: 10 },
          { value: 'Address issue', weight: 5 }
        ]);
      } else {
        delayReason = weightedPick([
          { value: 'Weather disruption', weight: 25 },
          { value: 'Carrier delay', weight: 25 },
          { value: 'Address issue', weight: 20 },
          { value: 'Warehouse processing', weight: 15 },
          { value: 'Vehicle breakdown', weight: 10 },
          { value: 'Customs hold', weight: 5 }
        ]);
      }
    } else {
      // On time or early: deliver 0-1 days before promise
      const earlyDays = random(0, 1);
      actualDate = addDays(promisedDate, -earlyDays);
      delayReason = 'None';
    }

    rows.push({
      order_id: `FTL-${String(i).padStart(5, '0')}`,
      order_date: formatDate(orderDate),
      origin_warehouse: warehouse,
      destination_city: destination,
      carrier,
      route_type: routeType,
      package_weight_lbs: packageWeight,
      promised_delivery_date: formatDate(promisedDate),
      actual_delivery_date: formatDate(actualDate),
      weather_conditions: weather,
      delay_reason: delayReason
    });
  }

  return rows;
}

// --- Write CSV ---

function writeCSV(rows) {
  const headers = Object.keys(rows[0]);
  const csvLines = [headers.join(',')];

  for (const row of rows) {
    csvLines.push(headers.map(h => row[h]).join(','));
  }

  const outputDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'sprint-1-deliveries.csv');
  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
  return outputPath;
}

// --- Verify Patterns ---

function verifyPatterns(rows) {
  console.log('\n=== Pattern Verification ===\n');

  // Overall late rate
  const totalLate = rows.filter(r => r.delay_reason !== 'None').length;
  console.log(`Total rows: ${rows.length}`);
  console.log(`Overall late rate: ${(totalLate / rows.length * 100).toFixed(1)}%\n`);

  // Pattern 1: Late rate by carrier
  console.log('--- Carrier Late Rates ---');
  for (const carrier of CARRIERS) {
    const carrierRows = rows.filter(r => r.carrier === carrier);
    const late = carrierRows.filter(r => r.delay_reason !== 'None').length;
    console.log(`  ${carrier}: ${(late / carrierRows.length * 100).toFixed(1)}% late (${late}/${carrierRows.length})`);
  }

  // Pattern 2: Late rate by warehouse
  console.log('\n--- Warehouse Late Rates ---');
  for (const wh of WAREHOUSES) {
    const whRows = rows.filter(r => r.origin_warehouse === wh);
    const late = whRows.filter(r => r.delay_reason !== 'None').length;
    console.log(`  ${wh}: ${(late / whRows.length * 100).toFixed(1)}% late (${late}/${whRows.length})`);
  }

  // Pattern 3: Late rate by weather
  console.log('\n--- Weather Late Rates ---');
  for (const w of WEATHER_CONDITIONS) {
    const wRows = rows.filter(r => r.weather_conditions === w);
    const late = wRows.filter(r => r.delay_reason !== 'None').length;
    if (wRows.length > 0) {
      console.log(`  ${w}: ${(late / wRows.length * 100).toFixed(1)}% late (${late}/${wRows.length})`);
    }
  }

  // Pattern 4: Late rate by route type
  console.log('\n--- Route Type Late Rates ---');
  for (const rt of ROUTE_TYPES) {
    const rtRows = rows.filter(r => r.route_type === rt);
    const late = rtRows.filter(r => r.delay_reason !== 'None').length;
    console.log(`  ${rt}: ${(late / rtRows.length * 100).toFixed(1)}% late (${late}/${rtRows.length})`);
  }

  console.log('\n=== Expected Findings ===');
  console.log('1. QuickMove should be ~35% late (PRIMARY)');
  console.log('2. Phoenix should be ~28% late (SECONDARY)');
  console.log('3. Snow correlates but is NOT root cause');
  console.log('4. Economy and Express should have similar late rates');
  console.log('');
}

// --- Main ---

const rows = generateRows();
const outputPath = writeCSV(rows);
console.log(`CSV written to: ${outputPath}`);
verifyPatterns(rows);
