/**
 * Sound utility functions using Web Audio API
 */

/**
 * Generate a simple tone using Web Audio API
 */
export function playTone(frequency: number, duration: number, volume: number): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Silently fail
  }
}

/**
 * Play tick using Web Audio API (800Hz, 50ms, quiet)
 */
export function playTickTone(): void {
  playTone(800, 0.05, 0.01);
}

/**
 * Play beep using Web Audio API (1200Hz, 250ms, louder)
 */
export function playBeepTone(): void {
  playTone(1200, 0.25, 0.4);
}
