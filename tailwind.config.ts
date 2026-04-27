import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        forest: "#2C3E2D",
        "forest-muted": "#5A6A5A",
        fern: "#4A7C5F",
        amber: "#D47C2F",
        tan: "#A07848",
        "stone-bg": "#F5EFE6",
        cream: "#F0E8DC",
        night: "#1E2A20",
        border: "#E8DDD0",
        brand: {
          50: "#f0fdf4",
          500: "#22c55e",
          700: "#15803d"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"]
      },
      transitionDuration: {
        ui: "200ms"
      }
    }
  },
  plugins: []
};

export default config;
