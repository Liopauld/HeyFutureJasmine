import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Anchor } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-ocean-abyss px-4 py-2 text-center text-xs font-bold font-display tracking-wider flex items-center justify-center gap-2 shadow-lg"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>Sailing Offline — Viewing cached treasures across the sea</span>
          <Anchor className="w-3.5 h-3.5 opacity-70" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OfflineBanner;
