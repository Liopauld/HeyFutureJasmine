import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Download, Share2, Loader2 } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useAuthStore } from "../store/authStore.js";
import { useUpdateProfile } from "../hooks/useUser.js";
import Field from "../components/ui/Field.jsx";
import PartnerPairCard from "../components/auth/PartnerPairCard.jsx";
import CrewManager from "../components/profile/CrewManager.jsx";
import { formatDate } from "../lib/dates.js";
import { downloadPoster, sharePoster } from "../lib/canvasPosterExport.js";

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export default function Profile() {
  const { user, partner } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef(null);

  const updateProfile = useUpdateProfile();
  const [isExporting, setIsExporting] = useState(false);

  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    anniversary: toDateInput(user?.anniversary)
  });

  const handleDownloadPoster = async () => {
    try {
      setIsExporting(true);
      await downloadPoster(user);
      toast.success("Bounty poster downloaded!");
    } catch {
      toast.error("Couldn't generate poster canvas.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePoster = async () => {
    try {
      setIsExporting(true);
      const shared = await sharePoster(user);
      if (shared) toast.success("Bounty poster shared!");
    } catch {
      toast.error("Couldn't share poster.");
    } finally {
      setIsExporting(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        displayName: form.displayName,
        anniversary: form.anniversary || null
      });
      toast.success("Log updated.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't update your log.");
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/users/me/avatar", fd);
      setUser({ ...user, avatar: data.avatar });
      toast.success("New portrait hung on the wall.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't upload that portrait.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl text-gold">Wanted Poster</h1>

      {/* Poster */}
      <div className="wanted-poster relative overflow-hidden rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-amber-900/30">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-ink/60 font-bold">Marine Headquarters</span>
          <span className="font-serif text-[10px] tracking-[0.3em] uppercase text-ink/60 font-bold">Grand Line Issue</span>
        </div>

        <p className="text-sm font-bold uppercase tracking-[0.5em] text-ink font-display text-2xl border-y-2 border-ink/20 py-1 my-2">
          DEAD OR ALIVE
        </p>

        <div className="relative mx-auto mt-4 h-32 w-32">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group h-32 w-32 overflow-hidden rounded-2xl border-4 border-ink/20 bg-ink/5 shadow-inner"
            aria-label="Change portrait"
          >
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-6xl text-ink/40">
                {(user?.displayName || user?.username || "?")[0].toUpperCase()}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/75 py-1.5 text-[11px] text-white font-medium opacity-0 transition group-hover:opacity-100">
              <Camera className="h-3.5 w-3.5" /> Change Portrait
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </div>

        <h2 className="mt-4 font-display text-4xl sm:text-5xl text-ink tracking-wide">
          {user?.displayName || user?.username}
        </h2>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ink/10 border border-ink/15 text-xs font-bold font-display uppercase tracking-widest text-ink mt-2">
          <span>🏴‍☠️</span>
          <span>{user?.pirateTitle || "Landlubber"}</span>
        </div>

        {/* Bounty */}
        <div className="mt-4 pt-3 border-t border-ink/15">
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink/60 font-semibold mb-1">Bounty Amount</p>
          <p className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-wider drop-shadow-sm">
            ฿{(user?.bounty || 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">Kono sakuhin wa fiction dethunode</p>
        </div>

        {user?.anniversary ? (
          <p className="mt-3 text-xs text-ink/70 font-serif italic">
            Sailing the Grand Line together since {formatDate(user.anniversary)}
          </p>
        ) : null}

        {/* Poster Actions */}
        <div className="mt-4 flex items-center justify-center gap-2 pt-3 border-t border-ink/15 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadPoster}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink/15 hover:bg-ink/25 text-ink text-xs font-display font-bold uppercase tracking-wider transition disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Download Poster (PNG)</span>
          </button>
          <button
            type="button"
            onClick={handleSharePoster}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink/15 hover:bg-ink/25 text-ink text-xs font-display font-bold uppercase tracking-wider transition disabled:opacity-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Pirate Rank Tier Guide */}
      <div className="rounded-3xl border border-grand-line bg-deep-sea/50 p-5 space-y-3">
        <h3 className="font-display text-lg text-gold flex items-center gap-2">
          <span>⚓</span> Pirate Rank Progression
        </h3>
        <p className="text-xs text-text-muted">
          Your bounty rises as you seal more time capsules across the Grand Line.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {[
            { rank: "Landlubber", letters: "0 letters", bounty: "฿0" },
            { rank: "Rookie Pirate", letters: "1-3 letters", bounty: "฿1,000,000" },
            { rank: "Sea Dog", letters: "4-10 letters", bounty: "฿50,000,000" },
            { rank: "Warlord of Letters", letters: "11-25 letters", bounty: "฿300,000,000" },
            { rank: "Yonko Scribe", letters: "26-50 letters", bounty: "฿1,000,000,000" },
            { rank: "Pirate King", letters: "51+ letters", bounty: "฿1,500,000,000" }
          ].map((tier, idx) => {
            const isCurrent = (user?.pirateTitle || "Landlubber") === tier.rank;
            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isCurrent
                    ? "bg-amber-500/20 border-amber-400 text-sand shadow-[0_0_12px_rgba(245,166,35,0.2)]"
                    : "bg-surface-elevated/40 border-white/5 text-sand-dim"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs font-display text-sand">{tier.rank}</span>
                  {isCurrent && <span className="text-[10px] font-bold text-amber-300">Active</span>}
                </div>
                <p className="text-[11px] text-amber-300/90 font-mono font-semibold">{tier.bounty}</p>
                <p className="text-[10px] text-sand-dim/60 mt-0.5">{tier.letters}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit */}
      <form onSubmit={saveProfile} className="space-y-4 rounded-3xl border border-grand-line bg-deep-sea/50 p-5">
        <h3 className="font-display text-xl text-gold">Edit your log</h3>
        <div className="parchment rounded-2xl p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            />
            <Field
              label="Anniversary"
              type="date"
              value={form.anniversary}
              onChange={(e) => setForm((f) => ({ ...f, anniversary: e.target.value }))}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-full bg-straw-red px-5 py-2.5 font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {updateProfile.isPending ? "Saving…" : "Save"}
        </button>
      </form>

      {/* Crew of two (pairing) */}
      <PartnerPairCard user={user} partner={partner} />

      {/* Crew logbook & Address Book */}
      <CrewManager />
    </section>
  );
}
