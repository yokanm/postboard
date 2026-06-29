// tests/load/jobs.k6.js
//
// Load test for the public job listing endpoint — the highest-traffic route.
// This endpoint is Redis-cached, so p95 should be well under 200ms.
//
// Run: k6 run tests/load/jobs.k6.js
// Stress test: k6 run --vus 500 --duration 60s tests/load/jobs.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const cacheHits  = new Counter('cache_hints');   // proxy for fast responses
const listTrend  = new Trend('job_list_duration_ms');
const detailTrend = new Trend('job_detail_duration_ms');

export const options = {
  stages: [
    { duration: '30s', target: 50  },  // ramp up
    { duration: '2m',  target: 200 },  // sustained — typical peak
    { duration: '1m',  target: 500 },  // stress
    { duration: '30s', target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration:   ['p(95)<300'],   // cached reads should be fast
    http_req_failed:     ['rate<0.005'],  // <0.5% failure rate
    job_list_duration_ms: ['p(99)<800'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// Simulate different pages/filters to stress-test varied cache keys
const PAGES  = [1, 1, 1, 2, 3];         // weight page 1 higher (most real traffic)
const TYPES  = ['REMOTE', 'ONSITE', 'HYBRID', ''];
const LEVELS = ['JUNIOR', 'MID', 'SENIOR', ''];

export default function () {
  const page  = PAGES[Math.floor(Math.random() * PAGES.length)];
  const type  = TYPES[Math.floor(Math.random() * TYPES.length)];
  const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];

  const qs = new URLSearchParams({ page, limit: 20, ...(type && { locationType: type }), ...(level && { experienceLevel: level }) });

  // ── Job list ─────────────────────────────────────────────────────────────────
  const listRes = http.get(`${BASE}/api/v1/job?${qs}`, {
    tags: { name: 'job-list' },
  });

  listTrend.add(listRes.timings.duration);
  if (listRes.timings.duration < 50) cacheHits.add(1);  // sub-50ms → cache hit

  check(listRes, {
    'list → 200':         r => r.status === 200,
    'list → has data':    r => {
      try { return Array.isArray(JSON.parse(r.body).data); } catch { return false; }
    },
  });

  // ── Job detail (pick a random job from the list) ─────────────────────────────
  try {
    const jobs = JSON.parse(listRes.body).data;
    if (jobs && jobs.length > 0) {
      const job      = jobs[Math.floor(Math.random() * jobs.length)];
      const detailRes = http.get(`${BASE}/api/v1/job/${job.id}`, {
        tags: { name: 'job-detail' },
      });
      detailTrend.add(detailRes.timings.duration);
      check(detailRes, { 'detail → 200': r => r.status === 200 });
    }
  } catch {
    // ignore parse errors
  }

  sleep(0.5);
}
