import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLikeLetter } from "../../hooks/useLetters.js";

const LIKED_KEY = "hfj_liked_letters";

function getLikedSet() {
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveLikedSet(set) {
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
  } catch {}
}

export function TridentButton({ letterId, initialLikes = 0 }) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isPulsing, setIsPulsing] = useState(false);

  const likeMutation = useLikeLetter();

  useEffect(() => {
    setLikes(initialLikes);
    setHasLiked(getLikedSet().has(letterId));
  }, [letterId, initialLikes]);

  const handleLike = (e) => {
    e.stopPropagation();
    if (hasLiked || likeMutation.isPending) return;

    // Optimistic update
    setLikes((prev) => prev + 1);
    setHasLiked(true);
    setIsPulsing(true);

    const set = getLikedSet();
    set.add(letterId);
    saveLikedSet(set);

    likeMutation.mutate(letterId, {
      onError: () => {
        // Rollback if failed
        setLikes((prev) => Math.max(0, prev - 1));
        setHasLiked(false);
        const rollbackSet = getLikedSet();
        rollbackSet.delete(letterId);
        saveLikedSet(rollbackSet);
      }
    });

    setTimeout(() => setIsPulsing(false), 600);
  };

  return (
    <motion.button
      type="button"
      onClick={handleLike}
      disabled={hasLiked || likeMutation.isPending}
      whileTap={{ scale: 0.92 }}
      title={hasLiked ? "You saluted this voyage with a Trident!" : "Salute with a Trident"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
        hasLiked
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,166,35,0.25)]"
          : "bg-surface-elevated/80 text-sand-dim hover:text-amber-300 hover:bg-amber-500/10 border-white/10 hover:border-amber-500/30"
      }`}
    >
      <motion.span
        animate={isPulsing ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="text-sm select-none"
      >
        🔱
      </motion.span>
      <span className="font-display font-bold tracking-wider">{likes}</span>
      <span className="sr-only">Trident Likes</span>
    </motion.button>
  );
}

export default TridentButton;
