export default {
  setupFiles: ['./tests/setup/dbTestUtils.js'],
  transform: {},
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
