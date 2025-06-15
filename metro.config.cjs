// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const {
  withLibsodiumResolver,
} = require("@burnt-labs/abstraxion-react-native/metro.libsodium");

const config = getDefaultConfig(__dirname);
config.resolver.unstable_enablePackageExports = false;
module.exports = withLibsodiumResolver(config);


// // metro.config.js
// import { getDefaultConfig } from "expo/metro-config/src/index.js"; // Updated path with .js
// import {
//   withLibsodiumResolver,
// } from "@burnt-labs/abstraxion-react-native/metro.libsodium.js"; // Updated path with .js

// const config = getDefaultConfig(__dirname);
// config.resolver.unstable_enablePackageExports = false;
// export default withLibsodiumResolver(config);