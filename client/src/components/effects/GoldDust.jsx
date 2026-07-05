import { useMemo } from "react";
import { motion } from "framer-motion";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Ambient gold motes drifting upward — treasure dust in the air. */
export default function GoldDust({ count = 16, className = "" }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        rise: 80 + Math.random() * 120,
        drift: (Math.random() - 0.5) * 40,
        delay: Math.random() * 6,
        dur: 6 + Math.random() * 6
      })),
    [count]
  );

  if (prefersReduced()) return null;

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 rounded-full bg-gold-light"
          style={{ left: `${m.left}%`, width: m.size, height: m.size }}
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{ y: -m.rise, x: m.drift, opacity: [0, 0.85, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
