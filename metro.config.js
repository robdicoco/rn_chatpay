// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = false;

// Add libsodium resolver manually
config.resolver.alias = {
  ...config.resolver.alias,
  'libsodium-wrappers': 'react-native-libsodium',
};

module.exports = config;