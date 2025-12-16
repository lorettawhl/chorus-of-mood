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
  private isStarted: boolean = false;
  private isLoaded: boolean = false;
  private isMuted: boolean = false;

  constructor() {}

  public prepare() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
      this.loadSamples();
    }

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
        console.warn(`Could not load sample for ${level} (${url}).`, e);
      }
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
    console.log("All samples loaded, ready to play");
  }

  private startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted || !this.isLoaded) return;
    
    console.log("Starting all tracks...");
    const startTime = this.ctx.currentTime;

    for (const [level, buffer] of this.buffers.entries()) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      
      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(startTime);

      this.trackGains.set(level, gain);
      console.log(`Started track: ${level}`);
    }

    this.isStarted = true;
    console.log("All tracks started (muted)");
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
  }

  public async startSound(level: ArousalLevel) {
    if (!this.ctx) this.prepare();
    if (!this.ctx) return;
    
    // Wait for samples to load if not ready
    if (!this.isLoaded) {
      console.log("Waiting for samples to load...");
      await new Promise<void>(resolve => {
        const checkLoaded = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);
      });
    }

    // Start all tracks on first interaction
    if (!this.isStarted) {
      this.startAllTracks();
    }

    // Unmute this track
    const gain = this.trackGains.get(level);
    if (gain && this.ctx) {
      console.log(`Unmuting track: ${level}`);
      gain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.3);
    }
  }

  public stopSound(level: ArousalLevel) {
    if (!this.ctx) return;
    
    // Mute this track (but keep it playing)
    const gain = this.trackGains.get(level);
    if (gain) {
      console.log(`Muting track: ${level}`);
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    }
  }
}

export const soundEngine = new SoundEngine();
