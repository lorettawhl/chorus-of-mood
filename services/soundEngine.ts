import { ArousalLevel } from '../types';

/**
 * CONFIGURATION
 * Place your audio files in the 'public/sounds' folder of your project.
 * Ensure the filenames match the paths below.
 */
const AUDIO_FILES = {
  [ArousalLevel.LOW]: '/sounds/low.mp3',   // e.g. public/sounds/low.mp3
  [ArousalLevel.MID]: '/sounds/mid.mp3',   // e.g. public/sounds/mid.mp3
  [ArousalLevel.HIGH]: '/sounds/high.mp3', // e.g. public/sounds/high.mp3
};

/**
 * SoundEngine generates audio using Web Audio API.
 * It prioritizes loading external samples but falls back to procedural synthesis
 * if files are not found.
 */
class SoundEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources: Map<ArousalLevel, any> = new Map();
  private buffers: Map<ArousalLevel, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;
  
  // SYNC CONFIG
  private readonly BEAT_GRID = 2.0; // 2 seconds per bar (60BPM / 2)

  constructor() {}

  /**
   * MOBILE UNLOCKER (iOS Fix)
   * This must be called on 'onTouchStart' or 'onClick'.
   * It plays a silent buffer to physically wake up the device speaker.
   */
  public prepare() {
    // 1. Create Context Synchronously if missing
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
      this.loadSamples(); // Background load
    }

    // 2. THE IOS MAGIC TRICK: Play a silent sound
    // This forces the DSP to switch from "Suspend" to "Running" immediately.
    if (this.ctx) {
        // Create empty buffer
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        
        // Play instant
        if (source.start) source.start(0);
        else (source as any).noteOn(0);

        // Resume context
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
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  private async loadSamples() {
    if (!this.ctx) return;

    console.log("Attempting to load audio samples...");

    for (const [level, url] of Object.entries(AUDIO_FILES)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(level as ArousalLevel, audioBuffer);
        console.log(`Loaded sample for ${level}`);
      } catch (e) {
        console.warn(`Could not load sample for ${level} (${url}). Using fallback synthesizer.`);
      }
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
  }

  /**
   * Calculates the next exact grid time to ensure sync.
   */
  private getNextGridTime(): number {
    if (!this.ctx) return 0;
    const now = this.ctx.currentTime;
    // Calculate time remaining until the next multiple of BEAT_GRID
    const timeToNext = this.BEAT_GRID - (now % this.BEAT_GRID);
    return now + timeToNext;
  }

  public startSound(level: ArousalLevel) {
    if (!this.ctx) this.prepare(); // Last ditch effort
    if (!this.ctx) return;
    
    if (this.sources.has(level)) return; // Already playing

    let stopFn = () => {};

    // Check if we have a loaded sample for this level
    if (this.buffers.has(level)) {
      stopFn = this.playSample(level);
    } else {
      // Fallback to synthesizer
      if (level === ArousalLevel.LOW) stopFn = this.playLowSynth();
      else if (level === ArousalLevel.MID) stopFn = this.playMidSynth();
      else if (level === ArousalLevel.HIGH) stopFn = this.playHighSynth();
    }

    this.sources.set(level, { stop: stopFn });
  }

  public stopSound(level: ArousalLevel) {
    const sound = this.sources.get(level);
    if (sound) {
      sound.stop();
      this.sources.delete(level);
    }
  }

  // --- SAMPLE PLAYER ---
  private playSample(level: ArousalLevel) {
    if (!this.ctx || !this.masterGain) return () => {};
    const buffer = this.buffers.get(level);
    if (!buffer) return () => {};

    // CONFIG: Low arousal (Nature) should start INSTANTLY for feedback.
    // Mid/High should wait for the grid to sync up.
    let startTime = this.ctx.currentTime;
    
    if (level !== ArousalLevel.LOW) {
        startTime = this.getNextGridTime();
    }
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    
    source.connect(gain);
    gain.connect(this.masterGain);

    source.start(startTime);
    // Schedule fade in at start time
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.8, startTime + 2);

    return () => {
        if (!this.ctx) return;
        gain.gain.setTargetAtTime(0, this.ctx.currentTime, 1); // Fade out
        setTimeout(() => {
            source.stop();
            gain.disconnect();
        }, 1200);
    };
  }

  // --- FALLBACK SYNTHESIZERS ---

  /**
   * LOW AROUSAL: Birds Only (Removed Water/Noise)
   */
  private playLowSynth() {
    if (!this.ctx || !this.masterGain) return () => {};
    let isPlaying = true;
    
    const birdGain = this.ctx.createGain();
    birdGain.gain.value = 0.15; // Gentle volume
    birdGain.connect(this.masterGain);

    const chirp = () => {
        if (!isPlaying || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        
        // Bird frequencies
        osc.frequency.setValueAtTime(2500 + Math.random() * 1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 500, this.ctx.currentTime + 0.15);
        
        env.gain.setValueAtTime(0, this.ctx.currentTime);
        env.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(env);
        env.connect(birdGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);

        // Random intervals
        if (isPlaying) setTimeout(chirp, 1500 + Math.random() * 3000);
    };
    
    // Start birds IMMEDIATELY (No Grid)
    chirp();

    return () => {
      isPlaying = false;
      if (!this.ctx) return;
      birdGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => { 
          birdGain.disconnect();
      }, 500);
    };
  }

  /**
   * MID AROUSAL: Xylophone/Bell Melody (Synced)
   */
  private playMidSynth() {
    if (!this.ctx || !this.masterGain) return () => {};
    let isPlaying = true;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0.6; 

    const melody = [523.25, 493.88, 440.00, 392.00]; // C B A G
    let noteIndex = 0;

    // Quantize Start
    const startTime = this.getNextGridTime();

    const playNote = (nextTime: number) => {
        if (!isPlaying || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = melody[noteIndex];

        // Envelope
        env.gain.setValueAtTime(0, nextTime);
        env.gain.linearRampToValueAtTime(0.6, nextTime + 0.05);
        env.gain.exponentialRampToValueAtTime(0.001, nextTime + 1.8); 

        osc.connect(env);
        env.connect(gain);
        
        osc.start(nextTime);
        osc.stop(nextTime + 2.0);

        noteIndex = (noteIndex + 1) % melody.length;

        // Schedule next note exactly 2.0s later
        const delayUntilNext = (nextTime + 2.0) - this.ctx.currentTime;
        if (delayUntilNext > 0) {
            setTimeout(() => playNote(nextTime + 2.0), delayUntilNext * 1000);
        }
    };

    const initialDelay = (startTime - this.ctx.currentTime) * 1000;
    setTimeout(() => playNote(startTime), initialDelay);

    return () => {
      isPlaying = false;
      if (!this.ctx) return;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      setTimeout(() => gain.disconnect(), 600);
    };
  }

  /**
   * HIGH AROUSAL: Rhythmic Beats (Synced)
   */
  private playHighSynth() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return () => {};
    let isPlaying = true;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);
    gain.gain.value = 0.5;

    // Quantize Start
    const startTime = this.getNextGridTime();

    const triggerKick = (t: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
        env.gain.setValueAtTime(0.8, t);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(env);
        env.connect(gain);
        osc.start(t);
        osc.stop(t + 0.5);
    };

    const triggerSnare = (t: number) => {
        if (!this.ctx || !this.noiseBuffer) return;
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        const env = this.ctx.createGain();
        env.gain.setValueAtTime(0.4, t);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        source.connect(filter);
        filter.connect(env);
        env.connect(gain);
        source.start(t);
        source.stop(t + 0.2);
    };

    const triggerHat = (t: number, open: boolean) => {
        if (!this.ctx || !this.noiseBuffer) return;
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        const env = this.ctx.createGain();
        const vol = open ? 0.15 : 0.05;
        const decay = open ? 0.1 : 0.05;
        env.gain.setValueAtTime(vol, t);
        env.gain.exponentialRampToValueAtTime(0.001, t + decay);
        source.connect(filter);
        filter.connect(env);
        env.connect(gain);
        source.start(t);
        source.stop(t + decay + 0.05);
    };

    const playLoop = (gridTime: number) => {
        if (!isPlaying || !this.ctx) return;
        
        const tempo = 0.25; // 8th notes at 120bpm feel

        // Beat 1
        triggerKick(gridTime);
        triggerHat(gridTime, false);
        // Beat 1.5 (&)
        triggerHat(gridTime + tempo, true);
        // Beat 2
        triggerSnare(gridTime + tempo * 2);
        triggerHat(gridTime + tempo * 2, false);
        // Beat 2.5 (&)
        triggerHat(gridTime + tempo * 3, true);
        // Beat 3
        triggerKick(gridTime + tempo * 4);
        triggerHat(gridTime + tempo * 4, false);
        // Beat 3.5 (&)
        triggerHat(gridTime + tempo * 5, true);
        // Beat 4
        triggerSnare(gridTime + tempo * 6);
        triggerHat(gridTime + tempo * 6, false);
        // Beat 4.5 (&)
        triggerHat(gridTime + tempo * 7, true);

        // Schedule next bar (2.0s later)
        const delayUntilNext = (gridTime + 2.0) - this.ctx.currentTime;
        if (delayUntilNext > 0) {
            setTimeout(() => playLoop(gridTime + 2.0), delayUntilNext * 1000);
        }
    };

    const initialDelay = (startTime - this.ctx.currentTime) * 1000;
    setTimeout(() => playLoop(startTime), initialDelay);

    return () => {
      isPlaying = false;
      if(!this.ctx) return;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      setTimeout(() => { gain.disconnect(); }, 300);
    };
  }
}

export const soundEngine = new SoundEngine();