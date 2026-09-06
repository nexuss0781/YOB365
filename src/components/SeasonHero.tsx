import React from 'react';
import { Play, Pause, Shuffle, Calendar, Disc } from 'lucide-react';
import { SeasonType, ViewMode, Song } from '../types';
import { seasonInfo } from '../data/defaultCatalog';
import { formatFullDate } from '../utils/calendar';

interface SeasonHeroProps {
  currentView: ViewMode;
  selectedSeason: SeasonType | null;
  songsCount: number;
  isPlaying: boolean;
  onPlayAll: () => void;
  onToggleShuffle: () => void;
  isShuffle: boolean;
  todaySong?: Song;
  onOpenCalendar: () => void;
}

export const SeasonHero: React.FC<SeasonHeroProps> = ({
  currentView,
  selectedSeason,
  songsCount,
  isPlaying,
  onPlayAll,
  onToggleShuffle,
  isShuffle,
  todaySong,
  onOpenCalendar,
}) => {
  let title = 'YOB 365';
  let playlistType = 'CALENDAR COMPILATION';
  let themeColor = '#1db954';

  if (currentView === 'season' && selectedSeason) {
    const info = seasonInfo[selectedSeason];
    title = info.name;
    playlistType = `SEASON • ${info.dateRange}`;
    themeColor = info.themeColor;
  } else if (currentView === 'today' && todaySong) {
    title = `Day ${todaySong.day}: ${todaySong.title}`;
    playlistType = `TODAY • ${formatFullDate(todaySong.day)}`;
    themeColor = seasonInfo[todaySong.season].themeColor;
  } else if (currentView === 'favorites') {
    title = 'Liked Songs';
    playlistType = 'FAVORITES';
    themeColor = '#e11d48';
  }

  return (
    <div className="relative pt-4 sm:pt-6 pb-6 px-3 sm:px-6 bg-gradient-to-b from-[#222222] to-[#121212] flex flex-col gap-4 sm:gap-5 shrink-0 z-10">
      {/* Background glow contained safely */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-25 transition-colors duration-700"
          style={{ backgroundColor: themeColor }}
        />
      </div>

      {/* Main Metadata Banner */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 relative z-10">
        {/* Cover Art Box */}
        <div
          className="w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-lg shadow-2xl flex flex-col items-center justify-center p-3 sm:p-4 shrink-0 text-center relative overflow-hidden group border border-white/10"
          style={{
            background: `linear-gradient(135deg, ${themeColor}33 0%, #181818 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <Disc className="w-10 h-10 sm:w-14 sm:h-14 text-white/80 mb-1.5 sm:mb-2 relative z-10" />
          <span className="text-base sm:text-lg font-black text-white tracking-wider relative z-10 uppercase">
            {selectedSeason || (currentView === 'today' ? todaySong?.season : 'YOB 365')}
          </span>
          <span className="text-[10px] sm:text-xs text-white/70 font-semibold relative z-10 mt-0.5 sm:mt-1">
            {currentView === 'today' ? `Day ${todaySong?.day}` : `${songsCount} Tracks`}
          </span>
        </div>

        {/* Text details */}
        <div className="flex flex-col gap-1 sm:gap-1.5 flex-1 text-center sm:text-left min-w-0">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#b3b3b3]">
            {playlistType}
          </span>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
            {title}
          </h1>
          <span className="text-xs text-[#b3b3b3] font-medium mt-0.5 sm:mt-1">
            {songsCount} {songsCount === 1 ? 'song' : 'songs'}
          </span>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2 relative z-10">
        <button
          id="btn-hero-play"
          onClick={onPlayAll}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg shadow-[#1db954]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] min-w-[48px]"
          title="Play All"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-black" />
          ) : (
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black ml-0.5" />
          )}
        </button>

        <button
          id="btn-hero-shuffle"
          onClick={onToggleShuffle}
          className={`p-3 rounded-full transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
            isShuffle ? 'text-[#1db954] bg-[#1db954]/10' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Shuffle Playlist"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenCalendar}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#333] text-white text-xs font-bold transition-colors border border-white/5 cursor-pointer min-h-[44px]"
        >
          <Calendar className="w-4 h-4 text-[#1db954]" />
          <span>Calendar</span>
        </button>
      </div>
    </div>
  );
};
