module.exports = {
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['node_modules', '<rootDir>/dist'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
}
