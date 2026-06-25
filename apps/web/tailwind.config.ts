import path from "path";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    path.join(__dirname, "./src/app/**/*.{ts,tsx}"),
    path.join(__dirname, "./src/components/**/*.{ts,tsx}"),
    path.join(__dirname, "./src/modules/**/*.{ts,tsx}"),
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
      },
      colors: {
        surface: {
          DEFAULT: "#f8fafc",
          elevated: "#f1f5f9",
        },
        accent: {
          DEFAULT: "#0891b2",
          strong: "#0e7490",
        },
        geo: {
          green: "#16a34a",
          orange: "#ea580c",
        },
        status: {
          success: "#16a34a",
          warning: "#d97706",
          danger: "#dc2626",
          info: "#0891b2",
        },
      },
    },
  },
  plugins: [],
};

export default config;
