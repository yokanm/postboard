// tests/load/benchmark.mjs
//
// Quick autocannon benchmark — good for fast throughput checks before a deploy.
//
// Prerequisites:
//   npm install --save-dev autocannon
//
// Run:
//   node tests/load/benchmark.mjs
//   node tests/load/benchmark.mjs --url http://staging.yourapi.com

import autocannon from 'autocannon';

const BASE = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://localhost:3000';

// ── Helper ────────────────────────────────────────────────────────────────────

function run(label, opts) {
  return new Promise((resolve) => {
    const instance = autocannon(opts, (err, result) => {
      if (err) { console.error(`[${label}] Error:`, err.message); resolve(null); return; }

      const pass = result.latency.p99 < 1000 && result.errors === 0;
      const icon = pass ? '✅' : '❌';

      console.log(`\n${icon}  ${label}`);
      console.log(`   Requests/sec  : ${result.requests.average.toFixed(1)}`);
      console.log(`   Latency avg   : ${result.latency.average}ms`);
      console.log(`   Latency p95   : ${result.latency.p95}ms`);
      console.log(`   Latency p99   : ${result.latency.p99}ms`);
      console.log(`   Throughput    : ${(result.throughput.average / 1024).toFixed(1)} KB/s`);
      console.log(`   Errors        : ${result.errors}`);
      console.log(`   Non-2xx       : ${result.non2xx}`);
      resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: true });
  });
}

// ── Benchmarks ────────────────────────────────────────────────────────────────

(async () => {
  console.log(`\n🔥 Autocannon Benchmark Suite`);
  console.log(`   Target: ${BASE}`);
  console.log(`   Date:   ${new Date().toISOString()}\n`);
  console.log('─'.repeat(50));

  // 1. Health check — absolute baseline (no DB, no Redis)
  await run('GET /health  [baseline]', {
    url:         `${BASE}/health`,
    connections: 100,
    duration:    15,
    title:       'health',
  });

  // 2. Job listing — should hit Redis cache
  await run('GET /api/v1/job  [cached read]', {
    url:         `${BASE}/api/v1/job?limit=20`,
    connections: 100,
    duration:    15,
    title:       'job-list',
  });

  // 3. Login — hits DB + argon2 verification (CPU heavy, low concurrency)
  await run('POST /api/v1/auth/login  [argon2 + DB]', {
    url:         `${BASE}/api/v1/auth/login`,
    method:      'POST',
    headers:     { 'content-type': 'application/json' },
    body:        JSON.stringify({ email: 'user15@seed.test', password: 'Seed@Password1' }),
    connections: 10,    // low concurrency — argon2 is intentionally slow
    duration:    15,
    title:       'login',
  });

  // 4. API root
  await run('GET /api/v1  [no auth]', {
    url:         `${BASE}/api/v1`,
    connections: 200,
    duration:    10,
    title:       'api-root',
  });

  console.log('\n' + '─'.repeat(50));
  console.log('Benchmark complete.\n');
  process.exit(0);
})();
