/**
 * Feedback Engine for Dhikr Counter (Haptic Vibration & Subtle Sound Effects)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
 if (typeof window === 'undefined') return null;
 if (!audioCtx) {
 const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
 if (AudioCtx) {
 audioCtx = new AudioCtx();
 }
 }
 if (audioCtx && audioCtx.state === 'suspended') {
 audioCtx.resume().catch(() => {});
 }
 return audioCtx;
}

/**
 * Plays a gentle, organic wooden click / tap sound
 */
export function playDhikrTapSound() {
 try {
 const ctx = getAudioContext();
 if (!ctx) return;
 const now = ctx.currentTime;

 const osc = ctx.createOscillator();
 const gain = ctx.createGain();

 // Soft organic click tone
 osc.type = 'sine';
 osc.frequency.setValueAtTime(750, now);
 osc.frequency.exponentialRampToValueAtTime(320, now + 0.025);

 gain.gain.setValueAtTime(0.06, now);
 gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.03);

 osc.connect(gain);
 gain.connect(ctx.destination);

 osc.start(now);
 osc.stop(now + 0.03);
 } catch (err) {
 // Ignore audio playback issues
 }
}

/**
 * Triggers a short tactile vibration pulse (haptic feedback)
 */
export function triggerDhikrHaptic() {
 try {
 if (typeof navigator !== 'undefined' && 'vibrate' in navigator && navigator.vibrate) {
 navigator.vibrate(12); // Subtle 12ms tap vibration
 }
 } catch (err) {
 // Ignore haptic errors on unsupported hardware
 }
}

/**
 * Invokes tactile haptics and sound based on user preferences
 */
export function triggerDhikrFeedback(hapticEnabled: boolean = true, soundEnabled: boolean = true) {
 if (hapticEnabled) {
 triggerDhikrHaptic();
 }
 if (soundEnabled) {
 playDhikrTapSound();
 }
}
