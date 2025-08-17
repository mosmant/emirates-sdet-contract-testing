// Jest setup for Frontend Node.js test environment
const fetch = require('node-fetch');

// Make fetch globally available
global.fetch = fetch;

// Mock console methods to reduce test noise in CI/CD
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: console.warn,
    error: console.error,
  };
}

// Set test timeout
jest.setTimeout(30000); 