// Procedural Web Audio API Sound Synthesizer for Outpost
// Zero external asset dependencies - generates 100% synthetic sci-fi tactical sounds

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('outpost_audio_muted') === 'true';
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('outpost_audio_muted', this.muted ? 'true' : 'false');
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  // High subtle tactical interface blip
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {
      // AudioContext policy suppression
    }
  }

  // Laser extraction pulse on node harvest
  playHarvest() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    } catch (e) {}
  }

  // Ascending metallic arpeggio on craft assembly
  playCraft() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch (e) {}
  }

  // Heavy mechanical drill deployment hydraulic thud
  playDeploy() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  // Cash / Escrow trade exchange chime
  playTrade() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [880, 1174.66]; // A5, D6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    } catch (e) {}
  }

  // Emergency / Sector warning siren
  playAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, t);
      osc.frequency.linearRampToValueAtTime(950, t + 0.15);
      osc.frequency.linearRampToValueAtTime(700, t + 0.3);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    } catch (e) {}
  }

  // Triumphant Surveyor Beacon victory fanfare
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const chords = [
        [523.25, 659.25], // C5, E5
        [587.33, 739.99], // D5, F#5
        [783.99, 987.77], // G5, B5
        [1046.5, 1318.5], // C6, E6
      ];

      chords.forEach(([f1, f2], i) => {
        const t = this.ctx.currentTime + i * 0.18;
        [f1, f2].forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(t);
          osc.stop(t + 0.35);
        });
      });
    } catch (e) {}
  }
}

export const soundFx = new SoundFX();
