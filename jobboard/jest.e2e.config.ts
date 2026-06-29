// jest.e2e.config.ts  — FINAL VERSION
import type { Config } from 'jest';
import { config as loadDotenv } from 'dotenv';

// Load .env.test BEFORE anything else so DATABASE_URL_TEST is available
// to globalSetup (which runs in a separate Node process).
loadDotenv({ path: '.env.test', override: true });

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  rootDir:         '.',

  // Only match files inside __tests__/e2e/
  testMatch: ['**/__tests__/e2e/**/*.e2e.test.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  globalSetup:    '<rootDir>/src/__tests__/e2e/globalSetup.ts',
  globalTeardown: '<rootDir>/src/__tests__/e2e/globalTeardown.ts',

  // Per-file setup — provides cleanDb, registerAndLogin, etc.
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],

  // Inject env vars into each worker process
  testEnvironmentOptions: {
    env: {
      NODE_ENV:            'test',
      DATABASE_URL:        process.env['DATABASE_URL_TEST'] ?? process.env['DATABASE_URL'] ?? '',
      DATABASE_URL_TEST:   process.env['DATABASE_URL_TEST'] ?? '',
      REDIS_URL:           process.env['REDIS_URL'] ?? 'redis://localhost:6379',
      JWT_ACCESS_SECRET:   process.env['JWT_ACCESS_SECRET'] ?? 'test_access_secret_at_least_32_chars_aaa',
      JWT_REFRESH_SECRET:  process.env['JWT_REFRESH_SECRET'] ?? 'test_refresh_secret_at_least_32_chars_bbb',
      ACCESS_EXPIRES:      '15m',
      REFRESH_EXPIRES:     '7d',
      APP_URL:             'http://localhost:3000',
      LOG_LEVEL:           'error',
      EMAIL_FROM:          'no-reply@test.local',
    },
  },

  testTimeout:  30000,  // E2E tests are slower
  maxWorkers:   1,      // run serially — avoids DB race conditions
  clearMocks:   true,
  resetModules: false,
  collectCoverage: false,
};

export default config;
