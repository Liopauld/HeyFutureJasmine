import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Heart, Copy, Check, Unlink, Sparkles, UserRound, ArrowRight } from "lucide-react";
import CodeInput from "../ui/CodeInput.jsx";
import {
  useCreatePairInvite,
  useAcceptPairInvite,
  useUnpair
} from "../../hooks/useUser.js";
import { formatDate } from "../../lib/dates.js";

export function PartnerPairCard({ user, partner }) {
  const createInvite = useCreatePairInvite();
  const acceptInvite = useAcceptPairInvite();
  const unpair = useUnpair();

  const [inviteCode, setInviteCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [copied, setCopied] = useState(false);

  const generateInvite = async () => {
    try {
      const code = await createInvite.mutateAsync();
      setInviteCode(code);
      toast.success("Pairing code charted! Share it with your nakama.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create an invite.");
    }
  };

  const acceptCode = async (e) => {
    e.preventDefault();
    if (!enteredCode.trim()) return;
    try {
      const p = await acceptInvite.mutateAsync(enteredCode.trim().toUpperCase());
      toast.success(`⚓ Paired with ${p.displayName || p.username}! A crew of two!`);
      setEnteredCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "That pairing code didn't work.");
    }
  };

  const copyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard?.writeText(inviteCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnpair = async () => {
    if (!window.confirm("Part ways with your partner on here? Sealed letters will remain safe.")) return;
    try {
      await unpair.mutateAsync();
      toast.success("Unpaired from your crew of two.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't unpair.");
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-grand-line bg-deep-sea/50 p-6 shadow-xl text-sand">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-straw-red fill-straw-red" />
          <h3 className="font-display text-xl text-gold">Your Crew of Two</h3>
        </div>
        {partner ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-display">
            <Sparkles className="w-3 h-3" /> Paired
          </span>
        ) : (
          <span className="text-xs text-sand-dim font-mono">Solo Voyager</span>
        )}
      </div>

      {partner ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-ocean-abyss/80 border border-amber-500/30">
            <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-gold/40 bg-ink/20 flex items-center justify-center">
              {partner.avatar?.url ? (
                <img src={partner.avatar.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-7 w-7 text-gold/60" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg text-sand truncate">
                {partner.displayName || partner.username}
              </p>
              <p className="text-xs text-amber-300 font-mono">
                {partner.pirateTitle || "Rookie Pirate"} • ฿{(partner.bounty || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-sand-dim truncate">{partner.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-sand-dim">
              You can exchange direct partner time capsules across the sea.
            </p>
            <button
              type="button"
              onClick={handleUnpair}
              disabled={unpair.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-straw-red/40 hover:bg-straw-red/20 text-straw-red text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Unpair</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          <p className="text-xs text-sand-dim leading-relaxed">
            Link accounts with your significant other or favorite nakama to write shared couple capsules, anniversary milestones, and unlock partner-exclusive chest themes.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Generate Code Box */}
            <div className="p-4 rounded-2xl bg-ocean-abyss/60 border border-white/10 flex flex-col justify-between">
              <div>
                <p className="font-display text-sm text-gold mb-1">1. Share Your Code</p>
                <p className="text-[11px] text-sand-dim mb-3">Generate an 8-character pairing code for your partner to enter.</p>
                
                {inviteCode ? (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 px-3 py-2 rounded-xl bg-ocean-abyss border border-gold/40 text-center font-mono text-lg font-bold text-amber-300 tracking-widest">
                      {inviteCode}
                    </div>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-ocean-abyss transition-all"
                      title="Copy Code"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={generateInvite}
                disabled={createInvite.isPending}
                className="w-full mt-2 px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-white/15 text-xs font-bold font-display tracking-wide text-sand transition-all"
              >
                {createInvite.isPending ? "Charting Code..." : inviteCode ? "Regenerate Code" : "Generate Pairing Code"}
              </button>
            </div>

            {/* Enter Code Box */}
            <form onSubmit={acceptCode} className="p-4 rounded-2xl bg-ocean-abyss/60 border border-white/10 flex flex-col justify-between">
              <div>
                <p className="font-display text-sm text-gold mb-1">2. Enter Partner's Code</p>
                <p className="text-[11px] text-sand-dim mb-3">Paste or type the 8-character code sent by your partner.</p>
                <CodeInput
                  value={enteredCode}
                  onChange={setEnteredCode}
                  length={8}
                  disabled={acceptInvite.isPending}
                />
              </div>

              <button
                type="submit"
                disabled={enteredCode.length < 8 || acceptInvite.isPending}
                className="w-full mt-4 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-straw-red hover:bg-straw-red/90 text-white text-xs font-bold font-display tracking-wider transition-all disabled:opacity-50"
              >
                <span>{acceptInvite.isPending ? "Linking Crew..." : "Join Crew of Two"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartnerPairCard;
