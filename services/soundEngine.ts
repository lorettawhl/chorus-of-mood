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
  private isMuted: boolean = false;

  constructor() {}

  public prepare() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.initConnections();
      this.loadSamples();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
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

    for (const [level, url] of Object.entries(AUDIO_FILES)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.buffers.set(level as ArousalLevel, audioBuffer);
        console.log(`Loaded sample for ${level}: ${url}`);
        
        // Auto-start this track if startAllTracks was already called
        if (this.isStarted && this.masterGain) {
          this.startSingleTrack(level as ArousalLevel, audioBuffer);
        }
      } catch (e) {
        console.warn(`Could not load sample for ${level} (${url}).`, e);
      }
    }
  }

  private startSingleTrack(level: ArousalLevel, buffer: AudioBuffer) {
    if (!this.ctx || !this.masterGain) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    
    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(this.ctx.currentTime);

    this.trackGains.set(level, gain);
    console.log(`Started track: ${level}`);
  }

  public startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted) return;
    
    console.log("Starting all tracks...");
    this.isStarted = true;

    // Start any tracks that are already loaded
    for (const [level, buffer] of this.buffers.entries()) {
      this.startSingleTrack(level, buffer);
    }
    
    // Tracks still loading will auto-start when they finish loading
    console.log("Tracks started (or will start when loaded)");
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
    if (gain && this.ctx) {
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
