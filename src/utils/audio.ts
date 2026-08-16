let audioEnabled = true;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(freq: number, type: OscillatorType = 'sine', duration = 0.15, volume = 0.1) {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio playback error', e);
  }
}

export function playSound(effect: 'correct' | 'wrong' | 'click' | 'victory') {
  if (!audioEnabled) return;
  if (effect === 'correct') {
    playTone(523.25, 'sine', 0.12, 0.15);
    setTimeout(() => playTone(659.25, 'sine', 0.25, 0.15), 100);
  } else if (effect === 'wrong') {
    playTone(220, 'sawtooth', 0.15, 0.12);
    setTimeout(() => playTone(180, 'sawtooth', 0.25, 0.12), 120);
  } else if (effect === 'click') {
    playTone(400, 'triangle', 0.05, 0.05);
  } else if (effect === 'victory') {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'sine', 0.2, 0.15), idx * 120);
    });
  }
}

export function isAudioEnabled() {
  return audioEnabled;
}

export function toggleAudioState(): boolean {
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    playSound('click');
  }
  return audioEnabled;
}
