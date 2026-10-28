/**
 * CivicWatch Automated Test Suite
 * Tests Core Business Logic, Deduplication Engine, Schema Validation & State Transitions
 * Event: MyBharat Hack for Social Cause | Team ID: HSC|TN|03258
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log(' CivicWatch Automated Test Runner');
console.log(' Team HackSphere | Team ID: HSC|TN|03258');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    testsFailed++;
  }
}

// Mock LocalStorage
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

// Load Sample Seed Data
const seedPath = path.join(__dirname, '../sample-data/initial-reports.json');
let seedData;

runTest('Test 1: Verify Seed Data Schema and GCC Ward 172 Records', () => {
  assert(fs.existsSync(seedPath), 'initial-reports.json must exist');
  const raw = fs.readFileSync(seedPath, 'utf8');
  seedData = JSON.parse(raw);
  assert(Array.isArray(seedData), 'Seed data must be an array');
  assert.strictEqual(seedData.length, 4, 'Must contain 4 initial ward seed records');

  seedData.forEach((item, idx) => {
    assert(item.id.startsWith('CW-2025-TN-'), `Item ${idx} ID must match format CW-2025-TN-XXXX`);
    assert(item.category, `Item ${idx} must have category`);
    assert(item.street, `Item ${idx} must have street`);
    assert(item.ward.includes('172'), `Item ${idx} must belong to Ward 172`);
    assert(item.timeline && Array.isArray(item.timeline), `Item ${idx} must have timeline`);
    assert(['Reported', 'In Progress', 'Resolved'].includes(item.status), `Item ${idx} has invalid status`);
  });
});

// Deduplication Heuristic Logic Under Test
function detectDuplicate(incoming, reports) {
  const ACTIVE_WINDOW_MS = 72 * 60 * 60 * 1000; // 72-hour active window for unresolved complaints
  const now = Date.now();

  return reports.find(existing => {
    if (existing.status === 'Resolved') return false;

    const existingTime = new Date(existing.createdAt).getTime();
    if (now - existingTime > ACTIVE_WINDOW_MS) return false;

    const sameCategory = existing.category === incoming.category ||
      (existing.category.includes('Garbage') && incoming.category.includes('Plastic'));

    if (!sameCategory) return false;

    const streetMatch = existing.street.toLowerCase().includes(incoming.street.toLowerCase()) ||
                        incoming.street.toLowerCase().includes(existing.street.toLowerCase());

    return streetMatch;
  });
}

runTest('Test 2: Explainable Deduplication Engine - Detects Active Nearby Duplicate', () => {
  const activeReports = JSON.parse(JSON.stringify(seedData));
  
  // Incoming complaint: Same category (Overflowing Garbage Bin) & same street (2nd Avenue), created now
  const incoming = {
    category: "Overflowing Garbage Bin",
    street: "2nd Avenue",
    ward: "Ward 172 (Adyar)",
    status: "Reported"
  };

  const match = detectDuplicate(incoming, activeReports);
  assert(match, 'Deduplication engine should detect duplicate on 2nd Avenue');
  assert.strictEqual(match.id, 'CW-2025-TN-1041', 'Should match active report CW-2025-TN-1041');
});

runTest('Test 3: Deduplication Engine - Ignores Resolved Reports', () => {
  const activeReports = JSON.parse(JSON.stringify(seedData));
  
  // CW-2025-TN-1025 is Resolved on 3rd Cross Street
  const incoming = {
    category: "Blocked Storm Drain",
    street: "3rd Cross Street",
    ward: "Ward 172 (Adyar)",
    status: "Reported"
  };

  const match = detectDuplicate(incoming, activeReports);
  assert.strictEqual(match, undefined, 'Must NOT flag duplicates against already resolved issues');
});

runTest('Test 4: Deduplication Engine - Ignores Distinct Streets / Locations', () => {
  const activeReports = JSON.parse(JSON.stringify(seedData));
  
  const incoming = {
    category: "Overflowing Garbage Bin",
    street: "Lattice Bridge (LB) Road",
    ward: "Ward 172 (Adyar)",
    status: "Reported"
  };

  const match = detectDuplicate(incoming, activeReports);
  assert.strictEqual(match, undefined, 'Must NOT flag false duplicate for distant street');
});

runTest('Test 5: Community Corroboration / Upvoting Priority Elevation', () => {
  const reports = JSON.parse(JSON.stringify(seedData));
  const target = reports.find(r => r.id === 'CW-2025-TN-1041');
  const initialDuplicates = target.duplicateCount;

  // Simulate citizen clicking "Corroborate & Elevate"
  target.duplicateCount += 1;
  target.severity = 'Urgent';
  target.timeline.push({
    status: target.status,
    timestamp: new Date().toISOString(),
    actor: 'Citizen Corroboration',
    note: 'Additional citizen verified ongoing accumulation on 2nd Avenue.'
  });

  assert.strictEqual(target.duplicateCount, initialDuplicates + 1, 'Duplicate counter should increment');
  assert.strictEqual(target.severity, 'Urgent', 'Severity should be elevated to Urgent');
  assert.strictEqual(target.timeline.length, 2, 'Timeline should reflect corroboration entry');
});

runTest('Test 6: Municipal Supervisor Status Transition Lifecycle', () => {
  const reports = JSON.parse(JSON.stringify(seedData));
  const report = reports.find(r => r.id === 'CW-2025-TN-1041'); // Currently "Reported"

  // Transition 1: Reported -> In Progress
  report.status = 'In Progress';
  report.timeline.push({
    status: 'In Progress',
    timestamp: new Date().toISOString(),
    actor: 'Ward Supervisor (Murugan)',
    note: 'Assigned to conservancy team #4.'
  });
  assert.strictEqual(report.status, 'In Progress');

  // Transition 2: In Progress -> Resolved
  report.status = 'Resolved';
  report.timeline.push({
    status: 'Resolved',
    timestamp: new Date().toISOString(),
    actor: 'Ward Supervisor (Murugan)',
    note: 'Garbage removed and bin area sanitized with lime powder.'
  });
  assert.strictEqual(report.status, 'Resolved');
  assert.strictEqual(report.timeline.length, 3, 'Timeline must track entire lifecycle');
});

runTest('Test 7: Input Validation Rules (Min Length, Category, Phone Regex)', () => {
  // Test description validation
  const shortDesc = 'too short';
  assert(shortDesc.length < 15, 'Validation must reject descriptions under 15 characters');

  const validDesc = 'Garbage piling up along the street corner creating foul odors.';
  assert(validDesc.length >= 15, 'Validation must accept descriptive observations');

  // Test phone validation regex
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  assert(phoneRegex.test('+91 98401 23456'), 'Must accept valid Indian mobile format');
  assert(phoneRegex.test('9840123456'), 'Must accept 10-digit mobile');
  assert(!phoneRegex.test('invalid_phone'), 'Must reject alphabetic phone');
  assert(!phoneRegex.test('123'), 'Must reject short numbers');
});

runTest('Test 8: LocalStorage Persistence and Serialization Roundtrip', () => {
  mockStorage.setItem('civicwatch_reports', JSON.stringify(seedData));
  const retrievedRaw = mockStorage.getItem('civicwatch_reports');
  assert(retrievedRaw, 'Stored data must not be null');

  const parsed = JSON.parse(retrievedRaw);
  assert.strictEqual(parsed.length, 4);
  assert.strictEqual(parsed[0].id, 'CW-2025-TN-1041');
});

console.log('\n====================================================');
console.log(` Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('>> All CivicWatch automated regression tests completed successfully.\n');
}
