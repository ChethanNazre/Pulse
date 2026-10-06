const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });
module.exports = createJestConfig({
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["testUtils.ts", "/node_modules/", "/e2e/", "/.next/"],
});
