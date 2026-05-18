// Metro é o bundler do React Native (equivalente ao webpack/vite no web).
// Aqui plugamos o NativeWind pra ele entender as classes Tailwind no JSX.
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
