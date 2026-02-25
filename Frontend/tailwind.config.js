/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "strahd-darker": "#0f0f1e",
        "strahd-dark": "#1a1a2e",
        "strahd-red": "#dc2626",
        "strahd-gold": "#fbbf24",
        "strahd-burgundy": "#7f1d1d",
        "strahd-purple": "#581c87",
        "strahd-blood": "#991b1b",
      },
      fontFamily: {
        gothic: ["Cinzel", "serif"],
        body: ["Crimson Text", "serif"],
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(220, 38, 38, 0.5)",
        "glow-gold": "0 0 20px rgba(251, 191, 36, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
