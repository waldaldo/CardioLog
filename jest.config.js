module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|react-native|@react-native|expo-sqlite|expo-notifications|expo-router|expo-modules-core|expo-print|expo-sharing|@react-navigation|react-native-svg|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-gesture-handler)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
};
