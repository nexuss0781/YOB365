import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Radio,
  Maximize2,
  ChevronUp,
} from 'lucide-react';
import { Song } from '../types';
import { seasonInfo } from '../data/defaultCatalog';
import { audioEngine } from '../utils/audioEngine';

interface BottomPlayerProps {
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
  isNowPlayingOpen: boolean;
  onToggleNowPlaying: () => void;
  audioSourceType: 'local' | 'synthesizer';
  onOpenFullscreen?: () => void;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
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
  isNowPlayingOpen,
  onToggleNowPlaying,
  audioSourceType,
  onOpenFullscreen,
}) => {
  const [equalizerBars, setEqualizerBars] = useState<number[]>([40, 70, 30, 90]);

  useEffect(() => {
    if (!isPlaying) return;
    let animFrame: number;

    const loop = () => {
      const freq = audioEngine.getFrequencyData();
      if (freq && freq.length >= 4) {
        setEqualizerBars([
          Math.max(20, (freq[2] / 255) * 100),
          Math.max(20, (freq[6] / 255) * 100),
          Math.max(20, (freq[10] / 255) * 100),
          Math.max(20, (freq[14] / 255) * 100),
        ]);
      } else {
        const t = Date.now() / 200;
        setEqualizerBars([
          20 + Math.abs(Math.sin(t)) * 70,
          20 + Math.abs(Math.sin(t + 1)) * 80,
          20 + Math.abs(Math.cos(t * 1.2)) * 65,
          20 + Math.abs(Math.sin(t * 1.5)) * 75,
        ]);
      }
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const info = seasonInfo[currentSong.season];

  return (
    <>
      {/* MOBILE MINI PLAYER BAR (< 640px) */}
      <div className="sm:hidden fixed bottom-14 left-2 right-2 z-30 bg-[#202020]/95 backdrop-blur-md rounded-lg border border-white/10 shadow-2xl p-2 flex flex-col select-none text-white">
        {/* Progress Line */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-[#1db954] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Track Info (Tapping opens Fullscreen) */}
          <div
            onClick={onOpenFullscreen || onToggleNowPlaying}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded bg-[#282828] shrink-0 flex flex-col items-center justify-center font-black text-xs relative overflow-hidden border border-white/10"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${info.themeColor}50, #222)`,
              }}
            >
              <span className="text-[8px] font-bold text-white/80">{currentSong.season[0]}</span>
              <span className="text-[11px] font-black text-white">{currentSong.day}</span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{currentSong.title}</span>
              <span className="text-[10px] text-[#a7a7a7] truncate">{currentSong.artist}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onToggleLike(currentSong.id)}
              className="p-2 text-[#727272] hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Like"
            >
              <Heart
                className={`w-4 h-4 ${currentSong.liked ? 'fill-[#1db954] text-[#1db954]' : ''}`}
              />
            </button>

            <button
              onClick={onTogglePlay}
              className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-[#b3b3b3] hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP & TABLET BOTTOM PLAYER BAR (>= 640px) */}
      <footer
        id="spotify-bottom-player"
        className="hidden sm:flex h-20 bg-[#181818] border-t border-white/5 px-4 sm:px-6 items-center justify-between z-30 select-none text-white relative shrink-0"
      >
        {/* Left: Track Information */}
        <div className="flex items-center gap-3 w-1/4 min-w-[160px] md:min-w-[220px]">
          {/* Cover Art Mini with live equalizer pulse */}
          <div
            onClick={onToggleNowPlaying}
            className="w-13 h-13 rounded bg-[#282828] shrink-0 flex flex-col items-center justify-center font-black text-xs cursor-pointer overflow-hidden relative group border border-white/10"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${info.themeColor}40, #242424)`,
            }}
          >
            <span className="text-[9px] uppercase font-bold text-white/80">{currentSong.season}</span>
            <span className="text-xs font-black text-white">D{currentSong.day}</span>

            {/* Mini active equalizer overlay */}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center gap-0.5 pb-1 px-1">
                {equalizerBars.map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#1db954] rounded-full transition-all duration-75"
                    style={{ height: `${h * 0.4}%` }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <button
              onClick={onToggleNowPlaying}
              className="text-sm font-semibold truncate text-white hover:underline text-left cursor-pointer"
            >
              {currentSong.title}
            </button>
            <span className="text-xs text-[#a7a7a7] truncate hover:text-white transition-colors">
              {currentSong.artist}
            </span>
          </div>

          <button
            onClick={() => onToggleLike(currentSong.id)}
            className={`p-2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              currentSong.liked ? 'text-[#1db954] fill-[#1db954]' : 'text-[#727272] hover:text-white'
            }`}
            title={currentSong.liked ? 'Remove from Liked' : 'Save to Liked'}
          >
            <Heart className={`w-4 h-4 ${currentSong.liked ? 'fill-[#1db954]' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl md:max-w-2xl px-2">
          {/* Control Buttons */}
          <div className="flex items-center gap-3 md:gap-5">
            <button
              onClick={onToggleShuffle}
              className={`p-2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title="Enable Shuffle (S)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrev}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Previous Track (Ctrl + ←)"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              id="btn-bottom-play-pause"
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform shadow-md cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Next Track (Ctrl + →)"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={onToggleRepeat}
              className={`p-2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={`Repeat: ${repeatMode} (R)`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Scrubber Bar */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-[#a7a7a7]">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 flex items-center group py-1">
              <input
                type="range"
                min={0}
                max={duration || 180}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1 bg-[#4d4d4d] group-hover:bg-[#5e5e5e] rounded-lg appearance-none cursor-pointer accent-[#1db954] focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #1db954 ${progressPercent}%, #4d4d4d ${progressPercent}%)`,
                }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Sound Source, Fullscreen, Volume & Panel toggles */}
        <div className="flex items-center justify-end gap-2 md:gap-3 w-1/4 min-w-[140px] md:min-w-[200px]">
          {/* Source indicator */}
          <div
            className={`hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              audioSourceType === 'local'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
            }`}
            title={audioSourceType === 'local' ? 'Local audio file' : 'Synthesizer Playback'}
          >
            {audioSourceType === 'local' ? (
              <span>musics/</span>
            ) : (
              <>
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                <span>Synth</span>
              </>
            )}
          </div>

          {/* Fullscreen Theater Mode Button */}
          {onOpenFullscreen && (
            <button
              onClick={onOpenFullscreen}
              className="p-2 text-[#b3b3b3] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Fullscreen Theater View (F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          {/* Now Playing Panel Toggle */}
          <button
            onClick={onToggleNowPlaying}
            className={`p-2 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isNowPlayingOpen ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Toggle Now Playing view"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Slider */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-[#b3b3b3] hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 md:w-20 h-1 bg-[#4d4d4d] hover:bg-[#5e5e5e] rounded-lg appearance-none cursor-pointer accent-[#1db954]"
              style={{
                background: `linear-gradient(to right, #1db954 ${
                  (isMuted ? 0 : volume) * 100
                }%, #4d4d4d ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>
      </footer>
    </>
  );
};
