import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceStrict, format } from "date-fns";
import { Anchor, Compass, Music, Image as ImageIcon, Sparkles, X } from "lucide-react";
import TridentButton from "./TridentButton.jsx";

const THEME_ACCENTS = {
  default: "from-amber-500/20 to-amber-900/10 border-amber-500/30",
  gold: "from-yellow-400/25 to-amber-600/15 border-yellow-400/40",
  scroll: "from-orange-400/20 to-amber-800/10 border-orange-400/30",
  davy_jones: "from-emerald-600/25 to-teal-900/20 border-emerald-500/40",
  alabasta: "from-amber-300/25 to-orange-700/15 border-amber-300/40",
  skypiea: "from-sky-400/25 to-indigo-900/15 border-sky-400/40"
};

function formatVoyage(sentAt, deliveredAt) {
  if (!sentAt || !deliveredAt) return "Traveled the Grand Line";
  try {
    return formatDistanceStrict(new Date(sentAt), new Date(deliveredAt));
  } catch {
    return "Traveled the Grand Line";
  }
}

export function PublicLetterCard({ letter }) {
  const [isOpen, setIsOpen] = useState(false);

  const themeClass = THEME_ACCENTS[letter.capsuleTheme] || THEME_ACCENTS.default;
  const voyageDuration = formatVoyage(letter.sentAt, letter.deliveredAt);
  const senderName = letter.senderInfo?.displayName || letter.senderInfo?.username || "Ghost of Jaya";
  const isAnonymous = letter.senderInfo?.isAnonymous || letter.visibility === "public_anonymous";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group relative rounded-2xl bg-gradient-to-br ${themeClass} bg-surface-card/90 border p-6 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-amber-400/50 flex flex-col justify-between`}
      >
        {/* Top bar: Author badge & Voyage badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-elevated/80 border border-white/10 flex items-center justify-center text-sm shadow-inner">
                {isAnonymous ? "🏴‍☠️" : "⚓"}
              </div>
              <div>
                <h4 className="text-sm font-bold text-sand font-display tracking-wide truncate max-w-[140px]">
                  {senderName}
                </h4>
                <p className="text-[10px] text-sand-dim uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-2.5 h-2.5 text-amber-400" />
                  {voyageDuration} voyage
                </p>
              </div>
            </div>

            <TridentButton letterId={letter._id} initialLikes={letter.likes || 0} />
          </div>

          {/* Letter Title */}
          <h3 className="text-lg font-bold text-sand-light font-display mb-2 group-hover:text-amber-300 transition-colors line-clamp-1">
            {letter.subject || "A Treasure From the Past"}
          </h3>

          {/* Body snippet */}
          <div
            className="prose prose-invert prose-sm text-sand/80 line-clamp-4 font-serif text-sm leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: letter.body }}
          />
        </div>

        {/* Bottom meta & action */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-sand-dim">
            {letter.song?.title && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/5 px-2 py-0.5 rounded-full" title={`Song: ${letter.song.title}`}>
                <Music className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[80px]">{letter.song.title}</span>
              </span>
            )}
            {letter.attachments?.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-white/5 px-2 py-0.5 rounded-full">
                <ImageIcon className="w-3 h-3 text-sky-400" />
                <span>{letter.attachments.length}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors underline-offset-4 hover:underline"
          >
            Read Scroll →
          </button>
        </div>
      </motion.div>

      {/* Full Modal Viewer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-abyss/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-card border border-amber-500/30 p-6 md:p-8 shadow-2xl bg-parchment-pattern text-sand"
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-sand transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="text-2xl">{isAnonymous ? "🏴‍☠️" : "⚓"}</div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-amber-300">
                    {letter.subject || "A Treasure From the Past"}
                  </h2>
                  <p className="text-xs text-sand-dim">
                    Penned by <span className="font-semibold text-sand">{senderName}</span> • Arrived ashore{" "}
                    {letter.deliveredAt ? format(new Date(letter.deliveredAt), "MMMM d, yyyy") : "Delivered"}
                  </p>
                </div>
              </div>

              {/* Rich Body Content */}
              <div
                className="prose prose-invert prose-lg max-w-none text-sand/90 font-serif leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: letter.body }}
              />

              {/* Attachments if any */}
              {letter.attachments?.length > 0 && (
                <div className="mb-6 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sand-dim mb-3 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Treasures Attached
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {letter.attachments.map((att, idx) => (
                      <img
                        key={idx}
                        src={att.secureUrl || att.url}
                        alt="Attached treasure"
                        className="rounded-xl border border-white/10 aspect-video object-cover hover:scale-105 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Modal footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-xs text-sand-dim flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Grand Line Public Archive</span>
                </div>
                <TridentButton letterId={letter._id} initialLikes={letter.likes || 0} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PublicLetterCard;
