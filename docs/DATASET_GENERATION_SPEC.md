# Dataset Generation Specification
## Synthetic Sprint Data Creation Guide

**Purpose:** Define how to generate realistic, controlled datasets for all 6 sprints.

**Principle:** Datasets must be complex enough to feel realistic, but simple enough that rubrics can validate answers deterministically.

---

## 1. Why Synthetic Data?

### 1.1 Advantages Over Real Datasets
| Concern | Real Data | Synthetic Data |
|---------|-----------|---------------|
| Licensing | Often restrictive | Fully owned, no legal issues |
| Privacy | May contain PII | No privacy concerns |
| Complexity | Uncontrolled — may have edge cases | Controllable — can design for learning |
| Business Alignment | Generic context | Custom scenarios that teach specific concepts |
| Rubric Validation | Answers may vary | Known ground truth exists |

### 1.2 Learning Pedagogy
Synthetic data lets us:
- **Control difficulty progression** (Sprint 1 simpler than Sprint 6)
- **Hide intentional patterns** students must discover (e.g., "Warehouse B causes 60% of delays")
- **Ensure rubric questions are answerable** (no "this dataset doesn't have that info" surprises)
- **Avoid red herrings** that distract from learning objectives

---

## 2. Dataset Design Principles

### 2.1 Realism Requirements
Each dataset must feel authentic:
- **Plausible numbers** (no revenue of $3.50 for a retail chain)
- **Consistent dimensions** (dates, locations, product IDs link correctly)
- **Natural variance** (not every value is a round number)
- **Seasonal patterns** where relevant (holiday sales spikes)
- **Noise** (not all data is relevant; some fields are distractors)

### 2.2 Hidden Patterns (Teaching Signals)
Every dataset must contain discoverable insights that match the rubric:

**Example (Sprint 1 — Late Deliveries):**
- **Pattern 1:** Warehouse B has 58% late delivery rate (vs. 12% for others)
- **Pattern 2:** Routes labeled "rural" have 3x the delays
- **Pattern 3:** Delays spike in December (holiday volume)

The rubric will check if students identified these exact patterns.

### 2.3 Rubric Alignment
Before generating a dataset:
1. Write the rubric questions first
2. Determine what the "correct" answers are
3. Design the dataset to support those answers
4. Validate: Can a junior analyst find the pattern with basic tools?

---

## 3. Sprint-Specific Specifications

### Sprint 1: Logistics Delay Analysis

**Business Context:** FastTrack Logistics loses $2.3M annually from late deliveries.

**Dataset File:** `data/sprint-1-logistics-delays.csv`

**Schema (5,000 rows):**
```
order_id,origin_warehouse,destination_city,promised_delivery_date,actual_delivery_date,carrier,package_weight,route_type,weather_conditions,delay_reason
```

**Field Specifications:**

| Field | Type | Values | Generation Logic |
|-------|------|--------|------------------|
| `order_id` | string | `ORD-00001` to `ORD-05000` | Sequential |
| `origin_warehouse` | string | `Warehouse A`, `B`, `C`, `D` | Weighted: A=30%, B=25%, C=25%, D=20% |
| `destination_city` | string | 50 US cities | Weighted by population |
| `promised_delivery_date` | date | Jan 1, 2025 – Dec 31, 2025 | Random, evenly distributed |
| `actual_delivery_date` | date | Same or later | See delay logic below |
| `carrier` | string | `FastShip`, `QuickMove`, `LogiPro` | Equal distribution |
| `package_weight` | number | 1–100 lbs | Normal distribution, mean=25 |
| `route_type` | string | `urban`, `suburban`, `rural` | 40%, 35%, 25% |
| `weather_conditions` | string | `clear`, `rain`, `snow` | 70%, 20%, 10% |
| `delay_reason` | string | `traffic`, `weather`, `processing`, `none` | See below |

