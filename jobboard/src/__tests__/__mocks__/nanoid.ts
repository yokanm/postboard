// src/__tests__/__mocks__/nanoid.ts
//
// nanoid v5+ is ESM-only and cannot be required() by Jest's CommonJS runtime.
// This thin shim replaces it via the `moduleNameMapper` in jest.config.ts.
//
// The shim produces predictable IDs in tests (counter-based) which also makes
// snapshot / assertion output stable across runs.

let _counter = 0;

export const nanoid = (size = 21): string => {
	_counter += 1;
	// Zero-pad to requested size so callers that check length still pass.
	return String(_counter).padStart(size, "0");
};

// Reset helper — call in afterEach if you need deterministic IDs per test.
export const _resetNanoidCounter = (): void => {
	_counter = 0;
};
