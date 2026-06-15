// Global audio instance so we can unlock it via user interaction on iOS Safari
const shutterAudio = new Audio('/shutter.mp3');

/**
 * Call this on the very first user click (e.g. "I'm ready")
 * to unlock the audio element for Safari autoplay restrictions.
 */
export function unlockAudio() {
  try {
    shutterAudio.volume = 0;
    shutterAudio.play().then(() => {
      shutterAudio.pause();
      shutterAudio.currentTime = 0;
      shutterAudio.volume = 1;
    }).catch(() => {});
  } catch (e) {
    // Ignore
  }
}

/**
 * Call this to actually play the sound later when a photo is taken.
 */
export function playShutterSound() {
  try {
    shutterAudio.volume = 1;
    shutterAudio.currentTime = 0;
    shutterAudio.play().catch(() => {});
  } catch (e) {
    // Ignore
  }
}
