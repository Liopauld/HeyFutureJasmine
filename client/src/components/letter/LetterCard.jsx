import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowRight, Pencil, Eye, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TreasureChest from "./TreasureChest.jsx";
import GrandLineRoute from "./GrandLineRoute.jsx";
import { countdownLabel, progressBetween, daysBetween, formatDate } from "../../lib/dates.js";
import { useSuperPeek } from "../../hooks/useLetters.js";

export default function LetterCard({ letter, userId, email, onDelete }) {
  const [peekData, setPeekData] = useState(null);
  const isSender = String(letter.sender) === String(userId);
  const isRecipient = letter.recipientEmail?.toLowerCase() === String(email || "").toLowerCase();
  const delivered = letter.status === "delivered";
  const unopened = delivered && isRecipient && !letter.openedAt;
  const openingSoon = !delivered && daysBetween(Date.now(), letter.deliveryDate) <= 7;

  const superPeekMutation = useSuperPeek();

  const direction =
    letter.letterType === "self"
      ? "To your future self"
      : letter.letterType === "us"
        ? "Between you two"
        : letter.letterType === "other"
          ? `To ${letter.recipientName ? `${letter.recipientName} (${letter.recipientEmail})` : letter.recipientEmail}`
          : isSender
            ? `To ${letter.recipientName || "your partner"}`
            : `From ${letter.senderInfo?.displayName || "your crew"}`;

  // The sender can reopen or abandon a chest until 24h before it lands.
  const canModify =
    isSender && !delivered && new Date(letter.deliveryDate) - Date.now() > 24 * 60 * 60 * 1000;

  const handleSuperPeek = (e) => {
    e.preventDefault();
    e.stopPropagation();
    superPeekMutation.mutate(letter._id, {
      onSuccess: (data) => setPeekData(data)
    });
  };

  const Wrapper = delivered
    ? ({ children }) => (
        <Link to={`/treasure/${letter._id}`} className="block">
          {children}
        </Link>
      )
    : ({ children }) => <div>{children}</div>;

  return (
    <div className="relative">
      {unopened ? (
        <span className="absolute -right-2 -top-2 z-10 rounded-full bg-straw-red px-2 py-0.5 text-[11px] font-semibold text-white shadow">
          New treasure!
        </span>
      ) : null}
      <Wrapper>
        <article
          className={`group h-full rounded-2xl border p-4 transition ${
            delivered
              ? "cursor-pointer border-grand-line bg-deep-sea/60 hover:border-gold hover:shadow-glow"
              : "border-grand-line bg-deep-sea/40"
          }`}
        >
          <div className="flex items-start gap-3">
            <TreasureChest
              theme={letter.capsuleTheme}
              opened={delivered}
              glow={openingSoon || unopened}
              size={56}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-text-primary">{letter.subject}</p>
              <p className="text-xs text-text-muted">{direction}</p>
            </div>
          </div>

          <div className="mt-4">
            {delivered ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-delivered">Washed ashore</span>
                <span className="text-text-muted">
                  {formatDate(letter.deliveredAt || letter.deliveryDate)}
                </span>
              </div>
            ) : (
              <GrandLineRoute
                progress={progressBetween(letter.sentAt || letter.createdAt, letter.deliveryDate)}
                label={countdownLabel(letter.deliveryDate)}
              />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-grand-line/60 pt-3">
            {delivered ? (
              <span className="flex items-center gap-1 text-sm text-gold transition-all group-hover:gap-2">
                Open the chest <ArrowRight className="h-4 w-4" />
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-sealed">Sailing</span>
                {import.meta.env.DEV && (
                  <button
                    type="button"
                    onClick={handleSuperPeek}
                    disabled={superPeekMutation.isPending}
                    title="SuperPeek unredacted contents in dev mode"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] font-mono font-semibold border border-amber-500/30 transition-all"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    SuperPeek
                  </button>
                )}
              </div>
            )}
            {canModify ? (
              <div className="flex items-center gap-1">
                <Link
                  to={`/write/${letter._id}/edit`}
                  className="rounded-full p-1.5 text-text-muted transition hover:text-gold"
                  aria-label="Reopen this chest"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                {onDelete ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(letter);
                    }}
                    className="rounded-full p-1.5 text-text-muted transition hover:text-straw-red"
                    aria-label="Send to Davy Jones"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      </Wrapper>

      {/* SuperPeek Modal */}
      <AnimatePresence>
        {peekData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-abyss/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl bg-surface-card border border-amber-500/40 p-6 shadow-2xl text-sand"
            >
              <button
                type="button"
                onClick={() => setPeekData(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-sand"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Dev SuperPeek Inspector
                </span>
                <span className="text-xs text-sand-dim font-mono">Status: Sealed (DB intact)</span>
              </div>

              <h3 className="text-xl font-bold font-display text-amber-300 mb-1">
                {peekData.subject || "A Treasure From Your Past"}
              </h3>
              <p className="text-xs text-sand-dim mb-4">
                Destination: {formatDate(peekData.deliveryDate)} • Recipient: {peekData.recipientEmail}
              </p>

              <div
                className="p-4 rounded-xl bg-ocean-abyss/80 border border-white/10 prose prose-invert prose-sm max-w-none font-serif max-h-60 overflow-y-auto mb-4"
                dangerouslySetInnerHTML={{ __html: peekData.body }}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPeekData(null)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-abyss text-xs font-bold font-display"
                >
                  Close SuperPeek
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
