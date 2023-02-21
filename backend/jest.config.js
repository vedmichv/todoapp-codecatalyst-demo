module.exports = {
  coverageReporters: ['clover', "text"],
  setupFiles: ["<rootDir>/.jest/setEnvVars.js"],
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  reporters: [
    "default",     
    [ 'jest-junit', {
      outputDirectory: 'jest_reports',
      outputName: 'jest-junit.xml',
    } ]
  ]
};
