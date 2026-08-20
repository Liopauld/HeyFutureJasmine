import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine, Volume2 } from "lucide-react";
import { useLetter, useLetterByToken } from "../hooks/useLetters.js";
import AnimatedChest from "../components/letter/AnimatedChest.jsx";
import SongEmbed from "../components/letter/SongEmbed.jsx";
import GoldDust from "../components/effects/GoldDust.jsx";
import SparkBurst from "../components/effects/SparkBurst.jsx";
import LoadingCompass from "../components/common/LoadingCompass.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { timeAgo, formatDate } from "../lib/dates.js";
import { fxFor } from "../lib/chestThemes.js";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function TreasureChest() {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("closed"); // closed → opening → open

  const byId = useLetter(id);
  const byToken = useLetterByToken(token);
  const query = id ? byId : byToken;
  const letter = query.data;

  if (query.isLoading) return <LoadingCompass full label="Hauling the chest ashore…" />;

  if (query.isError) {
    const status = query.error?.response?.status;
    const message = query.error?.response?.data?.message;
    return (
      <EmptyState
        title={status === 423 ? "Still sealed" : status === 403 ? "Not your chest" : "Treasure not found"}
        description={message || "This treasure couldn't be opened."}
        action={
          <Link to="/log" className="inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Our Log
          </Link>
        }
      />
    );
  }

  // Neither an id nor a token in the URL: nothing to haul ashore.
  if (!letter) {
    return (
      <EmptyState
        title="Treasure not found"
        description="There's no chest at this heading."
        action={
          <Link to="/log" className="inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Our Log
          </Link>
        }
      />
    );
  }

  // Reached by URL before the tides delivered it — the body isn't sent at all.
  if (letter.sealed) {
    return (
      <EmptyState
        title="Still sealed"
        description={`This chest opens on ${formatDate(letter.deliveryDate)}.`}
        action={
          <Link to="/log" className="inline-flex items-center gap-2 text-gold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Our Log
          </Link>
        }
      />
    );
  }

  const isFromSelf = letter.letterType === "self";
  const senderName = letter.senderInfo?.displayName;
  const fromLabel = isFromSelf ? "from your past self" : senderName ? `from ${senderName}` : "from your crew";
  const sealedAgo = timeAgo(letter.sentAt || letter.createdAt);
  const photos = (letter.attachments || []).filter((a) => a.kind === "photo");
  const voice = (letter.attachments || []).find((a) => a.kind === "voice");
  const fx = fxFor(letter.capsuleTheme);

  const openChest = () => {
    if (reducedMotion()) return setPhase("open");
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1500);
  };

  const writeBack = () =>
    navigate("/write", { state: { replyTo: letter._id, letterType: letter.letterType } });

  return (
    <div className="relative mx-auto max-w-2xl">
      <GoldDust theme={letter.capsuleTheme} count={phase === "open" ? 8 : 16} />

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div
            key="chest"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="relative flex flex-col items-center py-10 text-center"
          >
            <motion.div
              animate={
                phase === "opening"
                  ? { x: [0, -6, 6, -5, 5, -3, 3, 0], rotate: [0, -2, 2, -1.5, 1.5, -1, 1, 0] }
                  : {}
              }
              transition={{ duration: 0.6 }}
              className={phase === "closed" ? "animate-float" : ""}
            >
              <AnimatedChest theme={letter.capsuleTheme} open={phase === "opening"} size={220} />
            </motion.div>
            {phase === "opening" ? <SparkBurst theme={letter.capsuleTheme} /> : null}

            <p className="mt-6 text-sm uppercase tracking-[0.2em] text-text-muted">
              A treasure has washed ashore
            </p>
            <h1 className="mt-2 font-display text-3xl text-gold sm:text-4xl">{letter.subject}</h1>
            <p className="mt-2 font-serif italic text-text-secondary">
              {fromLabel} · sealed {sealedAgo}
            </p>
            {phase === "closed" ? (
              <button
                type="button"
                onClick={openChest}
                className="wax-seal mt-8 animate-wax-pulse text-sm uppercase tracking-wider"
              >
                🔓 Open the chest
              </button>
            ) : null}
          </motion.div>
        ) : (
          <motion.div key="letter" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="parchment rounded-3xl p-6 sm:p-9">
              <div className="mb-5 border-b border-parchment-dark pb-4">
                <p className="text-xs uppercase tracking-wider text-ink/50">
                  Sealed {sealedAgo} · delivered {formatDate(letter.deliveredAt || letter.deliveryDate)}
                </p>
                <h1 className="mt-1 font-display text-3xl text-ink">{letter.subject}</h1>
                <p className="font-serif italic text-ink/60">{fromLabel}</p>
              </div>

              <div className="letter-content" dangerouslySetInnerHTML={{ __html: letter.body }} />

              {voice ? (
                <div className="mt-6">
                  <p className="mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider text-ink/50">
                    <Volume2 className="h-3.5 w-3.5" /> A voice from that day
                  </p>
                  <audio controls src={voice.secureUrl} className="w-full" />
                </div>
              ) : null}

              {photos.length ? (
                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {photos.map((p) => (
                    <a key={p._id} href={p.secureUrl} target="_blank" rel="noreferrer">
                      <img
                        src={p.secureUrl}
                        alt={p.originalName || "a captured memory"}
                        className="h-28 w-full rounded-lg object-cover shadow"
                      />
                    </a>
                  ))}
                </div>
              ) : null}

              {letter.song?.url ? (
                <div className="mt-6">
                  <SongEmbed song={letter.song} />
                </div>
              ) : null}

              {/* Guest CTA Banner */}
              {token ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-900/20 to-transparent p-5 text-center shadow-lg"
                >
                  <p className="font-display text-lg text-amber-300 mb-1">
                    ⚓ You've opened a Grand Line treasure capsule!
                  </p>
                  <p className="text-xs text-sand-dim mb-4">
                    Join HeyFutureJasmine! to seal your own letters, photos, and songs across time to yourself or your crew.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-ocean-abyss text-xs font-bold font-display tracking-wider transition-all"
                    >
                      Join the Crew (Free)
                    </Link>
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-full border border-white/20 hover:border-amber-400 text-sand text-xs font-medium transition-all"
                    >
                      Log In
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              {token ? (
                <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold">
                  <ArrowLeft className="h-4 w-4" /> Return to Shore
                </Link>
              ) : (
                <Link to="/log" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold">
                  <ArrowLeft className="h-4 w-4" /> Back to Our Log
                </Link>
              )}
              <button
                type="button"
                onClick={writeBack}
                className="inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-gold transition hover:bg-gold hover:text-ocean"
              >
                <PenLine className="h-4 w-4" /> Write back across time
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gold flare during the opening beat */}
      {phase === "opening" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{ duration: 1.2, times: [0, 0.35, 1] }}
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background: `radial-gradient(circle at center, ${fx.flare}, transparent 60%)`
          }}
        />
      ) : null}
    </div>
  );
}
