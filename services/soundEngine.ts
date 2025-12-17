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

    // If tracks were already started, begin the WAV tracks now
    if (this.isStarted) {
      this.startWavTracks();
    }
  }

  private startWavTracks() {
    if (!this.ctx || !this.masterGain) return;

    console.log("Starting all tracks...");
    const startTime = this.ctx.currentTime;

    for (const [level, buffer] of this.buffers.entries()) {
      if (this.trackGains.has(level)) continue;

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

    console.log("All tracks started (muted)");
  }

  public startAllTracks() {
    if (!this.ctx || !this.masterGain || this.isStarted) return;

    console.log("startAllTracks called");
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
