import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Copy, Check, Heart, Unlink } from "lucide-react";
import api from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useAuthStore } from "../store/authStore.js";
import {
  useUpdateProfile,
  useCreatePairInvite,
  useAcceptPairInvite,
  useUnpair
} from "../hooks/useUser.js";
import Field from "../components/ui/Field.jsx";
import { formatDate } from "../lib/dates.js";

const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

export default function Profile() {
  const { user, partner } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef(null);

  const updateProfile = useUpdateProfile();
  const createInvite = useCreatePairInvite();
  const acceptInvite = useAcceptPairInvite();
  const unpair = useUnpair();

  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    anniversary: toDateInput(user?.anniversary)
  });
  const [inviteCode, setInviteCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [copied, setCopied] = useState(false);

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

  const generateInvite = async () => {
    try {
      const code = await createInvite.mutateAsync();
      setInviteCode(code);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create an invite.");
    }
  };

  const acceptCode = async (e) => {
    e.preventDefault();
    try {
      const p = await acceptInvite.mutateAsync(enteredCode.trim());
      toast.success(`Paired with ${p.displayName || p.username}. Crew of two!`);
      setEnteredCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "That code didn't work.");
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUnpair = async () => {
    if (!window.confirm("Part ways with your partner on here?")) return;
    await unpair.mutateAsync();
    toast.success("Unpaired.");
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl text-gold">Wanted Poster</h1>

      {/* Poster */}
      <div className="wanted-poster rounded-3xl p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-ink/70">Wanted</p>
        <div className="relative mx-auto mt-3 h-28 w-28">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group h-28 w-28 overflow-hidden rounded-xl border-2 border-ink/20 bg-ink/5"
            aria-label="Change portrait"
          >
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-5xl text-ink/40">
                {(user?.displayName || user?.username || "?")[0].toUpperCase()}
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/60 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="h-3 w-3" /> Change
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
        </div>
        <h2 className="mt-3 font-display text-4xl text-ink">{user?.displayName || user?.username}</h2>
        <p className="mt-1 text-sm uppercase tracking-widest text-ink/60">{user?.pirateTitle}</p>
        <p className="mt-3 font-display text-2xl text-ink">฿{(user?.bounty || 0).toLocaleString()}</p>
        {user?.anniversary ? (
          <p className="mt-2 text-sm text-ink/60">Sailing together since {formatDate(user.anniversary)}</p>
        ) : null}
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
      <div className="space-y-4 rounded-3xl border border-grand-line bg-deep-sea/50 p-5">
        <h3 className="flex items-center gap-2 font-display text-xl text-gold">
          <Heart className="h-5 w-5" /> Your crew of two
        </h3>

        {partner ? (
          <div className="flex items-center justify-between rounded-2xl border border-grand-line bg-ocean/50 p-4">
            <div className="flex items-center gap-3">
              {partner.avatar?.url ? (
                <img src={partner.avatar.url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-grand-line font-display text-gold">
                  {(partner.displayName || partner.username || "?")[0].toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-text-primary">{partner.displayName || partner.username}</p>
                <p className="text-xs text-text-muted">Paired</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUnpair}
              className="flex items-center gap-1.5 rounded-full border border-grand-line px-3 py-1.5 text-sm text-text-muted transition hover:border-straw-red hover:text-straw-red"
            >
              <Unlink className="h-4 w-4" /> Unpair
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-grand-line bg-ocean/50 p-4">
              <p className="text-sm text-text-secondary">Invite your partner</p>
              {inviteCode ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-deep-sea px-3 py-2 text-center font-mono text-lg tracking-widest text-gold">
                      {inviteCode}
                    </code>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="rounded-lg border border-grand-line p-2 text-text-secondary hover:text-gold"
                      aria-label="Copy code"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    Share this code. They enter it to pair.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={generateInvite}
                  disabled={createInvite.isPending}
                  className="mt-3 w-full rounded-full border border-gold px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-ocean disabled:opacity-60"
                >
                  {createInvite.isPending ? "…" : "Generate invite code"}
                </button>
              )}
            </div>

            <form onSubmit={acceptCode} className="rounded-2xl border border-grand-line bg-ocean/50 p-4">
              <p className="text-sm text-text-secondary">Have a code?</p>
              <input
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="mt-3 w-full rounded-lg border border-grand-line bg-deep-sea px-3 py-2 text-center font-mono tracking-widest text-gold placeholder:text-text-muted focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={acceptInvite.isPending || !enteredCode}
                className="mt-3 w-full rounded-full bg-straw-red px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {acceptInvite.isPending ? "Pairing…" : "Pair up"}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
