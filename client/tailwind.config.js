/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "../shared/**/*.{js,jsx}"],
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
        serif: ["Crimson Pro", "Georgia", "serif"],
        ui: ["DM Sans", "system-ui", "sans-serif"]
      },
      maxWidth: {
        shell: "1180px"
      },
      borderRadius: {
        card: "16px",
        chest: "20px"
      },
      boxShadow: {
        glow: "0 0 24px rgba(245, 166, 35, 0.38)",
        "glow-lg": "0 0 48px rgba(245, 166, 35, 0.3)",
        gold: "0 4px 28px rgba(245, 166, 35, 0.45)",
        chest: "8px 18px 44px rgba(0, 0, 0, 0.5)",
        parchment: "4px 6px 20px rgba(0,0,0,.45), inset 0 0 60px rgba(160,110,30,.08)"
      },
      backgroundImage: {
        "map-texture": "url('/assets/map-texture.svg')",
        "gold-sheen":
          "linear-gradient(170deg, var(--color-gold-light) 0%, var(--color-gold) 45%, var(--color-gold-dark) 100%)"
      },
      keyframes: {
        wave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        bob: {
          "0%,100%": { transform: "translateY(0) rotate(-.5deg)" },
          "30%": { transform: "translateY(-9px) rotate(1deg)" },
          "70%": { transform: "translateY(5px) rotate(-1.5deg)" }
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" }
        },
        "pulse-dot": {
          "0%,100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".4", transform: "scale(.65)" }
        },
        "wax-pulse": {
          "0%,100%": { transform: "scale(1) translateY(0)" },
          "50%": { transform: "scale(1.04) translateY(-2px)" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "chest-open": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(-110deg)" }
        }
      },
      animation: {
        wave: "wave 12s linear infinite",
        "wave-slow": "wave 18s linear infinite",
        bob: "bob 4.5s ease-in-out infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        "pulse-dot": "pulse-dot 2.2s ease-in-out infinite",
        "wax-pulse": "wax-pulse 1.6s ease-in-out infinite",
        "fade-up": "fade-up .6s ease both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite"
      }
    }
  },
  plugins: []
};
