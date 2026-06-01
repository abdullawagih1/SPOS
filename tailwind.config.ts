import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0e0d0c",
          2: "#4a4844",
          3: "#8a8782",
        },
        paper: {
          DEFAULT: "#faf9f7",
          2: "#f2f0ec",
          3: "#e8e5df",
        },
        accent: {
          DEFAULT: "#3d3aed",
          light: "#ededff",
          border: "#c0befc",
          hover: "#2d2acc",
        },
        teal: {
          DEFAULT: "#0a7e6a",
          light: "#e3f5f1",
          border: "#a0d9ce",
        },
        coral: {
          DEFAULT: "#c94428",
          light: "#faeee9",
        },
        amber: {
          DEFAULT: "#b86d0a",
          light: "#fdf2e3",
          border: "#f5d09b",
        },
        border: {
          DEFAULT: "rgba(14,13,12,0.1)",
          subtle: "rgba(14,13,12,0.06)",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        lg: "14px",
        xl: "20px",
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "stream": "stream 0.1s ease-out",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        stream: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
