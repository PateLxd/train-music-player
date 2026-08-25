/**
 * Indian loco-style two-tone air horn, synthesized with WebAudio.
 * WAP/WAG locomotives often use a pleasant doubled horn (~D + F).
 */
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  const AC = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function blast(ac: AudioContext, start: number, duration: number) {
  const tonePairs: [number, number][] = [
    [293.66, 349.23], // D4 + F4
  ];
  tonePairs.forEach(([f1, f2]) => {
    [f1, f2].forEach((freq) => {
      const osc = ac.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = freq;

      // a hint of detune for the "double horn" richness
      const osc2 = ac.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 2.004;

      const filter = ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1150;
      filter.Q.value = 0.8;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.05);
      gain.gain.setValueAtTime(0.16, start + duration - 0.22);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      osc.start(start);
      osc.stop(start + duration + 0.05);
      osc2.start(start);
      osc2.stop(start + duration + 0.05);
    });
  });
}

/** "PAAA-paa!" — two blasts like a loco pulling out of the platform */
export function playTrainHorn() {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + 0.02;
  blast(ac, t0, 1.05);
  blast(ac, t0 + 1.4, 0.9);
}
