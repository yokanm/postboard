// tests/load/auth.k6.js
//
// Load test for authentication endpoints.
// Run: k6 run tests/load/auth.k6.js
// Run against staging: k6 run -e BASE_URL=https://staging.yourapi.com tests/load/auth.k6.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginErrorRate  = new Rate('login_error_rate');
const loginDuration   = new Trend('login_duration_ms');
const refreshDuration = new Trend('refresh_duration_ms');

export const options = {
  stages: [
    { duration: '30s', target: 10  },  // warm up
    { duration: '1m',  target: 50  },  // sustained load
    { duration: '30s', target: 100 },  // spike
    { duration: '30s', target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<600'],   // 95% of requests under 600ms
    http_req_failed:   ['rate<0.01'],   // <1% HTTP failures
    login_error_rate:  ['rate<0.01'],
    login_duration_ms: ['p(99)<1500'],  // p99 login under 1.5s
  },
};

const BASE    = __ENV.BASE_URL || 'http://localhost:3000';
const HEADERS = { 'Content-Type': 'application/json' };

export default function () {
  // ── Login ────────────────────────────────────────────────────────────────────
  const loginRes = http.post(
    `${BASE}/api/v1/auth/login`,
    JSON.stringify({ email: 'user15@seed.test', password: 'Seed@Password1' }),
    { headers: HEADERS, tags: { name: 'login' } },
  );

  loginErrorRate.add(loginRes.status !== 200);
  loginDuration.add(loginRes.timings.duration);

  const loginOk = check(loginRes, {
    'login → 200':          r => r.status === 200,
    'login → has token':    r => {
      try { return !!JSON.parse(r.body).accessToken; } catch { return false; }
    },
  });

  // ── Refresh token if login succeeded ────────────────────────────────────────
  if (loginOk) {
    try {
      const { refreshToken } = JSON.parse(loginRes.body);
      if (refreshToken) {
        const refreshRes = http.post(
          `${BASE}/api/v1/auth/refresh`,
          JSON.stringify({ refreshToken }),
          { headers: HEADERS, tags: { name: 'refresh' } },
        );
        refreshDuration.add(refreshRes.timings.duration);
        check(refreshRes, { 'refresh → 200': r => r.status === 200 });
      }
    } catch {
      // ignore parse errors
    }
  }

  sleep(1);
}
