/**
 * 🏴‍☠️ Seafaring Soundscapes & Audio Effects Engine
 * Uses Web Audio API for zero-latency, zero-dependency atmospheric sounds.
 * Works seamlessly on Desktop & Mobile Safari without external asset 404s.
 */

let audioCtx = null;
let oceanSource = null;
let oceanGain = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("hfj-audio-enabled") === "true";
}

export function setAudioEnabled(enabled) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hfj-audio-enabled", enabled ? "true" : "false");
  if (!enabled) {
    stopOceanAmbience();
  } else {
    getAudioContext();
  }
  window.dispatchEvent(new CustomEvent("hfj-audio-toggle", { detail: { enabled } }));
}

/**
 * Procedural Treasure Chest Opening Chime & Creak
 */
export function playChestOpenSound() {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Resonant wood / latch creak (low filtered saw sweep)
  const oscCreak = ctx.createOscillator();
  const gainCreak = ctx.createGain();
  const filterCreak = ctx.createBiquadFilter();

  oscCreak.type = "sawtooth";
  oscCreak.frequency.setValueAtTime(80, now);
  oscCreak.frequency.exponentialRampToValueAtTime(140, now + 0.3);

  filterCreak.type = "lowpass";
  filterCreak.frequency.setValueAtTime(300, now);
  filterCreak.frequency.linearRampToValueAtTime(800, now + 0.3);

  gainCreak.gain.setValueAtTime(0.15, now);
  gainCreak.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  oscCreak.connect(filterCreak);
  filterCreak.connect(gainCreak);
  gainCreak.connect(ctx.destination);

  oscCreak.start(now);
  oscCreak.stop(now + 0.35);

  // 2. Gleaming golden chord (E major pentatonic sparkle: E5, G#5, B5, E6)
  const freqs = [659.25, 830.61, 987.77, 1318.51];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.08);

    gain.gain.setValueAtTime(0.0001, now + 0.15 + idx * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.18 + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + idx * 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + 0.15 + idx * 0.08);
    osc.stop(now + 1.3 + idx * 0.1);
  });
}

/**
 * Subtle procedural ocean wave surf
 */
export function startOceanAmbience() {
  if (!isAudioEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx || oceanSource) return;

  // Generate 5 seconds of pink/brown noise for ocean surf
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Brown noise integration
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }

  oceanSource = ctx.createBufferSource();
  oceanSource.buffer = buffer;
  oceanSource.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(250, ctx.currentTime);

  oceanGain = ctx.createGain();
  oceanGain.gain.setValueAtTime(0.001, ctx.currentTime);
  oceanGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);

  oceanSource.connect(filter);
  filter.connect(oceanGain);
  oceanGain.connect(ctx.destination);

  oceanSource.start(0);
}

export function stopOceanAmbience() {
  if (oceanGain && audioCtx) {
    try {
      oceanGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        if (oceanSource) {
          try {
            oceanSource.stop();
            oceanSource.disconnect();
          } catch {}
          oceanSource = null;
        }
      }, 500);
    } catch {
      if (oceanSource) {
        oceanSource.stop();
        oceanSource = null;
      }
    }
  }
}
