const nextJest = require('next/jest');

// Transforms TS/TSX via Next's SWC (no Babel config needed) and wires the
// tsconfig path aliases (@/*). Without this, `jest` cannot parse TypeScript.
const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(config);
