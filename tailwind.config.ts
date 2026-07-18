import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EEF0F3",
        surface: "#FFFFFF",
        surface2: "#F5F6F9",
        ink: "#14161B",
        muted: "#6E7280",
        line: "#DFE2E8",
        live: "#1D3FD1",
        "live-ink": "#EAF0FF",
        soon: "#B8860B",
        "soon-ink": "#FBF3DF",
        danger: "#C22B1D",
        "danger-ink": "#FBEAE8",
        sold: "#9AA0AA",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        pulseRing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.1s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out infinite",
        rise: "rise 0.25s ease-out",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,27,0.04), 0 8px 20px -12px rgba(20,22,27,0.12)",
        ticket: "0 1px 2px rgba(20,22,27,0.05)",
      },
    },
  },
  plugins: [],
};
export default config;
