import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Sparkles, Flame, Clock, Search, Feather, Anchor } from "lucide-react";
import { usePublicLetters } from "../hooks/useLetters.js";
import PublicLetterCard from "../components/letter/PublicLetterCard.jsx";
import LoadingCompass from "../components/common/LoadingCompass.jsx";

const SORT_OPTIONS = [
  { id: "recent", label: "Recent Tides", icon: Clock },
  { id: "most_liked", label: "Most Celebrated", icon: Flame },
  { id: "long_journey", label: "Epic Voyages", icon: Compass }
];

export function Noticeboard() {
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");

  const { data: letters, isLoading, isError } = usePublicLetters(sort);

  const filteredLetters = (letters || []).filter((letter) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      letter.subject?.toLowerCase().includes(query) ||
      letter.body?.toLowerCase().includes(query) ||
      letter.senderInfo?.displayName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Grand Line Public Noticeboard
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-sand-light tracking-wide mb-3">
          Letters Washed Ashore
        </h1>
        <p className="text-sand-dim font-serif text-base md:text-lg leading-relaxed">
          Parchment scrolls that have journeyed across the tides of time and opened to inspire fellow voyagers across the seas.
        </p>

        {/* CTA to write a letter */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            to="/write"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-abyss font-bold font-display tracking-wider text-sm shadow-[0_0_20px_rgba(245,166,35,0.3)] transition-all hover:scale-105"
          >
            <Feather className="w-4 h-4" />
            Seal Your Own Letter
          </Link>
        </div>
      </motion.div>

      {/* Control bar: Search + Sort tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-surface-card/60 border border-white/10 rounded-2xl p-3 md:p-4 backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scrolls by keyword..."
            className="w-full bg-surface-elevated/70 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-sand placeholder:text-sand-dim/50 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        {/* Sort Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto p-1 bg-surface-elevated/80 rounded-xl border border-white/5">
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = sort === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSort(opt.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-amber-500 text-ocean-abyss shadow-md font-bold"
                    : "text-sand-dim hover:text-sand hover:bg-white/5"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-ocean-abyss" : "text-amber-400"}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Letters */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingCompass message="Scanning the horizon for washed ashore scrolls..." />
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-surface-card/50 rounded-3xl border border-rose-500/20 p-8">
          <p className="text-rose-300 font-semibold mb-2">The tides seem turbulent today.</p>
          <p className="text-sand-dim text-sm">Failed to load letters from the public noticeboard.</p>
        </div>
      ) : filteredLetters.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-surface-card/40 rounded-3xl border border-dashed border-white/10 p-8 max-w-md mx-auto"
        >
          <Anchor className="w-12 h-12 text-sand-dim/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold font-display text-sand mb-2">No Scrolls Found</h3>
          <p className="text-sand-dim text-sm font-serif mb-6">
            {search
              ? "No public letters match your search query."
              : "No letters have washed ashore on this tide yet. Be the first captain to seal a public treasure!"}
          </p>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 transition-all"
          >
            <Feather className="w-3.5 h-3.5" />
            Write a Public Letter
          </Link>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredLetters.map((letter) => (
            <PublicLetterCard key={letter._id} letter={letter} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default Noticeboard;
