import { Song, SeasonType } from '../types';

class AudioEngine {
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private synthGain: GainNode | null = null;
  private synthOscillators: OscillatorNode[] = [];
  private isSynthesizing = false;
  private synthTimer: number | null = null;
  private currentSource: 'local' | 'synthesizer' = 'local';
  private localBlobMap: Map<string, string> = new Map(); // fileName or id -> Object URL
  private onTimeUpdateCallback?: (currentTime: number, duration: number) => void;
  private onEndedCallback?: () => void;
  private onStateChangeCallback?: (isPlaying: boolean, source: 'local' | 'synthesizer') => void;

  private currentSong: Song | null = null;
  private synthStartTime = 0;
  private synthEstimatedDuration = 180;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => {
      if (this.currentSource === 'local' && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    this.audio.addEventListener('error', () => {
      // If local file is missing or cannot load, fallback to soothing seasonal synthesizer
      this.fallbackToSynth();
    });
  }

  public registerLocalFile(filename: string, file: File) {
    const url = URL.createObjectURL(file);
    this.localBlobMap.set(filename.toLowerCase(), url);
    this.localBlobMap.set(file.name.toLowerCase(), url);
  }

  public registerMultipleFiles(files: FileList | File[]) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      this.localBlobMap.set(file.name.toLowerCase(), url);
      const match = file.name.match(/^(\d{1,3})/);
      if (match) {
        const dayNum = parseInt(match[1], 10);
        this.localBlobMap.set(`day_${dayNum}`, url);
      }
    }
  }

  public hasLocalFile(song: Song): boolean {
    if (song.localAudioUrl) return true;
    if (song.fileName && this.localBlobMap.has(song.fileName.toLowerCase())) return true;
    if (this.localBlobMap.has(`day_${song.day}`)) return true;
    return false;
  }

  public getAvailableLocalUrl(song: Song): string | null {
    if (song.localAudioUrl) return song.localAudioUrl;
    if (song.fileName && this.localBlobMap.has(song.fileName.toLowerCase())) {
      return this.localBlobMap.get(song.fileName.toLowerCase())!;
    }
    if (this.localBlobMap.has(`day_${song.day}`)) {
      return this.localBlobMap.get(`day_${song.day}`)!;
    }
    if (song.fileName) {
      return `/musics/${song.fileName}`;
    }
    return `/musics/${String(song.day).padStart(3, '0')}.mp3`;
  }

  public async playSong(song: Song): Promise<void> {
    this.stopSynth();
    this.currentSong = song;

    const url = this.getAvailableLocalUrl(song);
    if (!url) {
      this.fallbackToSynth();
      return;
    }

    this.audio.src = url;
    this.currentSource = 'local';

    try {
      this.initAudioContext();
      await this.audio.play();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true, 'local');
      }
    } catch {
      this.fallbackToSynth();
    }
  }

  public pause(): void {
    if (this.currentSource === 'local') {
      this.audio.pause();
    } else {
      this.stopSynth();
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false, this.currentSource);
    }
  }

  public resume(): void {
    if (this.currentSource === 'local' && this.audio.src) {
      this.audio.play().catch(() => this.fallbackToSynth());
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true, 'local');
      }
    } else if (this.currentSong) {
      this.startSynth(this.currentSong.season);
    }
  }

  public seek(seconds: number): void {
    if (this.currentSource === 'local') {
      this.audio.currentTime = seconds;
    } else {
      this.synthStartTime = Date.now() - seconds * 1000;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(seconds, this.synthEstimatedDuration);
      }
    }
  }

  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(clamped * 0.15, this.audioCtx.currentTime);
    }
  }

  public setCallbacks(callbacks: {
    onTimeUpdate?: (currentTime: number, duration: number) => void;
    onEnded?: () => void;
    onStateChange?: (isPlaying: boolean, source: 'local' | 'synthesizer') => void;
  }) {
    this.onTimeUpdateCallback = callbacks.onTimeUpdate;
    this.onEndedCallback = callbacks.onEnded;
    this.onStateChangeCallback = callbacks.onStateChange;
  }

  // --- Frequency Data for Visualizers ---
  public getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // --- Seasonal Ambient Synthesizer Engine ---
  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      try {
        if (!this.audioSourceNode) {
          this.audioSourceNode = this.audioCtx.createMediaElementSource(this.audio);
          this.audioSourceNode.connect(this.analyser);
          this.analyser.connect(this.audioCtx.destination);
        }
      } catch {
        // Source already connected or restricted
      }

      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.value = this.audio.volume * 0.15;
      this.synthGain.connect(this.analyser);
      this.synthGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private fallbackToSynth() {
    if (!this.currentSong) return;
    this.audio.pause();
    this.currentSource = 'synthesizer';
    this.startSynth(this.currentSong.season);
  }

  private startSynth(season: SeasonType) {
    this.initAudioContext();
    if (!this.audioCtx || !this.synthGain) return;

    this.stopSynth();
    this.isSynthesizing = true;
    this.currentSource = 'synthesizer';
    this.synthStartTime = Date.now();
    this.synthEstimatedDuration = this.currentSong
      ? this.parseDurationToSeconds(this.currentSong.duration)
      : 210;

    const seasonChords: Record<SeasonType, number[][]> = {
      Spring: [
        [261.63, 329.63, 392.0, 523.25], // C Major
        [349.23, 440.0, 523.25, 659.25], // F Major 7
        [392.0, 493.88, 587.33, 783.99], // G Major
      ],
      Summer: [
        [293.66, 369.99, 440.0, 587.33], // D Major
        [220.0, 277.18, 329.63, 440.0],  // A Major
        [329.63, 415.3, 493.88, 659.25], // E Major
      ],
      Autumn: [
        [220.0, 261.63, 329.63, 440.0],  // A Minor
        [174.61, 220.0, 261.63, 349.23], // F Major
        [261.63, 329.63, 392.0, 523.25], // C Major
        [196.0, 246.94, 293.66, 392.0],  // G Major
      ],
      Winter: [
        [146.83, 174.61, 220.0, 293.66], // D Minor
        [130.81, 164.81, 196.0, 261.63], // C Minor
        [110.0, 130.81, 164.81, 220.0],  // A Minor
        [98.0, 123.47, 146.83, 196.0],   // G Minor
      ],
    };

    const chords = seasonChords[season] || seasonChords.Winter;
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isSynthesizing || !this.audioCtx || !this.synthGain) return;

      this.synthOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.synthOscillators = [];

      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach((freq, idx) => {
        if (!this.audioCtx || !this.synthGain) return;
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();

        if (season === 'Winter') {
          osc.type = idx === 0 ? 'sawtooth' : 'sine';
        } else if (season === 'Autumn') {
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        } else if (season === 'Summer') {
          osc.type = 'sine';
        } else {
          osc.type = 'triangle';
        }

        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        const now = this.audioCtx.currentTime;
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 1.2);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 5.8);

        osc.connect(noteGain);
        noteGain.connect(this.synthGain);
        osc.start(now);
        osc.stop(now + 6.0);
        this.synthOscillators.push(osc);
      });
    };

    playChord();

    const updateLoop = () => {
      if (!this.isSynthesizing) return;
      const elapsed = (Date.now() - this.synthStartTime) / 1000;

      if (elapsed >= this.synthEstimatedDuration) {
        this.stopSynth();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
        return;
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(elapsed, this.synthEstimatedDuration);
      }

      if (Math.floor(elapsed) % 6 === 0 && Math.floor(elapsed) > 0) {
        playChord();
      }

      this.synthTimer = window.setTimeout(updateLoop, 500);
    };

    this.synthTimer = window.setTimeout(updateLoop, 500);

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(true, 'synthesizer');
    }
  }

  private stopSynth() {
    this.isSynthesizing = false;
    if (this.synthTimer !== null) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
    this.synthOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.synthOscillators = [];
  }

  private parseDurationToSeconds(durStr: string): number {
    const parts = durStr.split(':').map((p) => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    return 180;
  }
}

export const audioEngine = new AudioEngine();
