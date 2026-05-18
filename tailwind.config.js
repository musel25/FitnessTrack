/** @type {import('tailwindcss').Config} */
module.exports = {
  // Quais arquivos o Tailwind deve escanear pra detectar classes usadas.
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Paleta simples e consistente. Dá pra trocar depois.
        brand: {
          DEFAULT: "#0ea5e9", // sky-500
          dark: "#0369a1",
        },
        bg: {
          DEFAULT: "#0b0f14",
          card: "#151b22",
          input: "#1f2730",
        },
        text: {
          DEFAULT: "#f3f4f6",
          muted: "#9ca3af",
        },
        border: "#2a3441",
      },
    },
  },
  plugins: [],
};
