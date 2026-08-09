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
        // Sistema de cores do Medmento: ficha de estudo editorial (marfim +
        // tinta + granada), deliberadamente longe do azul/roxo genérico de SaaS.
        paper: {
          DEFAULT: "#FAF6EF",
          raised: "#FFFFFF",
        },
        ink: {
          DEFAULT: "#211C18",
          muted: "#726A60",
          faint: "#AFA595",
        },
        sand: {
          100: "#F1E9DB",
          200: "#E6DAC4",
          300: "#D6C6A8",
        },
        garnet: {
          50: "#FBEEEC",
          100: "#F0D3CE",
          400: "#A8464A",
          500: "#8C2F35",
          600: "#732329",
          700: "#591A1F",
        },
        sage: {
          50: "#EEF2EA",
          500: "#3F6B4E",
          600: "#345A41",
        },
        gold: {
          50: "#FBF3E1",
          500: "#A6812E",
          600: "#8A6A2B",
        },
        correct: "#3F6B4E",
        wrong: "#A6432B",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-xp": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" },
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
