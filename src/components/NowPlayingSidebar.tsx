import React from 'react';
import { X, Heart, Disc, HardDrive, CheckCircle2, ChevronRight, Radio } from 'lucide-react';
import { Song } from '../types';
import { seasonInfo } from '../data/defaultCatalog';
import { formatFullDate } from '../utils/calendar';

interface NowPlayingSidebarProps {
  currentSong: Song | null;
  nextSong: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLike: (songId: number) => void;
  onSelectNext: () => void;
  audioSourceType: 'local' | 'synthesizer';
  isLocalFileLoaded: boolean;
  onOpenFolderModal: () => void;
}

export const NowPlayingSidebar: React.FC<NowPlayingSidebarProps> = ({
  currentSong,
  nextSong,
  isOpen,
  onClose,
  onToggleLike,
  onSelectNext,
  audioSourceType,
  onOpenFolderModal,
}) => {
  if (!isOpen || !currentSong) return null;

  const info = seasonInfo[currentSong.season];

  return (
    <aside
      id="spotify-now-playing-panel"
      className="w-80 bg-[#121212] border-l border-white/5 flex flex-col h-full overflow-y-auto select-none p-4 shrink-0 text-white gap-4 font-sans"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm tracking-tight truncate">
          {currentSong.artist}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Large Artwork Card */}
      <div
        className="w-full aspect-square rounded-lg shadow-xl relative overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-white/10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${info.themeColor}40, #181818 80%)`,
        }}
      >
        <div className="w-24 h-24 rounded-full bg-black/40 border border-white/20 flex items-center justify-center mb-3 shadow-lg">
          <Disc className="w-12 h-12 text-white/90" />
        </div>
        <span className="text-xl font-black uppercase tracking-wider text-white">
          {currentSong.season}
        </span>
        <span className="text-xs text-white/70 font-semibold mt-0.5">
          Day {currentSong.day}
        </span>
      </div>

      {/* Track & Artist Info with Like */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white truncate leading-snug">
            {currentSong.title}
          </h3>
          <p className="text-sm text-[#b3b3b3] truncate mt-0.5">
            {currentSong.artist}
          </p>
        </div>
        <button
          onClick={() => onToggleLike(currentSong.id)}
          className="p-2 text-[#727272] hover:text-white transition-colors shrink-0 cursor-pointer"
        >
          <Heart className={`w-5 h-5 ${currentSong.liked ? 'fill-[#1db954] text-[#1db954]' : ''}`} />
        </button>
      </div>

      {/* Calendar Alignment Card */}
      <div className="bg-[#181818] p-3.5 rounded-lg flex flex-col gap-2 border border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#a7a7a7] uppercase tracking-wider">
            Calendar
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold"
            style={{ backgroundColor: `${info.themeColor}25`, color: info.themeColor }}
          >
            {currentSong.season}
          </span>
        </div>

        <div className="text-xs text-[#d1d1d1] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[#888]">Date:</span>
            <span className="font-semibold text-white">{formatFullDate(currentSong.day)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#888]">Day of Year:</span>
            <span className="font-semibold text-white">Day {currentSong.day} / 365</span>
          </div>
        </div>
      </div>

      {/* Audio Engine Status */}
      <div className="bg-[#181818] p-3 rounded-lg flex flex-col gap-2 border border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#a7a7a7] uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-[#1db954]" /> Audio Source
          </span>
          <span className="text-[10px] font-bold text-[#1db954]">
            {audioSourceType === 'local' ? 'Local File' : 'Synthesizer'}
          </span>
        </div>

        <div className="text-[11px] text-[#999]">
          {audioSourceType === 'local' ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{currentSong.fileName || `musics/${currentSong.day}.mp3`}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span>Synthesizer Playback</span>
              </div>
              <button
                onClick={onOpenFolderModal}
                className="text-[10px] text-[#1db954] hover:underline text-left font-semibold cursor-pointer"
              >
                + Connect local audio folder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Next in Queue */}
      {nextSong && (
        <div className="bg-[#181818] p-3 rounded-lg flex flex-col gap-2 border border-white/5 mt-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#a7a7a7] uppercase tracking-wider">
              Next
            </span>
            <span className="text-[10px] text-[#727272]">Day {nextSong.day}</span>
          </div>

          <button
            onClick={onSelectNext}
            className="flex items-center justify-between gap-2 p-2 rounded bg-[#222] hover:bg-[#2a2a2a] text-left transition-colors group cursor-pointer"
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate group-hover:text-[#1db954]">
                {nextSong.title}
              </div>
              <div className="text-[11px] text-[#888] truncate">{nextSong.artist}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#727272] group-hover:text-white shrink-0" />
          </button>
        </div>
      )}
    </aside>
  );
};
