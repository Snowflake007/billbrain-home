import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azility-inspired professional palette
        "primary": "#0891b2", // Teal - primary energy color
        "primary-dark": "#0e7490",
        "primary-light": "#06b6d4",
        "secondary": "#1e40af", // Professional blue
        "bg-dark": "#0f172a", // Dark navy
        "bg-card": "#1a2847", // Card background
        "bg-light": "#f8fafc", // Light gray
        "text-primary": "#ffffff",
        "text-secondary": "#cbd5e1",
        "border": "#334155",
        "success": "#059669",
        "warning": "#d97706",
        "error": "#dc2626"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card": "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(6,182,212,0.15), transparent 30%), radial-gradient(circle at top right, rgba(8,145,178,0.12), transparent 24%)"
      }
    },
  },
  plugins: [],
};

export default config;
