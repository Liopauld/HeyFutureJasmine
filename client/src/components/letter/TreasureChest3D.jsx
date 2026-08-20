import { motion } from "framer-motion";
import AnimatedChest from "./AnimatedChest.jsx";
import SparkBurst from "../effects/SparkBurst.jsx";
import GoldDust from "../effects/GoldDust.jsx";
import { Sparkles, KeyRound } from "lucide-react";

export function TreasureChest3D({
  theme = "default",
  phase = "closed", // "closed" | "unlocking" | "opened"
  onUnlock,
  disabled = false
}) {
  const isOpened = phase === "opened";
  const isUnlocking = phase === "unlocking";

  return (
    <div className="relative flex flex-col items-center justify-center perspective-1000 py-6">
      {/* Ambient background particles */}
      <GoldDust theme={theme} count={24} className="h-72 w-72" />

      {/* 3D Container */}
      <motion.div
        className="relative"
        initial={{ scale: 0.9, y: 15 }}
        animate={{
          scale: isUnlocking ? [1, 1.08, 1.03] : isOpened ? 1.05 : [1, 1.03, 1],
          y: isUnlocking ? [0, -10, -5] : isOpened ? 0 : [0, -6, 0]
        }}
        transition={{
          duration: isUnlocking ? 0.8 : 3.5,
          repeat: isUnlocking || isOpened ? 0 : Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Glow halo behind chest */}
        <div
          className={`absolute -inset-8 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
            isOpened
              ? "bg-amber-400/40 opacity-100"
              : isUnlocking
              ? "bg-amber-400/60 opacity-90 animate-pulse"
              : "bg-amber-400/20 opacity-60"
          }`}
        />

        {/* Chest SVG */}
        <AnimatedChest theme={theme} open={isOpened} size={230} />

        {/* Unlocking Key / Spark Sparks */}
        {isUnlocking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <SparkBurst active={true} />
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 1 }}
              animate={{ scale: [0, 1.4, 0], rotate: 180, opacity: [1, 1, 0] }}
              transition={{ duration: 0.8 }}
              className="text-amber-300 drop-shadow-[0_0_15px_rgba(245,166,35,0.8)]"
            >
              <KeyRound className="w-14 h-14" />
            </motion.div>
          </div>
        )}

        {/* Burst on open */}
        {isOpened && (
          <div className="absolute -top-6 inset-x-0 flex justify-center pointer-events-none">
            <SparkBurst active={true} />
          </div>
        )}
      </motion.div>

      {/* Unopened Call-To-Action Button */}
      {phase === "closed" && (
        <motion.button
          type="button"
          disabled={disabled}
          onClick={onUnlock}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-ocean-abyss font-display text-base font-bold tracking-wider shadow-[0_0_25px_rgba(245,166,35,0.4)] hover:shadow-[0_0_35px_rgba(245,166,35,0.7)] transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 text-ocean-abyss" />
          <span>Open Chest of Memories</span>
        </motion.button>
      )}
    </div>
  );
}

export default TreasureChest3D;
