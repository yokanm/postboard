// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  rootDir:         '.',

  // Unit + integration tests ONLY — excludes E2E
  testMatch: ['**/__tests__/**/*.test.ts', '!**/__tests__/e2e/**'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // ── ESM-only packages: redirect to the CJS shim ──────────────────────────
    // nanoid v5+ ships only ESM. Jest runs CommonJS, so we provide a tiny shim.
    '^nanoid$': '<rootDir>/src/__tests__/__mocks__/nanoid.ts',
  },

  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],

  // Tell ts-jest NOT to transform node_modules (default), but DO transform
  // any ESM-only packages that slip through (belt-and-suspenders alongside
  // the moduleNameMapper shim above).
  transformIgnorePatterns: [
    '/node_modules/(?!(nanoid)/)',
  ],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        noEmit: true,
        module: 'CommonJS',
        moduleResolution: 'node',
        allowImportingTsExtensions: false,
      },
    }],
  },

  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/workers/**',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default config;