**Delay Logic (THE TEACHING PATTERN):**
```python
# Pseudocode for delay probability
delay_chance = 0.12  # Base 12% late rate

if origin_warehouse == 'Warehouse B':
    delay_chance = 0.58  # Hidden pattern: Warehouse B is broken

if route_type == 'rural':
    delay_chance *= 3  # Rural routes have 3x delays

if month == 12:  # December
    delay_chance *= 1.5  # Holiday surge

if weather_conditions == 'snow':
    delay_chance *= 2  # Snow doubles delays

# Apply delay
is_late = random() < delay_chance
if is_late:
    days_late = random_int(1, 7)
    actual_delivery_date = promised_delivery_date + days_late
    delay_reason = weighted_choice(['traffic', 'weather', 'processing'], [40%, 35%, 25%])
else:
    actual_delivery_date = promised_delivery_date
    delay_reason = 'none'
```

**Expected Insights (Rubric Checks):**
1. Warehouse B has 58% late rate (other warehouses ~12%)
2. Rural routes have 3x higher delay frequency
3. December has the most delays (holiday volume)
4. Snow weather condition correlates with longer delays
5. Recommendation: Investigate Warehouse B operations

**Validation Script:**
```javascript
// scripts/validate-sprint-1.js
const data = parseCSV('data/sprint-1-logistics-delays.csv');

// Check 1: Warehouse B delay rate ~58%
const warehouseB = data.filter(r => r.origin_warehouse === 'Warehouse B');
const warehouseBLate = warehouseB.filter(r => r.delay_reason !== 'none');
const ratioB = warehouseBLate.length / warehouseB.length;
assert(ratioB > 0.55 && ratioB < 0.61, 'Warehouse B delay rate should be ~58%');

// Check 2: Rural routes have higher delay rate
const ruralDelayRate = calculateDelayRate(data, r => r.route_type === 'rural');
const urbanDelayRate = calculateDelayRate(data, r => r.route_type === 'urban');
assert(ruralDelayRate > urbanDelayRate * 2, 'Rural delays should be 3x urban');

// etc...
```

---

### Sprint 2: Retail Margin Analysis

**Business Context:** ShopRight retail chain, $450M revenue, 12% profit drop.

**Dataset File:** `data/sprint-2-retail-margins.csv`

**Schema (15,000 rows):**
```
transaction_id,store_id,region,product_category,product_name,units_sold,revenue,cost_of_goods,discount_applied,return_flag,sale_date
```

