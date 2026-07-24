/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/setup/env.setup.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/modules/auth/**/*.ts",
    "!src/modules/auth/**/*.d.ts",
    "!src/modules/auth/index.ts",
  ],
  coverageDirectory: "<rootDir>/coverage",
  verbose: true,
};
