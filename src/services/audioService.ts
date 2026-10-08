/**
 * Web Audio Synthesizer & Speech Synthesis Coach
 * Provides real-time audio rep counters, motivational cues, form corrections, meditation chimes, and haptic feedback
 */
class SoundService {
  private ctx: AudioContext | null = null;
  private voiceEnabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  /**
   * Spoken AI Voice Coach cue via Web Speech API (e.g., "Down deeper", "Keep back straight", "Rep 10 complete!")
   */
  public speakCoachCue(text: string, priority: boolean = false) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    const now = Date.now();

    // Prevent excessive repetitive overlapping cues
    if (!priority && (now - this.lastSpokenTime < 2800 || text === this.lastSpokenText)) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Clear backlog
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      // Select an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      window.speechSynthesis.speak(utterance);
      this.lastSpokenText = text;
      this.lastSpokenTime = now;
    } catch {
      // Speech synthesis unsupported or blocked
    }
  }

  playRepBeep(repNumber: number) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch goes up slightly every 5 reps for positive game feedback
      const baseFreq = 440 + Math.min(repNumber * 12, 450);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }
    } catch {
      // Audio context fallback
    }
  }

  playLockAlert() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(160, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Ignore
    }
  }

  playWarningTick() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  playMeditationBowl() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(216, now); // 432Hz harmonic
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(218.5, now); // Slight beat frequency

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.6);
      osc2.stop(now + 3.6);
    } catch {
      // Ignore
    }
  }
}

export const soundService = new SoundService();
