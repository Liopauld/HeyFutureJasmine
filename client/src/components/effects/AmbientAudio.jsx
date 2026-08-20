import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAudioEnabled, setAudioEnabled, startOceanAmbience, stopOceanAmbience } from "../../lib/soundEffects.js";

export function AmbientAudio() {
  const [enabled, setEnabled] = useState(isAudioEnabled());

  useEffect(() => {
    const handleToggle = (e) => {
      setEnabled(e.detail.enabled);
    };
    window.addEventListener("hfj-audio-toggle", handleToggle);
    return () => window.removeEventListener("hfj-audio-toggle", handleToggle);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAudioEnabled(next);
    if (next) {
      startOceanAmbience();
    } else {
      stopOceanAmbience();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={enabled ? "Mute seafaring audio" : "Enable atmospheric ocean soundscapes"}
      aria-label={enabled ? "Mute audio" : "Enable audio"}
      className="p-1.5 rounded-full border border-white/10 hover:border-gold/50 bg-white/5 hover:bg-white/10 text-sand-dim hover:text-gold transition-all"
    >
      {enabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 opacity-50" />}
    </button>
  );
}

export default AmbientAudio;
