/**
 * Procedural Web Audio Synthesizer for Snowbound Hearts
 * Produces cozy retro-romantic synth chimes, crunching snow soundscapes,
 * dynamic engine rumble, boost sweeps, and an interactive warm ambient synth pad.
 */

class SynthAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Sound toggles
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;

  // Dynamic engine audio nodes
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Dynamic snow crunch audio nodes
  private snowNoiseNode: AudioBufferSourceNode | null = null;
  private snowNoiseGain: GainNode | null = null;
  private snowNoiseFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Music state
  private musicIntervalId: number | null = null;
  private chordIndex: number = 0;

  constructor() {
    // AudioContext will be initialized upon first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? 0.8 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? 0.35 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Setup continuous engine rumble
      this.setupEngineSynth();

      // Setup continuous snow plowing crunch
      this.setupSnowNoise();

      // Start ambient romantic synth pads
      if (this.isMusicEnabled) {
        this.startAmbientMusic();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private setupEngineSynth() {
    if (!this.ctx || !this.sfxGain) return;

    // Dual low-frequency oscillators for warm vintage tractor rumble
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc2.type = 'triangle';
    this.engineOsc1.frequency.setValueAtTime(28, this.ctx.currentTime);
    this.engineOsc2.frequency.setValueAtTime(56, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(2, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.sfxGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
  }

  private setupSnowNoise() {
    if (!this.ctx || !this.sfxGain) return;

    // 2-second looped white noise buffer for snow plowing texture
    const bufferSize = this.ctx.sampleRate * 2;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.snowNoiseNode = this.ctx.createBufferSource();
    this.snowNoiseNode.buffer = this.noiseBuffer;
    this.snowNoiseNode.loop = true;

    this.snowNoiseFilter = this.ctx.createBiquadFilter();
    this.snowNoiseFilter.type = 'bandpass';
    this.snowNoiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
    this.snowNoiseFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.snowNoiseGain = this.ctx.createGain();
    this.snowNoiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.snowNoiseNode.connect(this.snowNoiseFilter);
    this.snowNoiseFilter.connect(this.snowNoiseGain);
    this.snowNoiseGain.connect(this.sfxGain);

    this.snowNoiseNode.start();
  }

  /**
   * Update continuous vehicle audio based on throttle and plowing speed
   */
  public updateVehicleAudio(speedRatio: number, isPlowing: boolean, isBoosting: boolean) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain || !this.snowNoiseGain || !this.snowNoiseFilter) return;

    const t = this.ctx.currentTime;
    const baseFreq = 24 + speedRatio * 42 + (isBoosting ? 20 : 0);
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, t, 0.08);

    const filterCutoff = 100 + speedRatio * 220 + (isBoosting ? 150 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterCutoff, t, 0.08);

    const targetEngineVol = 0.03 + speedRatio * 0.09 + (isBoosting ? 0.06 : 0);
    this.engineGain.gain.setTargetAtTime(targetEngineVol, t, 0.08);

    // Snow plowing swoosh/crunch
    if (isPlowing && speedRatio > 0.1) {
      const plowVolume = Math.min(0.22, speedRatio * 0.22);
      const snowFreq = 650 + speedRatio * 600;
      this.snowNoiseGain.gain.setTargetAtTime(plowVolume, t, 0.06);
      this.snowNoiseFilter.frequency.setTargetAtTime(snowFreq, t, 0.08);
    } else {
      this.snowNoiseGain.gain.setTargetAtTime(0, t, 0.1);
    }
  }

  /**
   * Play ascending pentatonic chime when snow is plowed and combos build
   * comboLevel: 1..8
   */
  public playComboChime(comboLevel: number) {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;

    // Pentatonic scale frequencies: C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
    const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const noteIndex = Math.min(comboLevel + 2, pentatonic.length - 1);
    const baseFreq = pentatonic[noteIndex];

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Warm bell-synth envelope
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(baseFreq, t);
    osc2.frequency.setValueAtTime(baseFreq * 2.01, t); // slight bell detune

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.48);
    osc2.stop(t + 0.48);
  }

  /**
   * Boost jet / cozy steam burst sound
   */
  public playBoostStart() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.3);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Gift collection / Love Letter pickup chime (sparkly arpeggio)
   */
  public playGiftPickup() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.055;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.14, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });
  }

  /**
   * Landmark unlocked / Village heart reunited fanfare
   */
  public playLandmarkReunion() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const chords = [
      [349.23, 440.0, 523.25, 659.25], // Fmaj7
      [392.0, 493.88, 587.33, 783.99], // G
      [523.25, 659.25, 783.99, 987.77]  // Cmaj7
    ];

    chords.forEach((chord, chordIdx) => {
      const chordTime = t + chordIdx * 0.22;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, chordTime);

        gain.gain.setValueAtTime(0.12, chordTime);
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + 0.65);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(chordTime);
        osc.stop(chordTime + 0.7);
      });
    });
  }

  /**
   * Bump against obstacle
   */
  public playBumpSound() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Upgrade purchased in garage
   */
  public playUpgradeSound() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const freqs = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

    freqs.forEach((freq, idx) => {
      const time = t + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(time);
      osc.stop(time + 0.4);
    });
  }

  /**
   * Ambient romantic winter synth music loop
   * Cozy chord progression: Fmaj9 -> G6 -> Em7 -> Am7
   */
  private startAmbientMusic() {
    if (this.musicIntervalId !== null) return;

    const chords = [
      [174.61, 261.63, 329.63, 392.0], // F2, C3, E3, G3 (Fmaj9)
      [196.0, 246.94, 293.66, 329.63], // G2, B2, D3, E3 (G6)
      [164.81, 246.94, 329.63, 392.0], // E2, B2, E3, G3 (Em7)
      [220.0, 261.63, 329.63, 440.0]   // A2, C3, E3, A3 (Am7)
    ];

    const stepChord = () => {
      if (!this.ctx || !this.musicGain || !this.isMusicEnabled || this.isMuted) return;

      const currentChord = chords[this.chordIndex % chords.length];
      this.chordIndex++;
      const t = this.ctx.currentTime;
      const chordDuration = 3.8;

      currentChord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        // Subtle warm detuning
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.004), t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380 + Math.sin(this.chordIndex) * 80, t);
        filter.frequency.linearRampToValueAtTime(450, t + chordDuration * 0.5);

        // Slow soft attack and release for cozy ambience
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.038, t + 1.2);
        gain.gain.setValueAtTime(0.038, t + chordDuration - 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(t);
        osc.stop(t + chordDuration);
      });
    };

    // First chord immediately
    stepChord();
    this.musicIntervalId = window.setInterval(stepChord, 3800);
  }

  public stopAmbientMusic() {
    if (this.musicIntervalId !== null) {
      window.clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? 0.35 : 0, this.ctx.currentTime);
    }
    if (this.isMusicEnabled && !this.musicIntervalId) {
      this.startAmbientMusic();
    } else if (!this.isMusicEnabled && this.musicIntervalId) {
      this.stopAmbientMusic();
    }
    return this.isMusicEnabled;
  }

  public toggleSfx(): boolean {
    this.isSfxEnabled = !this.isSfxEnabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? 0.8 : 0, this.ctx.currentTime);
    }
    return this.isSfxEnabled;
  }

  public getSettings() {
    return {
      isMuted: this.isMuted,
      isMusicEnabled: this.isMusicEnabled,
      isSfxEnabled: this.isSfxEnabled
    };
  }
}

export const synthAudio = new SynthAudioEngine();
