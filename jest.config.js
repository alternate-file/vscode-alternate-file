module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",

  clearMocks: true,

  coverageDirectory: "coverage",

  coveragePathIgnorePatterns: ["/node_modules/", "/src/test/"],

  testMatch: ["**/src/**/*.test.ts"],

  testPathIgnorePatterns: ["/node_modules/", "/src/test/"]
};
