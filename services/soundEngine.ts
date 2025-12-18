import { ArousalLevel } from '../types';

const AUDIO_FILES = {
  base: '/sounds/0001.wav',
  [ArousalLevel.LOW]: '/sounds/0003.wav',
  [ArousalLevel.MID]: '/sounds/0008.wav',
  [ArousalLevel.HIGH]: '/sounds/0015.wav',
};

class SoundEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private trackGains: Map<string, GainNode> = new Map();
  private buffers: Map<string, AudioBuffer> = new Map();
  private isStarted: boolean = false;
  private isLoaded: boolean = false;
  private isMuted: boolean = false;

  constructor() {}

  public async prepare() {
    // 1. Initialize Context immediately on user gesture
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
    }

    // 2. IMPORTANT: Resume and play silent buffer IMMEDIATELY 
    // This must happen before any 'await' calls to keep the iOS gesture valid
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Play a tiny silent pop to "wake up" the hardware
    const buffer = this.ctx.createBuffer(1, 1, 22050);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);
    source.start(0);

    // 3. Now that the engine is "unlocked", load the actual files
    if (!this.isLoaded) {
      await this.loadSamples();
    }
  }

  private initConnections() {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.5;
  }

  private async loadSamples() {
    if (!this.ctx) return;

    console.log("Loading audio samples...");

    const loadPromises = Object.entries(AUDIO_FILES).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.buffers.set(key, audioBuffer);
        console.log(`Loaded sample: ${key}`);
      } catch (e) {
        console.warn(`Could not load sample for ${key}`, e);
      }
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
    
    if (this.isStarted) {
      this.startWavTracks();
    }
  }

  private startWavTracks() {
    if (!this.ctx || !this.masterGain) return;

    const startTime = this.ctx.currentTime;

    for (const [key, buffer] of this.buffers.entries()) {
      if (this.trackGains.has(key)) continue;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = key === 'base' ? 0.8 : 0;

      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(startTime);

      this.trackGains.set(key, gain);
    }
  }

  public startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted) return;
    this.isStarted = true;
    if (this.buffers.size > 0) {
      this.startWavTracks();
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
  }

  public startSound(level: ArousalLevel) {
    if (!this.ctx) return;
    const gain = this.trackGains.get(level);
    if (gain) {
      gain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.3);
    }
  }

  public stopSound(level: ArousalLevel) {
    if (!this.ctx) return;
    const gain = this.trackGains.get(level);
    if (gain) {
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }
}

export const soundEngine = new SoundEngine();
