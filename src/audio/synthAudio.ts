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

  // Sound toggles and volume levels
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;
  private masterVol: number = 0.7;
  private musicVol: number = 0.4;
  private sfxVol: number = 0.8;

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

  // Dynamic procedural blizzard howling wind
  private windNoiseNode: AudioBufferSourceNode | null = null;
  private windNoiseGain: GainNode | null = null;
  private windNoiseFilter: BiquadFilterNode | null = null;

  // Music state & Radio stations
  private musicIntervalId: number | null = null;
  private chordIndex: number = 0;
  private currentStationId: string = 'val-classic';

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
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? this.sfxVol : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? this.musicVol : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Setup continuous engine rumble
      this.setupEngineSynth();

      // Setup continuous snow plowing crunch
      this.setupSnowNoise();

      // Setup dynamic howling wind for blizzard weather
      this.setupWindSynth();

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

  private setupWindSynth() {
    if (!this.ctx || !this.sfxGain || !this.noiseBuffer) return;

    this.windNoiseNode = this.ctx.createBufferSource();
    this.windNoiseNode.buffer = this.noiseBuffer;
    this.windNoiseNode.loop = true;

    this.windNoiseFilter = this.ctx.createBiquadFilter();
    this.windNoiseFilter.type = 'bandpass';
    this.windNoiseFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
    this.windNoiseFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.windNoiseGain = this.ctx.createGain();
    this.windNoiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.windNoiseNode.connect(this.windNoiseFilter);
    this.windNoiseFilter.connect(this.windNoiseGain);
    this.windNoiseGain.connect(this.sfxGain);

    this.windNoiseNode.start();
  }

  /**
   * Update continuous weather atmospheric audio (wind howl intensity)
   */
  public updateWeatherAudio(windIntensity: number) {
    if (!this.ctx || !this.windNoiseGain || !this.windNoiseFilter || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const targetGain = Math.max(0, Math.min(0.24, windIntensity * 0.18));
    const targetFreq = 260 + windIntensity * 400 + Math.sin(t * 1.5) * 80;

    this.windNoiseGain.gain.setTargetAtTime(targetGain, t, 0.2);
    this.windNoiseFilter.frequency.setTargetAtTime(targetFreq, t, 0.25);
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
   * Ambient romantic winter synth music loop with multiple radio stations
   */
  private startAmbientMusic() {
    if (this.musicIntervalId !== null) return;

    // Different musical station voicings
    const folkChords = [
      [174.61, 261.63, 329.63, 392.0], // Fmaj9
      [196.0, 246.94, 293.66, 329.63], // G6
      [164.81, 246.94, 329.63, 392.0], // Em7
      [220.0, 261.63, 329.63, 440.0],  // Am7
    ];

    const auroraChords = [
      [130.81, 196.0, 293.66, 392.0, 587.33], // Cmaj9 ethereal open 5th
      [146.83, 220.0, 329.63, 440.0, 659.25], // Dsus4 add9
      [110.0, 164.81, 261.63, 329.63, 493.88], // Am9
      [174.61, 261.63, 349.23, 523.25, 698.46], // Fmaj7
    ];

    const lofiChords = [
      [146.83, 220.0, 261.63, 329.63], // Dm7/9
      [196.0, 246.94, 349.23, 392.0],  // G13
      [130.81, 196.0, 246.94, 329.63], // Cmaj7/9
      [220.0, 261.63, 329.63, 415.3],  // Am(maj7)
    ];

    const dispatchChords = [
      [110.0, 164.81, 220.0, 277.18],  // Tense A harmonic pulse
      [98.0, 146.83, 196.0, 246.94],   // G minor suspense
      [87.31, 130.81, 174.61, 220.0],  // F dramatic
      [123.47, 185.0, 246.94, 311.13], // B diminished tension
    ];

    const stepChord = () => {
      if (!this.ctx || !this.musicGain || !this.isMusicEnabled || this.isMuted) return;

      let currentPalette = folkChords;
      let oscType: OscillatorType = 'triangle';
      let chordInterval = 3800;

      if (this.currentStationId === 'val-aurora') {
        currentPalette = auroraChords;
        oscType = 'sine';
        chordInterval = 4400;
      } else if (this.currentStationId === 'val-lofi') {
        currentPalette = lofiChords;
        oscType = 'triangle';
        chordInterval = 3400;
      } else if (this.currentStationId === 'val-dispatch') {
        currentPalette = dispatchChords;
        oscType = 'sawtooth';
        chordInterval = 2800;
      }

      const currentChord = currentPalette[this.chordIndex % currentPalette.length];
      this.chordIndex++;
      const t = this.ctx.currentTime;
      const chordDuration = chordInterval / 1000;

      currentChord.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = i === 0 ? 'sine' : oscType;
        osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.005), t);

        filter.type = 'lowpass';
        const baseCutoff = this.currentStationId === 'val-dispatch' ? 320 : 420;
        filter.frequency.setValueAtTime(baseCutoff + Math.sin(this.chordIndex) * 70, t);
        filter.frequency.linearRampToValueAtTime(baseCutoff + 120, t + chordDuration * 0.5);

        // Envelope
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.035, t + 1.0);
        gain.gain.setValueAtTime(0.035, t + Math.max(1.1, chordDuration - 1.0));
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
    this.musicIntervalId = window.setInterval(stepChord, 3600);
  }

  public setRadioStation(stationId: string) {
    this.currentStationId = stationId;
    this.playRadioTuning();
    if (this.musicIntervalId !== null) {
      this.stopAmbientMusic();
      this.startAmbientMusic();
    }
  }

  /**
   * Radio tuning analog static burst
   */
  public playRadioTuning() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;

    // Filtered noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.16);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  /**
   * Sound when an emergency dispatch is started
   */
  public playQuestStart() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const notes = [329.63, 440.0, 554.37, 659.25]; // E4, A4, C#5, E5

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * Urgent dispatch timer tick warning
   */
  public playQuestTick() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.05);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Winter Pass Tier Level-Up & Claim Chimes
   */
  public playPassClaimSound() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const chords = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6

    chords.forEach((freq, idx) => {
      const noteTime = t + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  public playBlizzardWarningSound() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.35);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Quest completed successfully fanfare
   */
  public playQuestSuccess() {
    if (!this.ctx || !this.sfxGain || !this.isSfxEnabled) return;
    const t = this.ctx.currentTime;
    const melody = [
      { f: 440.0, d: 0.12 },
      { f: 554.37, d: 0.12 },
      { f: 659.25, d: 0.14 },
      { f: 880.0, d: 0.4 },
    ];

    let accum = 0;
    melody.forEach((m) => {
      const noteTime = t + accum;
      accum += m.d;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m.f, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + m.d * 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(noteTime);
      osc.stop(noteTime + m.d * 1.6);
    });
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
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public setMute(muted: boolean): boolean {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public setMasterVolume(vol: number) {
    this.masterVol = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVol = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && this.isMusicEnabled) {
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVol = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && this.isSfxEnabled) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    }
  }

  public toggleMusic(): boolean {
    this.isMusicEnabled = !this.isMusicEnabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMusicEnabled ? this.musicVol : 0, this.ctx.currentTime);
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
      this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? this.sfxVol : 0, this.ctx.currentTime);
    }
    return this.isSfxEnabled;
  }

  public getSettings() {
    return {
      isMuted: this.isMuted,
      isMusicEnabled: this.isMusicEnabled,
      isSfxEnabled: this.isSfxEnabled,
      masterVolume: this.masterVol,
      musicVolume: this.musicVol,
      sfxVolume: this.sfxVol,
    };
  }
}

export const synthAudio = new SynthAudioEngine();
