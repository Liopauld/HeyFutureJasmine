import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenLine, Volume2, Sparkles, RotateCcw } from "lucide-react";
import { useLetter, useLetterByToken } from "../hooks/useLetters.js";
import TreasureChest3D from "../components/letter/TreasureChest3D.jsx";
import SongEmbed from "../components/letter/SongEmbed.jsx";
import GramophonePlayer from "../components/letter/GramophonePlayer.jsx";
import PhotoLightbox from "../components/letter/PhotoLightbox.jsx";
import LetterThreadCard from "../components/letter/LetterThreadCard.jsx";
import GoldDust from "../components/effects/GoldDust.jsx";
import GoldConfetti from "../components/effects/GoldConfetti.jsx";
import SparkBurst from "../components/effects/SparkBurst.jsx";
import LoadingCompass from "../components/common/LoadingCompass.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { timeAgo, formatDate } from "../lib/dates.js";
import { fxFor } from "../lib/chestThemes.js";
import { playChestOpenSound } from "../lib/soundEffects.js";

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function TreasureChest() {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("closed"); // closed → unlocking → opened → open
  const [showConfetti, setShowConfetti] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
    playChestOpenSound();
    if (reducedMotion()) {
      setShowConfetti(true);
      return setPhase("open");
    }
    setPhase("unlocking");
    setTimeout(() => {
      setPhase("opened");
      setShowConfetti(true);
      setTimeout(() => setPhase("open"), 1200);
    }, 800);
  };

  const replayCeremony = () => {
    setPhase("closed");
  };

  const writeBack = () =>
    navigate("/write", { state: { replyTo: letter._id, letterType: letter.letterType } });

  return (
    <div className="relative mx-auto max-w-2xl">
      <GoldDust theme={letter.capsuleTheme} count={phase === "open" ? 8 : 16} />
      <GoldConfetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div
            key="chest"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="relative flex flex-col items-center py-10 text-center"
          >
            <TreasureChest3D
              theme={letter.capsuleTheme}
              phase={phase}
              onUnlock={openChest}
              disabled={phase !== "closed"}
            />

            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-text-muted">
              A treasure has washed ashore
            </p>
            <h1 className="mt-2 font-display text-3xl text-gold sm:text-4xl">{letter.subject}</h1>
            <p className="mt-2 font-serif italic text-text-secondary">
              {fromLabel} · sealed {sealedAgo}
            </p>
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

              {letter.replyTo ? <LetterThreadCard replyTo={letter.replyTo} /> : null}

              <div className="letter-content" dangerouslySetInnerHTML={{ __html: letter.body }} />

              {voice ? (
                <div className="mt-6">
                  <GramophonePlayer voice={voice} />
                </div>
              ) : null}

              {photos.length ? (
                <div className="mt-6">
                  <p className="mb-2 text-xs font-display uppercase tracking-wider text-ink/70 font-bold">
                    📸 Captured Memories ({photos.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {photos.map((p, idx) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative h-28 sm:h-32 w-full overflow-hidden rounded-xl border border-amber-900/20 bg-ink/10 shadow hover:border-gold transition focus:outline-none"
                      >
                        <img
                          src={p.secureUrl}
                          alt={p.originalName || "a captured memory"}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold font-display">
                          <span>View Memory</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <PhotoLightbox
                    photos={photos}
                    currentIndex={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onIndexChange={setLightboxIndex}
                  />
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
              <div className="flex items-center gap-3">
                {token ? (
                  <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold text-sm">
                    <ArrowLeft className="h-4 w-4" /> Return to Shore
                  </Link>
                ) : (
                  <Link to="/log" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Our Log
                  </Link>
                )}
                <button
                  type="button"
                  onClick={replayCeremony}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-sand-dim hover:text-sand transition"
                  title="Replay 3D Unboxing Ceremony"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay Ceremony
                </button>
              </div>
              <button
                type="button"
                onClick={writeBack}
                className="inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-gold transition hover:bg-gold hover:text-ocean text-sm"
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
