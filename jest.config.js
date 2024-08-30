export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js', 
    '!src/**/*.test.js', 
  ],
  coverageDirectory: 'coverage', 
  coverageReporters: ['text', 'lcov'], 
};
