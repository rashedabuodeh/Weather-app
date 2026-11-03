/**
 * Jest configuration for the Weather App (Expo SDK 58, Jest 30).
 * jest-expo supplies the React Native/Expo mocks and TypeScript transformation.
 */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/functions/'],
  collectCoverageFrom: [
    'src/services/weatherApi.ts',
    'src/services/geocoding.ts',
    'src/utils/forecast.ts',
    'src/hooks/useForecast.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
