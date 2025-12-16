import { ArousalLevel } from '../types';

const AUDIO_FILES = {
  [ArousalLevel.LOW]: '/sounds/0003.wav',
  [ArousalLevel.MID]: '/sounds/0008.wav',
  [ArousalLevel.HIGH]: '/sounds/0015.wav',
};

class SoundEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGains: Map<ArousalLevel, GainNode> = new Map();
  private buffers: Map<ArousalLevel, AudioBuffer> = new Map();
  private fallbackSources: Map<ArousalLevel, any> = new Map();
  private isStarted: boolean = false;
  private isLoaded: boolean = false;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {}

  public prepare() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
      this.loadSamples();
    }

    // iOS unlock trick - play silent buffer
    if (this.ctx) {
      const buffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx.destination);
      
      if (source.start) source.start(0);
      else (source as any).noteOn(0);

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  private initConnections() {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
    this.createNoiseBuffer();
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private async loadSamples() {
    if (!this.ctx) return;

    console.log("Loading audio samples...");

    const loadPromises = Object.entries(AUDIO_FILES).map(async ([level, url]) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.buffers.set(level as ArousalLevel, audioBuffer);
        console.log(`Loaded sample for ${level}: ${url}`);
      } catch (e) {
        console.warn(`Could not load sample for ${level} (${url}). Will use fallback.`, e);
      }
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
    console.log(`Samples loaded: ${this.buffers.size}/3`);

    // If tracks were already started, begin the WAV tracks now
    if (this.isStarted && this.buffers.size > 0) {
      this.startWavTracks();
    }
  }

  private startWavTracks() {
    if (!this.ctx || !this.masterGain) return;

    console.log("Starting WAV tracks...");
    const startTime = this.ctx.currentTime;

    for (const [level, buffer] of this.buffers.entries()) {
      if (this.trackGains.has(level)) continue; // Already started

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = 0; // Start muted

      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(startTime);

      this.trackGains.set(level, gain);
      console.log(`Started WAV track: ${level}`);
    }
  }

  public startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted) return;

    console.log("startAllTracks called");
    this.isStarted = true;

    // Start any WAV tracks that are already loaded
    if (this.buffers.size > 0) {
      this.startWavTracks();
    }

    console.log("Tracks initialized (WAVs will start when loaded, fallbacks available)");
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
  }

  public startSound(level: ArousalLevel) {
    if (!this.ctx) return;

    // Check if WAV track is available (loaded and started)
    const gain = this.trackGains.get(level);
    if (gain) {
      console.log(`Unmuting WAV track: ${level}`);
      gain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.3);
      return;
    }

    // WAV not available - use fallback synthesizer
    console.log(`Using fallback synth for: ${level}`);
    if (this.fallbackSources.has(level)) return; // Already playing

    let stopFn = () => {};
    if (level === ArousalLevel.LOW) stopFn = this.playLowSynth();
    else if (level === ArousalLevel.MID) stopFn = this.playMidSynth();
    else if (level === ArousalLevel.HIGH) stopFn = this.playHighSynth();

    this.fallbackSources.set(level, { stop: stopFn });
  }

  public stopSound(level: ArousalLevel) {
    if (!this.ctx) return;

    // Try to mute WAV track
    const gain = this.trackGains.get(level);
    if (gain) {
      console.log(`Muting WAV track: ${level}`);
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      return;
    }

    // Stop fallback synth
    const sound = this.fallbackSources.get(level);
    if (sound) {
      console.log(`Stopping fallback synth: ${level}`);
      sound.stop();
      this.fallbackSources.delete(level);
    }
  }

  // --- FALLBACK SYNTHESIZERS (for when WAV files don't load) ---

  private playLowSynth() {
    if (!this.ctx || !this.masterGain) return () => {};
    let isPlaying = true;

    const birdGain = this.ctx.createGain();
    birdGain.gain.value = 0.15;
    birdGain.connect(this.masterGain);

    const chirp = () => {
      if (!isPlaying || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      osc.frequency.setValueAtTime(2500 + Math.random() * 1000, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 500, this.ctx.currentTime + 0.15);

      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(env);
      env.connect(birdGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);

      if (isPlaying) setTimeout(chirp, 1500 + Math.random() * 3000);
    };

    chirp();

    return () => {
      isPlaying = false;
      if (!this.ctx) return;
      birdGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => birdGain.disconnect(), 500);
    };
  }

  private playMidSynth() {
    if (!this.ctx || !this.masterGain) return () => {};
    let isPlaying = true;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0.6;

    const melody = [523.25, 493.88, 440.00, 392.00];
    let noteIndex = 0;

    const playNote = () => {
      if (!isPlaying || !this.ctx) return;

      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = melody[noteIndex];

      env.gain.setValueAtTime(0, this.ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      osc.connect(env);
      env.connect(gain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);

      noteIndex = (noteIndex + 1) % melody.length;

      if (isPlaying) setTimeout(playNote, 2000);
    };

    playNote();

    return () => {
      isPlaying = false;
      if (!this.ctx) return;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => gain.disconnect(), 600);
    };
  }

  private playHighSynth() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return () => {};
    let isPlaying = true;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0.5;

    const triggerKick = () => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      env.gain.setValueAtTime(0.8, this.ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(env);
      env.connect(gain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    };

    const triggerSnare = () => {
      if (!this.ctx || !this.noiseBuffer) return;
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      const env = this.ctx.createGain();
      env.gain.setValueAtTime(0.4, this.ctx.currentTime);
      env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      source.connect(filter);
      filter.connect(env);
      env.connect(gain);
      source.start();
      source.stop(this.ctx.currentTime + 0.2);
    };

    let beatCount = 0;
    const playBeat = () => {
      if (!isPlaying || !this.ctx) return;
      
      if (beatCount % 2 === 0) {
        triggerKick();
      } else {
        triggerSnare();
      }
      beatCount++;
      
      if (isPlaying) setTimeout(playBeat, 500);
    };

    playBeat();

    return () => {
      isPlaying = false;
      if (!this.ctx) return;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      setTimeout(() => gain.disconnect(), 300);
    };
  }
}

export const soundEngine = new SoundEngine();
