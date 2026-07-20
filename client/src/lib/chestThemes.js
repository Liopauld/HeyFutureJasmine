/**
 * Per-theme reveal effects — the glow, light rays, burst particles, and ambient
 * dust each take on the identity of the chosen chest theme. Keyed to the same
 * theme keys as ChestThemePicker / AnimatedChest.
 *
 * burst.variant / dust.variant drive particle shape + motion:
 *   coin    — outward radial toss of coins & sparks (classic treasure)
 *   spark   — outward toss of small angular ink flecks
 *   sand    — fast, fine desert grains kicked outward
 *   bubble  — hollow rings drifting upward from the deep
 *   feather — soft plumes floating outward and settling on the wind
 */
export const THEME_FX = {
  default: {
    glow: "#ffc46b",
    ray: "#ffc46b",
    flare: "rgba(245, 166, 35, 0.6)",
    burst: { colors: ["#f5a623", "#ffc46b", "#ffe08a"], variant: "coin" },
    dust: { color: "#ffc46b", variant: "mote" }
  },
  gold: {
    glow: "#ffe08a",
    ray: "#ffe9a8",
    flare: "rgba(255, 200, 90, 0.68)",
    burst: { colors: ["#ffd700", "#ffe9a8", "#d4a017"], variant: "coin" },
    dust: { color: "#ffe08a", variant: "mote" }
  },
  scroll: {
    glow: "#e6d6a8",
    ray: "#d8c48a",
    flare: "rgba(200, 170, 110, 0.5)",
    burst: { colors: ["#cbb488", "#8a6a3a", "#efe2bc"], variant: "spark" },
    dust: { color: "#d8c48a", variant: "mote" }
  },
  davy_jones: {
    glow: "#5fd6c4",
    ray: "#4ab8a8",
    flare: "rgba(60, 190, 170, 0.5)",
    burst: { colors: ["#5fd6c4", "#8fe6d8", "#2c7a6e"], variant: "bubble" },
    dust: { color: "#7fd6c4", variant: "bubble" }
  },
  alabasta: {
    glow: "#f0c070",
    ray: "#e0a850",
    flare: "rgba(224, 168, 80, 0.55)",
    burst: { colors: ["#e0b060", "#d6a45a", "#c08a3e"], variant: "sand" },
    dust: { color: "#e0b878", variant: "sand" }
  },
  skypiea: {
    glow: "#eaf4ff",
    ray: "#cfe6ff",
    flare: "rgba(200, 225, 255, 0.5)",
    burst: { colors: ["#ffffff", "#cfe6ff", "#eaf4d6"], variant: "feather" },
    dust: { color: "#eaf4ff", variant: "feather" }
  }
};

export const fxFor = (theme) => THEME_FX[theme] || THEME_FX.default;
