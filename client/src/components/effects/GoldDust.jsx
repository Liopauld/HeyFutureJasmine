import { useMemo } from "react";
import { motion } from "framer-motion";
import { fxFor } from "../../lib/chestThemes.js";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Ambient motes drifting upward, tinted to the chest theme — gold dust by
 * default, rising bubbles for Davy Jones, swaying feathers for Skypiea, fine
 * sand for Alabasta.
 */
export default function GoldDust({ theme = "default", count = 16, className = "" }) {
  const { dust } = fxFor(theme);
  const variant = dust.variant;

  const motes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size:
          (variant === "feather" ? 5 : 2) +
          Math.random() * (variant === "bubble" ? 5 : 3),
        rise: 80 + Math.random() * 120,
        drift: (Math.random() - 0.5) * (variant === "sand" ? 90 : 40),
        spin: (Math.random() - 0.5) * 180,
        delay: Math.random() * 6,
        dur: 6 + Math.random() * 6
      })),
    [count, variant]
  );

  if (prefersReduced()) return null;

  const round = variant === "sand" ? "rounded-[1px]" : "rounded-full";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className={`absolute bottom-0 ${round}`}
          style={{
            left: `${m.left}%`,
            width: m.size,
            height: variant === "feather" ? m.size * 0.5 : m.size,
            background: variant === "bubble" ? "transparent" : dust.color,
            border: variant === "bubble" ? `1px solid ${dust.color}` : undefined
          }}
          initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: -m.rise,
            x: m.drift,
            opacity: [0, 0.85, 0],
            rotate: variant === "feather" ? m.spin : 0
          }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
