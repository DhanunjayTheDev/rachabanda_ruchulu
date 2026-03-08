// Play a soft notification chime using Web Audio API (no file needed)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const frequencies = [523.25, 659.25, 783.99];
    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.12 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);

      oscillator.start(ctx.currentTime + i * 0.12);
      oscillator.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  } catch {
    // Silently ignore if audio is not available
  }
}

let orderAlertInterval: ReturnType<typeof setInterval> | null = null;

export function startOrderAlertSound() {
  stopOrderAlertSound();
  playOrderAlertBeep();
  orderAlertInterval = setInterval(() => {
    playOrderAlertBeep();
  }, 3000);
}

export function stopOrderAlertSound() {
  if (orderAlertInterval) {
    clearInterval(orderAlertInterval);
    orderAlertInterval = null;
  }
}

function playOrderAlertBeep() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    [880, 1100, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.25);

      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.25);
    });
  } catch {
    // Silently ignore
  }
}
