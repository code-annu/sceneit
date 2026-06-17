/** @type {import('jest').Config} */


module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",

  collectCoverageFrom: ["src/**/*.ts", "!src/server.ts"],

  verbose: true,
  clearMocks: true,
};