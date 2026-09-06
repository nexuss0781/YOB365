import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  Minimize2,
} from 'lucide-react';
import { Song } from '../types';
import { seasonInfo } from '../data/defaultCatalog';
import { formatFullDate } from '../utils/calendar';
import { audioEngine } from '../utils/audioEngine';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: (songId: number) => void;
}

export const FullscreenPlayer: React.FC<FullscreenPlayerProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
}) => {
  const [visualBars, setVisualBars] = useState<number[]>(new Array(24).fill(10));

  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    let animFrame: number;

    const updateViz = () => {
      const freq = audioEngine.getFrequencyData();
      if (freq) {
        const bars: number[] = [];
        const step = Math.floor(freq.length / 24) || 1;
        for (let i = 0; i < 24; i++) {
          const val = freq[i * step] || 0;
          bars.push(Math.max(8, (val / 255) * 100));
        }
        setVisualBars(bars);
      } else {
        const time = Date.now() / 300;
        setVisualBars(
          Array.from(
            { length: 24 },
            (_, i) => 15 + Math.sin(time + i * 0.4) * 35 + Math.cos(time * 0.7 + i) * 20
          )
        );
      }
      animFrame = requestAnimationFrame(updateViz);
    };

    animFrame = requestAnimationFrame(updateViz);
    return () => cancelAnimationFrame(animFrame);
  }, [isOpen, isPlaying]);

  if (!isOpen || !currentSong) return null;

  const info = seasonInfo[currentSong.season];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080808] flex flex-col justify-between p-4 sm:p-8 md:p-12 select-none text-white overflow-y-auto overflow-x-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute inset-0 opacity-25 blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${info.themeColor} 0%, transparent 70%)`,
        }}
      />

      {/* Top Bar */}
      <div className="flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 flex items-center justify-center font-black text-xs">
            YOB
          </div>
          <div>
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#a7a7a7]">
              YOB 365 • {currentSong.season}
            </h3>
            <p className="text-[11px] sm:text-xs font-medium text-white/70">
              Day {currentSong.day} ({formatFullDate(currentSong.day)})
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Exit Fullscreen (Esc or F)"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Center Display: Vinyl Artwork & Real-Time Waveform */}
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 my-auto z-10 max-w-4xl mx-auto w-full py-4">
        {/* Artwork */}
        <div
          className={`w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-4 sm:p-6 text-center border border-white/15 transition-transform duration-700 ${
            isPlaying ? 'scale-105 shadow-2xl shadow-[#1db954]/20' : 'scale-95 opacity-90'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 30%, ${info.themeColor}50, #141414 90%)`,
          }}
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-black/50 border border-white/20 flex items-center justify-center mb-2 sm:mb-3 shadow-inner">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{
                animationDuration: '6s',
                backgroundColor: info.themeColor,
                color: '#000',
              }}
            >
              D{currentSong.day}
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white">
            {currentSong.season}
          </span>
          <span className="text-[10px] sm:text-xs text-white/60 font-semibold mt-0.5 font-mono truncate max-w-full px-2">
            {currentSong.fileName || `musics/${currentSong.day}.mp3`}
          </span>
        </div>

        {/* Real-Time Audio Frequency Waveform Visualizer */}
        <div className="flex items-end justify-center gap-1 sm:gap-1.5 h-10 sm:h-14 w-full max-w-xs sm:max-w-md px-2">
          {visualBars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-full transition-all duration-75"
              style={{
                height: `${height}%`,
                backgroundColor: isPlaying ? info.themeColor : '#444',
                opacity: isPlaying ? 0.9 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Track Title & Artist */}
        <div className="text-center flex flex-col items-center gap-1 sm:gap-2 max-w-2xl px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-3 max-w-full">
            <h1 className="text-lg sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight truncate max-w-[240px] sm:max-w-md">
              {currentSong.title}
            </h1>
            <button
              onClick={() => onToggleLike(currentSong.id)}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#727272] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  currentSong.liked ? 'fill-[#1db954] text-[#1db954]' : ''
                }`}
              />
            </button>
          </div>
          <p className="text-sm sm:text-lg text-[#b3b3b3] font-medium">{currentSong.artist}</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 max-w-2xl mx-auto w-full z-10 shrink-0">
        {/* Scrubber */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[#a7a7a7]">
          <span>{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group py-1">
            <input
              type="range"
              min={0}
              max={duration || 180}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#333] group-hover:bg-[#444] rounded-lg appearance-none cursor-pointer accent-[#1db954]"
              style={{
                background: `linear-gradient(to right, #1db954 ${progressPercent}%, #333 ${progressPercent}%)`,
              }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleShuffle}
              className={`p-2.5 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isShuffle ? 'text-[#1db954] bg-[#1db954]/10' : 'text-[#a7a7a7] hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onPrev}
              className="p-2 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Previous"
            >
              <SkipBack className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-[#1db954] text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer min-h-[48px] min-w-[48px]"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-white/80 hover:text-white hover:scale-110 transition-transform cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Next"
            >
              <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onToggleRepeat}
              className={`p-2.5 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                repeatMode !== 'off'
                  ? 'text-[#1db954] bg-[#1db954]/10'
                  : 'text-[#a7a7a7] hover:text-white'
              }`}
              title="Repeat"
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="text-[#a7a7a7] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 md:w-24 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#1db954]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
