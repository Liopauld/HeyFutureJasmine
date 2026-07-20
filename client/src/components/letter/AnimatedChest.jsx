import { motion } from "framer-motion";
import { fxFor } from "../../lib/chestThemes.js";

const WOOD = {
  default: { body: "#6b4423", lid: "#7d5230", band: "#c97a16", dark: "#4a2f18" },
  gold: { body: "#b8860b", lid: "#d4a017", band: "#8a5a0a", dark: "#8a5a0a" },
  scroll: { body: "#b89b6e", lid: "#cbb488", band: "#8a6a3a", dark: "#8a6a3a" },
  davy_jones: { body: "#22303a", lid: "#2c3e48", band: "#4a6b74", dark: "#141d24" },
  alabasta: { body: "#c08a3e", lid: "#d6a45a", band: "#8a5a1a", dark: "#8a5a1a" },
  skypiea: { body: "#cbb26a", lid: "#e0cd86", band: "#a88a3a", dark: "#a88a3a" }
};

/** A treasure chest whose lid lifts and whose insides glow when `open`. */
export default function AnimatedChest({ theme = "default", open = false, size = 200 }) {
  const w = WOOD[theme] || WOOD.default;
  const fx = fxFor(theme);

  return (
    <svg width={size} height={size * 0.95} viewBox="0 0 200 190" fill="none" aria-hidden="true">
      {/* Inner treasure glow (revealed as the lid opens) */}
      <motion.ellipse
        cx="100"
        cy="104"
        rx="66"
        ry="26"
        fill={fx.glow}
        initial={false}
        animate={{ opacity: open ? 0.9 : 0, scale: open ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
        style={{ transformBox: "fill-box", transformOrigin: "center", filter: "blur(6px)" }}
      />

      {/* Light rays bursting up when open */}
      <motion.g
        initial={false}
        animate={{ opacity: open ? 0.7 : 0 }}
        transition={{ duration: 0.5, delay: open ? 0.15 : 0 }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
      >
        {[-55, -30, 0, 30, 55].map((deg, i) => (
          <rect
            key={i}
            x="98"
            y="6"
            width="4"
            height="96"
            rx="2"
            fill={fx.ray}
            opacity={0.5}
            transform={`rotate(${deg} 100 104)`}
          />
        ))}
      </motion.g>

      {/* Chest body */}
      <g>
        <rect x="30" y="100" width="140" height="72" rx="12" fill={w.body} stroke={w.dark} strokeWidth="2" />
        <rect x="30" y="100" width="140" height="14" rx="7" fill={w.dark} opacity="0.35" />
        {[64, 100, 136].map((x) => (
          <line key={x} x1={x} y1="104" x2={x} y2="168" stroke={w.dark} strokeWidth="1.5" opacity="0.4" />
        ))}
        {/* metal band + lock */}
        <rect x="90" y="100" width="20" height="72" fill={w.band} opacity="0.9" />
        <circle cx="100" cy="140" r="9" fill={w.band} stroke={w.dark} strokeWidth="1.5" />
        <rect x="97" y="139" width="6" height="9" rx="1.5" fill={w.dark} />
      </g>

      {/* Lid — lifts and tilts open */}
      <motion.g
        initial={false}
        animate={{ rotate: open ? -22 : 0, y: open ? -10 : 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 12, delay: open ? 0.1 : 0 }}
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
      >
        <path
          d="M30 100 V86 A70 46 0 0 1 170 86 V100 Z"
          fill={w.lid}
          stroke={w.dark}
          strokeWidth="2"
        />
        <rect x="90" y="62" width="20" height="38" fill={w.band} opacity="0.9" />
        <path d="M34 96 A66 40 0 0 1 166 96" stroke={w.dark} strokeWidth="1.5" fill="none" opacity="0.4" />
      </motion.g>
    </svg>
  );
}
