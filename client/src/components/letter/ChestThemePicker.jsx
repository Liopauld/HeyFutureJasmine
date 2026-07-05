const THEMES = [
  { key: "default", label: "Classic Oak", emoji: "🪵", swatch: "from-amber-900 to-yellow-950" },
  { key: "gold", label: "Golden", emoji: "🏆", swatch: "from-yellow-400 to-amber-600" },
  { key: "scroll", label: "Ancient Scroll", emoji: "📜", swatch: "from-stone-300 to-amber-200" },
  { key: "davy_jones", label: "Davy Jones", emoji: "💀", swatch: "from-slate-800 to-cyan-950" },
  { key: "alabasta", label: "Alabasta", emoji: "🏜️", swatch: "from-orange-300 to-amber-700" },
  { key: "skypiea", label: "Skypiea", emoji: "☁️", swatch: "from-sky-200 to-yellow-300" }
];

export default function ChestThemePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {THEMES.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
              active ? "border-gold bg-gold/10" : "border-grand-line hover:border-gold/50"
            }`}
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${t.swatch} text-lg shadow-inner`}
            >
              {t.emoji}
            </span>
            <span className={`text-sm ${active ? "text-gold" : "text-text-secondary"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { THEMES };
