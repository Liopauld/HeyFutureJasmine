import { Lock, Sparkles } from "lucide-react";
import { THEMES } from "./ChestThemePicker.jsx";

/** A themed treasure chest tile — locked while sailing, sparkling once delivered. */
export default function TreasureChest({ theme = "default", opened = false, size = 64, glow = false }) {
  const t = THEMES.find((x) => x.key === theme) || THEMES[0];
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.swatch} ${
        glow ? "shadow-glow ring-2 ring-gold/60" : "shadow-inner"
      }`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span style={{ fontSize: size * 0.42 }}>{t.emoji}</span>
      <span
        className={`absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full ${
          opened ? "bg-gold text-ocean" : "bg-deep-sea text-text-secondary"
        } shadow`}
      >
        {opened ? <Sparkles className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
      </span>
    </div>
  );
}