**Hidden Pattern (THE TEACHING SIGNAL):**
- **Electronics category** has negative margin after discounts
- **Midwest region** over-discounts (35% avg discount vs. 15% elsewhere)
- **Returns spike in January** (post-holiday buyer's remorse)
- **Store #42** is an outlier (high discount, low margin)

**Expected Insights:**
1. Electronics category is unprofitable (margin < 0% after discounts)
2. Midwest region needs discount policy adjustment
3. January returns eat 8% of Q4 profits
4. Store #42 requires management intervention

---

### Sprint 3: SaaS Churn Metrics (SQL Database)

**Business Context:** StreamFlow B2B SaaS, 12K subscribers, churn problem.

**Database Tables:**
- `users` (12,000 rows)
- `subscriptions` (18,000 rows — some users have multiple)
- `payments` (240,000 rows)
- `support_tickets` (85,000 rows)
- `feature_usage` (1.2M rows)

**Hidden Pattern:**
- Users with **< 3 logins/month** churn at 68% rate
- **Enterprise plan** has lowest churn (4% vs. 12% for Basic)
- **Support tickets > 5** correlate with 42% churn rate
- **Feature X** users churn 50% less

**SQL Challenges (Must Be Solvable with Queries):**
```sql
-- Question 1: What's the monthly churn rate?
SELECT 
  DATE_TRUNC('month', cancelled_at) AS month,
  COUNT(*) AS churned_users,
  (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
  COUNT(*) / (SELECT COUNT(*) FROM users WHERE status = 'active') AS churn_rate
FROM subscriptions
WHERE cancelled_at IS NOT NULL
GROUP BY month;
```

**This pattern must work.** Design data to support it.

---

### Sprint 4–6: Similar Approach

Each sprint follows the same pattern:
1. Define business scenario
2. Determine key insights rubric will check
3. Design data to support those insights
4. Generate CSV/SQL with hidden patterns
5. Write validation script
6. Test: Can a junior analyst find the pattern?

---

## 4. Generation Scripts

### 4.1 Script Template

**File:** `scripts/generate-sprint-[n]-data.js`

```javascript
const fs = require('fs');

// Configuration
const ROWS = 5000;
const OUTPUT_FILE = 'data/sprint-1-logistics-delays.csv';

// Helper: Random choice from array
function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Weighted random choice
function weightedChoice(items, weights) {
  const cumulative = weights.reduce((acc, w, i) => {
    acc.push((acc[i - 1] || 0) + w);
    return acc;
  }, []);
  const rand = Math.random() * cumulative[cumulative.length - 1];
  return items[cumulative.findIndex(c => rand < c)];
}

// Generate one row
function generateRow(index) {
  const orderId = `ORD-${String(index).padStart(5, '0')}`;
  const warehouse = weightedChoice(
    ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'],
    [0.30, 0.25, 0.25, 0.20]
  );
  
  // Apply delay logic here...
  
  return {
    order_id: orderId,
    origin_warehouse: warehouse,
    // ... other fields
  };
}

// Generate all rows
const rows = Array.from({ length: ROWS }, (_, i) => generateRow(i + 1));

// Convert to CSV
const headers = Object.keys(rows[0]).join(',');
const csv = [headers, ...rows.map(r => Object.values(r).join(','))].join('\n');

// Write to file
fs.writeFileSync(OUTPUT_FILE, csv);
console.log(`Generated ${ROWS} rows → ${OUTPUT_FILE}`);
```

### 4.2 Validation Script Template

**File:** `scripts/validate-sprint-[n]-data.js`

```javascript
const fs = require('fs');
const csv = require('csv-parse/sync');

const data = csv.parse(fs.readFileSync('data/sprint-1-logistics-delays.csv'), {
  columns: true,
  skip_empty_lines: true
});

console.log(`Loaded ${data.length} rows`);

// Validation 1: Warehouse B delay rate
const warehouseBRows = data.filter(r => r.origin_warehouse === 'Warehouse B');
const warehouseBLate = warehouseBRows.filter(r => r.delay_reason !== 'none');
const delayRate = warehouseBLate.length / warehouseBRows.length;

console.log(`Warehouse B delay rate: ${(delayRate * 100).toFixed(1)}% (target: 58%)`);
if (delayRate < 0.55 || delayRate > 0.61) {
  console.error('❌ Delay rate out of range!');
  process.exit(1);
}

console.log('✅ All validations passed');
```

---

## 5. Quality Checklist

Before adding a dataset to the repo:

- [ ] File size < 5MB (GitHub friendly)
- [ ] Hidden pattern exists and is discoverable
- [ ] Rubric questions are all answerable from the data
- [ ] No PII or real company data included
- [ ] Validation script passes
- [ ] At least 2 humans tested and found the pattern
- [ ] CSV is properly formatted (no broken quotes/newlines)
- [ ] Field names match the rubric exactly
- [ ] Data types are consistent (no "123" mixed with 123)
- [ ] No missing values unless intentional

---

## 6. Phase 2 Deliverable

For Phase 2 completion:
- [ ] Sprint 1 dataset generated and validated
- [ ] Sprint 2 dataset generated and validated
- [ ] Generation scripts checked into `scripts/`
- [ ] Validation scripts checked into `scripts/`
- [ ] Data files checked into `data/`
- [ ] TRD updated with dataset file paths

**Estimated Time:** 3-4 hours per sprint dataset (total: 6-8 hours for Sprints 1-2)

---

**Next:** Sprints 3-6 datasets deferred to Phase 4 after Sprint 1-2 are validated in production.
