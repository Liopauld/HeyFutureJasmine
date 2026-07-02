/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "../shared/**/*.{js,jsx}"] ,
  theme: {
    extend: {
      colors: {
        ocean: "var(--color-ocean)",
        "deep-sea": "var(--color-deep-sea)",
        "grand-line": "var(--color-grand-line)",
        gold: "var(--color-gold)",
        "gold-light": "var(--color-gold-light)",
        "gold-dark": "var(--color-gold-dark)",
        "straw-red": "var(--color-straw-red)",
        parchment: "var(--color-parchment)",
        "parchment-dark": "var(--color-parchment-dark)",
        ink: "var(--color-ink)",
        sealed: "var(--color-sealed)",
        sailing: "var(--color-sailing)",
        delivered: "var(--color-delivered)",
        failed: "var(--color-failed)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)"
      },
      fontFamily: {
        display: ["Pirata One", "cursive"],
        serif: ["Crimson Pro", "serif"],
        ui: ["DM Sans", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 24px rgba(245, 197, 24, 0.35)"
      }
    }
  },
  plugins: []
};
