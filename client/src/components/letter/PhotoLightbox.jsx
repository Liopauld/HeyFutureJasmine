import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

export function PhotoLightbox({ photos, currentIndex, onClose, onIndexChange }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onIndexChange(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < photos.length - 1) onIndexChange(currentIndex + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, photos.length, onClose, onIndexChange]);

  if (currentIndex === null || !photos[currentIndex]) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-abyss/95 backdrop-blur-xl p-4 sm:p-8">
        {/* Top Controls */}
        <div className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-sand z-10">
          <span className="font-mono text-xs text-sand-dim">
            Photo {currentIndex + 1} of {photos.length}
          </span>
          <div className="flex items-center gap-2">
            <a
              href={currentPhoto.secureUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-sand transition"
              title="Open full resolution"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-sand transition"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={() => onIndexChange(currentIndex - 1)}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-sand backdrop-blur transition z-10"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Main Photo */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-h-[85vh] max-w-[90vw] flex flex-col items-center justify-center"
        >
          <img
            src={currentPhoto.secureUrl}
            alt={currentPhoto.originalName || "Captured treasure memory"}
            className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-white/10"
          />
          {currentPhoto.originalName && (
            <p className="mt-3 text-xs text-sand-dim font-mono truncate max-w-md text-center">
              {currentPhoto.originalName}
            </p>
          )}
        </motion.div>

        {/* Next Button */}
        {currentIndex < photos.length - 1 && (
          <button
            type="button"
            onClick={() => onIndexChange(currentIndex + 1)}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-sand backdrop-blur transition z-10"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </AnimatePresence>
  );
}

export default PhotoLightbox;
