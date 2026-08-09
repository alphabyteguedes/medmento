import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal do Medmento
        brand: {
          50: "#eef4ff",
          100: "#dbe6fe",
          400: "#5b8def",
          500: "#3866d6",
          600: "#2a4fb0",
          700: "#213e8c",
        },
        correct: "#16a34a",
        wrong: "#dc2626",
      },
      keyframes: {
        "pulse-xp": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "pulse-xp": "pulse-xp 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
