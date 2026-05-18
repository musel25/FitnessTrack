// Babel configura o transpilador que converte JSX/TypeScript em JS rodável.
// `babel-preset-expo` traz as configurações padrões pro Expo + NativeWind.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
