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
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private isStarted: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    // Preload samples immediately
    this.preloadSamples();
  }

  private async preloadSamples() {
    console.log("Preloading audio samples...");

    for (const [key, url] of Object.entries(AUDIO_FILES)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        // Store raw array buffer - decode later when context exists
        this.buffers.set(key + '_raw', arrayBuffer as any);
        console.log(`Preloaded: ${key}`);
      } catch (e) {
        console.warn(`Could not preload ${key} (${url}).`, e);
      }
    }
  }

  public prepare() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
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
  }

  private async decodeBuffers() {
    if (!this.ctx) return;

    for (const [key, url] of Object.entries(AUDIO_FILES)) {
      const rawBuffer = this.buffers.get(key + '_raw');
      if (rawBuffer && !this.buffers.has(key)) {
        try {
          const audioBuffer = await this.ctx.decodeAudioData((rawBuffer as any).slice(0));
          this.buffers.set(key, audioBuffer);
          console.log(`Decoded: ${key}`);
        } catch (e) {
          console.warn(`Could not decode ${key}`, e);
        }
      }
    }
  }

  public async startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted) return;

    console.log("startAllTracks called");
    this.isStarted = true;

    // Decode any preloaded buffers
    await this.decodeBuffers();

    // Start all tracks simultaneously
    const startTime = this.ctx.currentTime;

    for (const [key, url] of Object.entries(AUDIO_FILES)) {
      const buffer = this.buffers.get(key);
      if (!buffer || this.trackGains.has(key)) continue;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      // Base track starts audible, others start muted
      gain.gain.value = key === 'base' ? 0.8 : 0;

      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(startTime);

      this.sources.set(key, source);
      this.trackGains.set(key, gain);
      console.log(`Started track: ${key} (${key === 'base' ? 'audible' : 'muted'})`);
    }

    console.log("All tracks started");
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
      console.log(`Unmuting track: ${level}`);
      gain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.3);
    }
  }

  public stopSound(level: ArousalLevel) {
    if (!this.ctx) return;

    const gain = this.trackGains.get(level);
    if (gain) {
      console.log(`Muting track: ${level}`);
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }
}

export const soundEngine = new SoundEngine();
