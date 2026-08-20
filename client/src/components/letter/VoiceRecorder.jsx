import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Mic, Square, Trash2, Loader2, Play, Pause } from "lucide-react";
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
  const canvasRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const upload = useUpload();

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgba(7, 15, 26, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#F5A623"; // Gold color
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Recording isn't supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio Analyser for live waveform visualization
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        audioCtx.close().catch(() => {});

        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], `voice-note.${extFor(blob.type)}`, { type: blob.type });
        try {
          const att = await upload.mutateAsync({ file });
          onAdd(att);
          toast.success("Voice memo charted and attached!");
        } catch (e) {
          toast.error(e.response?.data?.message || "Couldn't save that recording");
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Start waveform drawing
      setTimeout(drawWaveform, 100);
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
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-ocean-abyss/80 p-3 shadow-md">
        <audio controls src={voice.secureUrl} className="h-9 w-full max-w-sm rounded-lg" />
        <button
          type="button"
          onClick={() => onRemove(voice._id)}
          className="ml-auto rounded-full p-2 text-sand-dim hover:text-straw-red hover:bg-straw-red/10 transition"
          aria-label="Remove voice note"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recording ? (
        <div className="space-y-2 p-3 rounded-2xl bg-ocean-abyss/90 border border-amber-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-straw-red" />
              <span className="text-xs font-mono font-bold text-amber-300">
                Recording: {mmss(seconds)}
              </span>
            </div>
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-straw-red hover:bg-straw-red/90 text-white text-xs font-bold font-display tracking-wider transition"
            >
              <Square className="h-3.5 w-3.5" />
              Stop & Attach
            </button>
          </div>

          {/* Live Waveform Canvas */}
          <canvas
            ref={canvasRef}
            width={320}
            height={48}
            className="w-full h-12 rounded-xl bg-ocean-abyss border border-white/10"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={start}
            disabled={upload.isPending}
            className="flex items-center gap-2 rounded-full border border-grand-line px-4 py-2 text-sm text-text-secondary transition hover:border-gold hover:text-gold disabled:opacity-60"
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4 text-amber-400" />}
            {upload.isPending ? "Saving Recording…" : "Record a Voice Note"}
          </button>
        </div>
      )}
    </div>
  );
}
