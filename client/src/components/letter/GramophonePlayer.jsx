import { useState, useRef, useEffect } from "react";
import { Play, Pause, Disc, RotateCcw } from "lucide-react";

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function GramophonePlayer({ voice }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(voice.duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoaded = () => setDuration(audio.duration || voice.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [voice]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div className="rounded-2xl border border-amber-900/30 bg-ink/5 p-4 sm:p-5 shadow-inner">
      <audio ref={audioRef} src={voice.secureUrl} preload="metadata" />

      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Animated Gramophone Disc */}
        <button
          type="button"
          onClick={togglePlay}
          className={`relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full bg-gradient-to-tr from-amber-950 via-amber-800 to-amber-900 border-2 border-gold/60 shadow-lg flex items-center justify-center text-gold transition hover:scale-105 ${
            isPlaying ? "animate-spin" : ""
          }`}
          style={{ animationDuration: "3s" }}
        >
          <Disc className="h-6 w-6 opacity-40 absolute" />
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-gold drop-shadow relative z-10" />
          ) : (
            <Play className="h-5 w-5 fill-gold ml-0.5 drop-shadow relative z-10" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display font-bold text-xs uppercase tracking-wider text-ink/80 flex items-center gap-1.5">
              <span>🎙️</span> Voice From That Day
            </span>
            <span className="font-mono text-xs text-ink/60 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Scrub Bar */}
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-ink/20 accent-amber-700 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GramophonePlayer;
