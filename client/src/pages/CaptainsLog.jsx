import { useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useLetters, useDeleteLetter } from "../hooks/useLetters.js";
import LetterCard from "../components/letter/LetterCard.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import LoadingCompass from "../components/common/LoadingCompass.jsx";

function Stat({ label, value }) {
  return (
    <div className="map-card rounded-2xl p-4 text-center">
      <p className="font-display text-2xl text-gold">{value}</p>
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
    </div>
  );
}

export default function CaptainsLog() {
  const { user, partner } = useAuth();
  const { data: letters = [], isLoading, isError } = useLetters();
  const del = useDeleteLetter();

  const { ashore, sailing } = useMemo(() => {
    const ashore = letters
      .filter((l) => l.status === "delivered")
      .sort((a, b) => new Date(b.deliveredAt || b.deliveryDate) - new Date(a.deliveredAt || a.deliveryDate));
    const sailing = letters
      .filter((l) => l.status !== "delivered")
      .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    return { ashore, sailing };
  }, [letters]);

  const handleDelete = async (letter) => {
    if (!window.confirm(`Send "${letter.subject}" to Davy Jones? This can't be undone.`)) return;
    try {
      await del.mutateAsync(letter._id);
      toast.success("Sent to the depths.");
    } catch (e) {
      toast.error(e.response?.data?.message || "The sea wouldn't take it.");
    }
  };

  if (isLoading) return <LoadingCompass full />;
  if (isError) {
    return (
      <EmptyState
        title="Taken by the sea…"
        description="We couldn't chart your log just now. Try again in a moment."
      />
    );
  }

  const cardProps = { userId: user?.id, email: user?.email, onDelete: handleDelete };

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-muted">{user?.pirateTitle}</p>
          <h1 className="font-display text-3xl text-gold sm:text-4xl">Our Log</h1>
        </div>
        <Link
          to="/write"
          className="flex items-center gap-2 rounded-full bg-straw-red px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          <PenLine className="h-4 w-4" />
          Write a Letter
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Sailing" value={sailing.length} />
        <Stat label="Ashore" value={ashore.length} />
        <Stat label="Bounty" value={`฿${(user?.bounty || 0).toLocaleString()}`} />
        <Stat label="Crew" value={partner ? partner.displayName || partner.username : "Solo"} />
      </div>

      {letters.length === 0 ? (
        <EmptyState
          title="Your log is empty, Captain."
          description="Set sail on your first adventure by sealing a treasure letter."
          action={
            <Link
              to="/write"
              className="inline-flex items-center gap-2 rounded-full border border-gold px-5 py-2 text-gold transition hover:bg-gold hover:text-ocean"
            >
              <PenLine className="h-4 w-4" /> Write your first letter
            </Link>
          }
        />
      ) : null}

      {ashore.length ? (
        <div>
          <h2 className="mb-3 font-display text-xl text-text-primary">Washed ashore</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ashore.map((l) => (
              <LetterCard key={l._id} letter={l} {...cardProps} />
            ))}
          </div>
        </div>
      ) : null}

      {sailing.length ? (
        <div>
          <h2 className="mb-3 font-display text-xl text-text-primary">Still sailing</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sailing.map((l) => (
              <LetterCard key={l._id} letter={l} {...cardProps} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
