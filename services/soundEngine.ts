import { ArousalLevel } from '../types';

const AUDIO_FILES = {
  [ArousalLevel.LOW]: '/sounds/0003.wav',
  [ArousalLevel.MID]: '/sounds/0008.wav',
  [ArousalLevel.HIGH]: '/sounds/0015.wav',
};

class SoundEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources: Map<ArousalLevel, any> = new Map();
  private buffers: Map<ArousalLevel, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  
  private readonly BEAT_GRID = 3.5; // 3.5 seconds per bar (4 bars in 14s)

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

    for (const [level, url] of Object.entries(AUDIO_FILES)) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(level as ArousalLevel, audioBuffer);
        console.log(`Loaded sample for ${level}: ${url}`);
      } catch (e) {
        console.warn(`Could not load sample for ${level} (${url}).`, e);
      }
    }
  }

  public setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(mute ? 0 : 0.5, this.ctx.currentTime, 0.1);
    }
  }

  private getNextGridTime(): number {
    if (!this.ctx) return 0;
    const now = this.ctx.currentTime;
    const timeToNext = this.BEAT_GRID - (now % this.BEAT_GRID);
    return now + timeToNext;
  }

  public startSound(level: ArousalLevel) {
    if (!this.ctx) this.prepare();
    if (!this.ctx) return;
    
    if (this.sources.has(level)) return;

    if (this.buffers.has(level)) {
      const stopFn = this.playSample(level);
      this.sources.set(level, { stop: stopFn });
    } else {
      console.warn(`No audio buffer loaded for ${level}`);
    }
  }

  public stopSound(level: ArousalLevel) {
    const sound = this.sources.get(level);
    if (sound) {
      sound.stop();
      this.sources.delete(level);
    }
  }

  private playSample(level: ArousalLevel) {
    if (!this.ctx || !this.masterGain) return () => {};
    const buffer = this.buffers.get(level);
    if (!buffer) return () => {};

    const startTime = this.getNextGridTime();
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    
    source.connect(gain);
    gain.connect(this.masterGain);

    source.start(startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.8, startTime + 0.5);

    return () => {
      if (!this.ctx) return;
      gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        source.stop();
        gain.disconnect();
      }, 400);
    };
  }
}

export const soundEngine = new SoundEngine();
