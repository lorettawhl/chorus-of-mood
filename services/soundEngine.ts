import { ArousalLevel } from '../types';

const BASE_TRACK = '/sounds/0001.wav';

const AUDIO_TRACKS: Record<ArousalLevel, string[]> = {
  [ArousalLevel.LOW]: [
    '/sounds/0003.wav',
    '/sounds/0004.wav',
    '/sounds/0005.wav',
    '/sounds/0006.wav',
    '/sounds/0007.wav',
  ],
  [ArousalLevel.MID]: [
    '/sounds/0008.wav',
    '/sounds/0009.wav',
    '/sounds/0010.wav',
    '/sounds/0011.wav',
    '/sounds/0012.wav',
    '/sounds/0013.wav',
    '/sounds/0014.wav',
  ],
  [ArousalLevel.HIGH]: [
    '/sounds/0015.wav',
    '/sounds/0016.wav',
    '/sounds/0017.wav',
    '/sounds/0018.wav',
    '/sounds/0019.wav',
  ],
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private baseBuffer: AudioBuffer | null = null;
  private baseGain: GainNode | null = null;
  private baseSource: AudioBufferSourceNode | null = null;
  
  // Store buffers for all tracks
  private trackBuffers: Map<string, AudioBuffer> = new Map();
  // Store gain nodes for all tracks
  private trackGains: Map<string, GainNode> = new Map();
  // Store source nodes for all tracks
  private trackSources: Map<string, AudioBufferSourceNode> = new Map();
  
  // Track current index for each arousal level
  private currentIndex: Record<ArousalLevel, number> = {
    [ArousalLevel.LOW]: 0,
    [ArousalLevel.MID]: 0,
    [ArousalLevel.HIGH]: 0,
  };
  
  // Track which level is currently active (unmuted)
  private activeTrack: Record<ArousalLevel, string | null> = {
    [ArousalLevel.LOW]: null,
    [ArousalLevel.MID]: null,
    [ArousalLevel.HIGH]: null,
  };

  private masterGain: GainNode | null = null;

  async prepare(): Promise<void> {
    this.ctx = new AudioContext();
    
    // Play silent buffer immediately for iOS
    const silentBuffer = this.ctx.createBuffer(1, 1, 22050);
    const silentSource = this.ctx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(this.ctx.destination);
    silentSource.start();

    await this.ctx.resume();

    // Create master gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Load base track
    const baseResponse = await fetch(BASE_TRACK);
    const baseData = await baseResponse.arrayBuffer();
    this.baseBuffer = await this.ctx.decodeAudioData(baseData);

    // Load all arousal tracks
    const allTracks = [
      ...AUDIO_TRACKS[ArousalLevel.LOW],
      ...AUDIO_TRACKS[ArousalLevel.MID],
      ...AUDIO_TRACKS[ArousalLevel.HIGH],
    ];

    await Promise.all(
      allTracks.map(async (trackPath) => {
        const response = await fetch(trackPath);
        const data = await response.arrayBuffer();
        const buffer = await this.ctx!.decodeAudioData(data);
        this.trackBuffers.set(trackPath, buffer);
      })
    );
  }

  startAllTracks(): void {
    if (!this.ctx || !this.masterGain || !this.baseBuffer) return;

    const now = this.ctx.currentTime + 0.1;

    // Start base track
    this.baseGain = this.ctx.createGain();
    this.baseGain.gain.value = 0.8;
    this.baseGain.connect(this.masterGain);

    this.baseSource = this.ctx.createBufferSource();
    this.baseSource.buffer = this.baseBuffer;
    this.baseSource.loop = true;
    this.baseSource.connect(this.baseGain);
    this.baseSource.start(now);

    // Start all arousal tracks (muted)
    const allTracks = [
      ...AUDIO_TRACKS[ArousalLevel.LOW],
      ...AUDIO_TRACKS[ArousalLevel.MID],
      ...AUDIO_TRACKS[ArousalLevel.HIGH],
    ];

    allTracks.forEach((trackPath) => {
      const buffer = this.trackBuffers.get(trackPath);
      if (!buffer) return;

      const gain = this.ctx!.createGain();
      gain.gain.value = 0; // Start muted
      gain.connect(this.masterGain!);

      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start(now);

      this.trackGains.set(trackPath, gain);
      this.trackSources.set(trackPath, source);
    });
  }

  startSound(level: ArousalLevel): void {
    if (!this.ctx) return;

    const tracks = AUDIO_TRACKS[level];
    const currentIdx = this.currentIndex[level];
    const trackPath = tracks[currentIdx];
    const gain = this.trackGains.get(trackPath);

    if (gain) {
      // Fade in the current track
      gain.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.1);
      this.activeTrack[level] = trackPath;
    }
  }

  stopSound(level: ArousalLevel): void {
    if (!this.ctx) return;

    const currentTrack = this.activeTrack[level];
    if (currentTrack) {
      const gain = this.trackGains.get(currentTrack);
      if (gain) {
        // Fade out
        gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      }
    }

    // Move to next track for next time
    const tracks = AUDIO_TRACKS[level];
    this.currentIndex[level] = (this.currentIndex[level] + 1) % tracks.length;
    this.activeTrack[level] = null;
  }

  setMute(muted: boolean): void {
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
  }
}

export const soundEngine = new SoundEngine();
