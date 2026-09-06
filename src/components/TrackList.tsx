import React, { useState } from 'react';
import { Play, Pause, Heart, Clock, Music2, Copy, Check } from 'lucide-react';
import { Song, SeasonType } from '../types';
import { formatDayToDateString } from '../utils/calendar';

interface TrackListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleLike: (songId: number) => void;
  todayDay: number;
  onCopySongInfo?: (text: string) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  songs,
  currentSong,
  isPlaying,
  onSelectSong,
  onTogglePlay,
  onToggleLike,
  todayDay,
  onCopySongInfo,
}) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const getSeasonBadge = (season: SeasonType) => {
    switch (season) {
      case 'Spring':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'Summer':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'Autumn':
        return 'bg-orange-950/60 text-orange-300 border-orange-800/40';
      case 'Winter':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
    }
  };

  const handleCopy = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    const str = `${song.day}. ${song.title} – ${song.artist}`;
    navigator.clipboard.writeText(str);
    setCopiedId(song.id);
    if (onCopySongInfo) onCopySongInfo(str);
    setTimeout(() => setCopiedId(null), 1800);
  };

  if (songs.length === 0) {
    return (
      <div className="py-24 text-center text-[#727272] flex flex-col items-center justify-center gap-3 px-4">
        <Music2 className="w-12 h-12 text-[#444]" />
        <p className="text-base font-semibold text-white">No tracks found</p>
        <p className="text-xs text-[#727272]">Try adjusting your search or season filter.</p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 pb-36 sm:pb-24 select-none">
      {/* Table Header (Desktop & Tablet) */}
      <div className="hidden sm:grid sm:grid-cols-[36px_1fr_130px_70px_70px] items-center gap-4 px-4 py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-[#b3b3b3]">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Season / Date</span>
        <span className="text-right flex items-center justify-end">
          <Clock className="w-4 h-4" />
        </span>
        <span className="text-center"></span>
      </div>

      {/* Mobile Track Header */}
      <div className="sm:hidden flex items-center justify-between px-3 py-2 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#b3b3b3]">
        <span>Track ({songs.length})</span>
        <span>Actions</span>
      </div>

      {/* Track Rows */}
      <div className="flex flex-col mt-1 sm:mt-2 gap-0.5 sm:gap-0">
        {songs.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const isToday = song.day === todayDay;

          return (
            <div
              key={`${song.id}-${song.day}`}
              id={`track-row-${song.id}`}
              onClick={() => onSelectSong(song)}
              className={`grid grid-cols-[32px_1fr_44px] sm:grid-cols-[36px_1fr_130px_70px_70px] items-center gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-md text-sm transition-colors group cursor-pointer ${
                isCurrent
                  ? 'bg-white/10 text-[#1db954]'
                  : 'hover:bg-white/5 text-[#b3b3b3] hover:text-white active:bg-white/10'
              }`}
            >
              {/* # or Play/Pause indicator */}
              <div className="flex items-center justify-center text-xs">
                {isCurrentPlaying ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlay();
                    }}
                    className="text-[#1db954] cursor-pointer p-1"
                    title="Pause"
                  >
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 h-3.5 bg-[#1db954] animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#1db954] animate-pulse delay-75" />
                      <span className="w-0.5 h-3 bg-[#1db954] animate-pulse delay-150" />
                    </div>
                  </button>
                ) : isCurrent ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePlay();
                    }}
                    className="text-[#1db954] cursor-pointer p-1"
                    title="Play"
                  >
                    <Play className="w-4 h-4 fill-[#1db954]" />
                  </button>
                ) : (
                  <>
                    <span className="sm:group-hover:hidden text-[#727272] font-medium text-xs">
                      {index + 1}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSong(song);
                      }}
                      className="hidden sm:group-hover:block text-white cursor-pointer hover:scale-110 transition-transform p-1"
                      title="Play"
                    >
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Title & Artist & Mobile Metadata */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#282828] shrink-0 flex items-center justify-center font-bold text-[11px] sm:text-xs text-white/80 overflow-hidden border border-white/5">
                  <span>{song.day}</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`font-semibold truncate text-xs sm:text-sm ${
                        isCurrent ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {song.title}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-extrabold uppercase bg-[#1db954] text-black shrink-0">
                        Today
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a7a7a7] truncate group-hover:text-white/80 transition-colors">
                    <span className="truncate">{song.artist}</span>
                    {/* Inline badge on mobile */}
                    <span className="sm:hidden text-[#666]">•</span>
                    <span className="sm:hidden text-[10px] text-[#888] shrink-0">
                      {song.season} (D{song.day})
                    </span>
                  </div>
                </div>
              </div>

              {/* Season & Date (Desktop & Tablet) */}
              <div className="hidden sm:flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeasonBadge(
                      song.season
                    )}`}
                  >
                    {song.season}
                  </span>
                </div>
                <span className="text-[11px] text-[#727272] mt-0.5 truncate">
                  Day {song.day} ({formatDayToDateString(song.day)})
                </span>
              </div>

              {/* Duration (Desktop & Tablet) */}
              <div className="hidden sm:block text-right text-xs text-[#a7a7a7] font-mono">
                {song.duration}
              </div>

              {/* Quick Actions (Copy + Like) */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={(e) => handleCopy(song, e)}
                  title="Copy song name & artist"
                  className="p-2 sm:p-1 rounded text-[#727272] hover:text-white opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                >
                  {copiedId === song.id ? (
                    <Check className="w-3.5 h-3.5 text-[#1db954]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  id={`btn-like-${song.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(song.id);
                  }}
                  className={`p-2 sm:p-1 rounded transition-colors cursor-pointer min-h-[40px] min-w-[40px] sm:min-h-0 sm:min-w-0 flex items-center justify-center ${
                    song.liked
                      ? 'text-[#1db954] fill-[#1db954]'
                      : 'text-[#727272] hover:text-white opacity-70 sm:opacity-0 sm:group-hover:opacity-100'
                  }`}
                  title={song.liked ? 'Remove from Liked' : 'Save to Liked'}
                >
                  <Heart className={`w-4 h-4 ${song.liked ? 'fill-[#1db954]' : ''}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
