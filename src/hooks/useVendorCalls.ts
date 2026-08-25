import { useCallback, useEffect, useRef, useState } from "react";
import type { Vendor } from "@/data/vendors";

/**
 * Platform-sound engine:
 *  - vendor "call" = double hand-bell (WebAudio) + spoken Hindi hawker line (SpeechSynthesis)
 *  - optional ambient mode: a random vendor strolls past every 24–46 seconds
 *  - if a real recording is provided via `vendor.audioUrl`, it is used INSTEAD of TTS
 */

function resolveHindiVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /^hi([-_]|$)/i.test(v.lang)) ??
    voices.find((v) => /hin/i.test(v.name)) ??
    null
  );
}

// warm up the voice list so a Hindi voice is available on first call
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

export function useVendorCalls(ambientVolumed: boolean) {
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const ambientTimer = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stoppedRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    setSpeaking(false);
    setActiveVendor(null);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (ambientTimer.current) {
      window.clearTimeout(ambientTimer.current);
      ambientTimer.current = null;
    }
  }, []);

  /** short pleasant bell "dhin-dhin" of an Indian platform hand bell */
  const bell = useCallback((times = 2) => {
    const AudioCtor = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = new AudioCtor();
    const now = ctx.currentTime;
    [880, 1174.66].forEach((freq, i) => {
      for (let rep = 0; rep < times; rep++) {
        const t = now + i * 0.42 + rep * 0.85;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = freq;
        filter.Q.value = 8;
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.2);
      }
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 5200);
  }, []);

  const playVendor = useCallback(
    (vendor: Vendor, silentBell = false) => {
      stoppedRef.current = false;
      setActiveVendor(vendor);

      if (vendor.audioUrl) {
        if (audioRef.current) audioRef.current.src = "";
        const audio = new Audio(vendor.audioUrl);
        audio.volume = ambientVolumed ? 1 : 0.9;
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false);
          setActiveVendor(null);
        };
        if (!silentBell) bell();
        setSpeaking(true);
        audio.play().catch(() => setSpeaking(false));
        return;
      }

      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(vendor.callHi);
      utter.lang = "hi-IN";
      utter.pitch = vendor.pitch;
      utter.rate = vendor.rate;
      utter.volume = 0.95;
      const voice = resolveHindiVoice();
      if (voice) utter.voice = voice;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => {
        if (stoppedRef.current) return;
        setSpeaking(false);
        setActiveVendor(null);
      };
      utter.onerror = () => {
        setSpeaking(false);
        setActiveVendor(null);
      };
      if (!silentBell) bell();
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    },
    [ambientVolumed, bell]
  );

  const toggleAmbient = useCallback(() => {
    setAmbient((a) => {
      const next = !a;
      if (!next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => {
    if (!ambient) return;
    if (ambientTimer.current) window.clearTimeout(ambientTimer.current);

    const schedule = () => {
      ambientTimer.current = window.setTimeout(() => {
        // pick a random vendor from the current theme's list via custom event
        const evt = new CustomEvent("rail-ambient-vendor");
        window.dispatchEvent(evt);
        schedule();
      }, 24000 + Math.random() * 22000);
    };
    schedule();
    return () => {
      if (ambientTimer.current) window.clearTimeout(ambientTimer.current);
    };
  }, [ambient]);

  useEffect(() => () => stop(), [stop]);

  return { activeVendor, speaking, ambient, playVendor, toggleAmbient, stop };
}
