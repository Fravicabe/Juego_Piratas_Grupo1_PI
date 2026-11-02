import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wood: "#3b2a1a",
        gold: "#d4af37",
        parchment: "#f4e4bc",
        sea: "#1a3a5c",
      },
    },
  },
  plugins: [],
} satisfies Config;
