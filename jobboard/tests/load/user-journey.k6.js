// tests/load/user-journey.k6.js
//
// Simulates a full candidate user journey:
//   1. Login
//   2. Browse jobs
//   3. View job detail
//   4. Check notifications
//   5. Mark notifications as read
//
// Run: k6 run tests/load/user-journey.k6.js

import http  from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate } from 'k6/metrics';

const authFailRate = new Rate('auth_failures');

// Load test users from seed — 35 candidates (user15..user49)
const USERS = new SharedArray('users', () =>
  Array.from({ length: 35 }, (_, i) => ({
    email:    `user${i + 15}@seed.test`,
    password: 'Seed@Password1',
  })),
);

export const options = {
  vus:      50,
  duration: '3m',
  thresholds: {
    'http_req_duration{name:login}':         ['p(95)<600'],
    'http_req_duration{name:job-list}':      ['p(95)<300'],
    'http_req_duration{name:job-detail}':    ['p(95)<300'],
    'http_req_duration{name:notifications}': ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
    auth_failures:   ['rate<0.02'],
  },
};

const BASE    = __ENV.BASE_URL || 'http://localhost:3000';
const HEADERS = { 'Content-Type': 'application/json' };

export default function () {
  // Pick a random seeded user
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  let token;

  // ── Step 1: Login ────────────────────────────────────────────────────────────
  group('login', () => {
    const r = http.post(
      `${BASE}/api/v1/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      { headers: HEADERS, tags: { name: 'login' } },
    );

    authFailRate.add(r.status !== 200);

    if (check(r, { 'login → 200': r => r.status === 200 })) {
      try { token = JSON.parse(r.body).accessToken; } catch { /* skip */ }
    }
  });

  if (!token) { sleep(1); return; }

  const authHeaders = { ...HEADERS, Authorization: `Bearer ${token}` };

  // ── Step 2: Browse jobs ──────────────────────────────────────────────────────
  let jobId;
  group('job-list', () => {
    const r = http.get(`${BASE}/api/v1/job?limit=20`, {
      headers: authHeaders,
      tags:    { name: 'job-list' },
    });

    if (check(r, { 'job-list → 200': r => r.status === 200 })) {
      try {
        const jobs = JSON.parse(r.body).data;
        if (jobs?.length) jobId = jobs[Math.floor(Math.random() * jobs.length)].id;
      } catch { /* skip */ }
    }
  });

  sleep(0.5);

  // ── Step 3: View job detail ──────────────────────────────────────────────────
  if (jobId) {
    group('job-detail', () => {
      const r = http.get(`${BASE}/api/v1/job/${jobId}`, {
        headers: authHeaders,
        tags:    { name: 'job-detail' },
      });
      check(r, { 'job-detail → 200': r => r.status === 200 });
    });
    sleep(0.5);
  }

  // ── Step 4: Check notifications ──────────────────────────────────────────────
  group('notifications', () => {
    const r = http.get(`${BASE}/api/v1/notifications/user?limit=10`, {
      headers: authHeaders,
      tags:    { name: 'notifications' },
    });
    check(r, { 'notifications → 200': r => r.status === 200 });

    // Also hit unread count
    const countRes = http.get(`${BASE}/api/v1/notifications/user/unread-count`, {
      headers: authHeaders,
      tags:    { name: 'notifications' },
    });
    check(countRes, { 'unread-count → 200': r => r.status === 200 });
  });

  sleep(1);

  // ── Step 5: Mark all notifications as read ───────────────────────────────────
  group('mark-read', () => {
    const r = http.patch(
      `${BASE}/api/v1/notifications/user/read`,
      JSON.stringify({}),
      { headers: authHeaders, tags: { name: 'mark-read' } },
    );
    check(r, { 'mark-read → 200': r => r.status === 200 });
  });

  sleep(2);
}
