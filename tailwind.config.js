/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/server/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f7f8",
        foreground: "#111111",

        surface: "#ffffff",
        surfaceSoft: "#f3f4f6",

        border: "#e5e7eb",

        muted: "#6b7280",

        primary: "#111111",
        primarySoft: "#1f2937",

        accent: "#6366f1",

        success: "#10b981",
        error: "#ef4444",
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },

      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.04)",
        medium: "0 6px 20px rgba(0,0,0,0.06)",
        strong: "0 10px 30px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};