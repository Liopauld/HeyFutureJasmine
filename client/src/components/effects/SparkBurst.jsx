import { useMemo } from "react";
import { motion } from "framer-motion";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** A one-shot burst of gold sparks + coins from the center (fires on mount). */
export default function SparkBurst({ count = 20 }) {
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 90 + Math.random() * 120;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40, // bias upward
          size: 4 + Math.random() * 6,
          coin: Math.random() > 0.6,
          dur: 0.8 + Math.random() * 0.5
        };
      }),
    [count]
  );

  if (prefersReduced()) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${s.coin ? "bg-gold" : "bg-gold-light"}`}
          style={{ width: s.size, height: s.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
          transition={{ duration: s.dur, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
