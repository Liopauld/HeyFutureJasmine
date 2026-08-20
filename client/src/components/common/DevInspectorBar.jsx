import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Terminal, RefreshCw, Eye, ChevronUp, ChevronDown, CheckCircle2, ShieldAlert } from "lucide-react";
import { useTriggerSweep } from "../../hooks/useLetters.js";

export function DevInspectorBar() {
  const [isOpen, setIsOpen] = useState(false);
  const sweepMutation = useTriggerSweep();

  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  const handleSweep = () => {
    sweepMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`⚓ Sweep complete! Delivered ${data.delivered || 0} overdue letter(s).`, {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Sweep failed to trigger.");
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-80 rounded-2xl bg-ocean-abyss/95 border border-amber-500/40 p-4 shadow-2xl backdrop-blur-lg text-sand"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="font-display font-bold text-xs uppercase tracking-wider text-amber-300">
                  Dev Letter Inspector
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-sand-dim hover:text-sand"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Status */}
            <div className="text-[11px] text-sand-dim mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <span>Dev API:</span>
                <span className="text-emerald-400 font-mono font-semibold">Active (/api/dev)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SuperPeek:</span>
                <span className="text-amber-400 font-semibold">Enabled on Captain's Log</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleSweep}
                disabled={sweepMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold font-display tracking-wider transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sweepMutation.isPending ? "animate-spin" : ""}`} />
                {sweepMutation.isPending ? "Sweeping Tides..." : "Trigger Delivery Sweep"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-ocean-abyss/90 border border-amber-500/40 text-amber-400 shadow-xl backdrop-blur-md text-xs font-bold font-display tracking-wide hover:bg-amber-500/20 transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Dev Inspector</span>
            <ChevronUp className="w-3.5 h-3.5 opacity-60" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DevInspectorBar;
