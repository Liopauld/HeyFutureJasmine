import { useMemo } from "react";
import { motion } from "framer-motion";
import { fxFor } from "../../lib/chestThemes.js";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const pick = (arr, i) => arr[i % arr.length];

/**
 * A one-shot burst from the center whose particles take on the chest theme:
 * coins toss outward (default/gold), ink flecks scatter (scroll), sand grains
 * kick out (alabasta), bubbles drift up (davy_jones), feathers float (skypiea).
 * Fires on mount.
 */
export default function SparkBurst({ theme = "default", count = 20 }) {
  const { burst } = fxFor(theme);
  const variant = burst.variant;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        // Bubbles and feathers rise; coins/sparks/sand scatter radially.
        const upward = variant === "bubble" || variant === "feather";
        const dist =
          (variant === "sand" ? 110 : variant === "bubble" ? 70 : 90) +
          Math.random() * (variant === "sand" ? 150 : 120);
        const x = Math.cos(angle) * dist * (upward ? 0.55 : 1);
        const yBase = Math.sin(angle) * dist;
        return {
          x,
          y: upward ? -(90 + Math.random() * 130) : yBase - 40,
          size:
            variant === "sand"
              ? 2 + Math.random() * 3
              : variant === "feather"
                ? 6 + Math.random() * 8
                : 4 + Math.random() * 6,
          color: pick(burst.colors, i + (Math.random() > 0.5 ? 1 : 0)),
          spin: (Math.random() - 0.5) * 360,
          dur:
            (variant === "sand" ? 0.6 : variant === "feather" ? 1.4 : 0.8) +
            Math.random() * (variant === "feather" ? 0.9 : 0.5)
        };
      }),
    [count, variant, burst.colors]
  );

  if (prefersReduced()) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {particles.map((p, i) => {
        const round =
          variant === "spark" || variant === "sand" ? "rounded-[1px]" : "rounded-full";
        const hollow = variant === "bubble";
        return (
          <motion.span
            key={i}
            className={`absolute ${round}`}
            style={{
              width: p.size,
              height: variant === "feather" ? p.size * 0.5 : p.size,
              background: hollow ? "transparent" : p.color,
              border: hollow ? `1.5px solid ${p.color}` : undefined,
              boxShadow: hollow ? undefined : `0 0 ${p.size}px ${p.color}66`
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: hollow ? 0.4 : 1, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              scale: hollow ? 1 : 0.2,
              rotate: variant === "feather" ? p.spin : 0
            }}
            transition={{ duration: p.dur, ease: variant === "bubble" ? "easeInOut" : "easeOut" }}
          />
        );
      })}
    </div>
  );
}
