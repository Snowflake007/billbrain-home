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
        ink: "#0f172a",
        mist: "#f8fafc",
        card: "#ffffff",
        accent: "#2563eb",
        glow: "#0ea5e9",
        good: "#166534",
        watch: "#92400e",
        urgent: "#991b1b"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(14,165,233,0.22), transparent 30%), radial-gradient(circle at top right, rgba(37,99,235,0.18), transparent 24%)"
      }
    },
  },
  plugins: [],
};

export default config;
