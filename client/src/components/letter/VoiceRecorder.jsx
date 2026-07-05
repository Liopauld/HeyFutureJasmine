import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, Square, Trash2, Loader2 } from "lucide-react";
import { useUpload } from "../../hooks/useUpload.js";

function extFor(type = "") {
  if (type.includes("mp4")) return "m4a";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("wav")) return "wav";
  return "webm";
}

function mmss(total) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VoiceRecorder({ voice, onAdd, onRemove }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const upload = useUpload();

  useEffect(() => () => clearInterval(timerRef.current), []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Recording isn't supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], `voice-note.${extFor(blob.type)}`, { type: blob.type });
        try {
          const att = await upload.mutateAsync({ file });
          onAdd(att);
        } catch (e) {
          toast.error(e.response?.data?.message || "Couldn't save that recording");
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access is needed to record a voice note");
    }
  };

  const stop = () => {
    clearInterval(timerRef.current);
    setRecording(false);
    recorderRef.current?.stop();
  };

  if (voice) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-grand-line bg-ocean/50 p-3">
        <audio controls src={voice.secureUrl} className="h-9 w-full max-w-xs" />
        <button
          type="button"
          onClick={() => onRemove(voice._id)}
          className="ml-auto rounded-full p-2 text-text-muted transition hover:text-straw-red"
          aria-label="Remove voice note"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {recording ? (
        <button
          type="button"
          onClick={stop}
          className="flex items-center gap-2 rounded-full bg-straw-red px-4 py-2 text-sm font-medium text-white"
        >
          <Square className="h-4 w-4" />
          Stop
          <span className="tabular-nums">{mmss(seconds)}</span>
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={upload.isPending}
          className="flex items-center gap-2 rounded-full border border-grand-line px-4 py-2 text-sm text-text-secondary transition hover:border-gold hover:text-gold disabled:opacity-60"
        >
          {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
          {upload.isPending ? "Saving…" : "Record a voice note"}
        </button>
      )}
    </div>
  );
}
