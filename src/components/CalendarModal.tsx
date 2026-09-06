import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Song, SeasonType } from '../types';
import { getSeasonFromDay, MONTH_NAMES, DAYS_IN_MONTHS, formatFullDate } from '../utils/calendar';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  todayDay: number;
  onSelectSong: (song: Song) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  songs,
  todayDay,
  onSelectSong,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  if (!isOpen) return null;

  const daySongMap = new Map<number, Song>();
  songs.forEach((s) => daySongMap.set(s.day, s));

  let startDayOfYear = 1;
  for (let m = 0; m < selectedMonthIndex; m++) {
    startDayOfYear += DAYS_IN_MONTHS[m];
  }
  const daysInMonth = DAYS_IN_MONTHS[selectedMonthIndex];

  const getDayColor = (season: SeasonType, isToday: boolean) => {
    if (isToday) return 'bg-[#1db954] text-black font-black ring-2 ring-white';
    switch (season) {
      case 'Spring':
        return 'bg-emerald-950/50 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-800/40';
      case 'Summer':
        return 'bg-amber-950/50 hover:bg-amber-800/60 text-amber-300 border border-amber-800/40';
      case 'Autumn':
        return 'bg-orange-950/50 hover:bg-orange-800/60 text-orange-300 border border-orange-800/40';
      case 'Winter':
        return 'bg-blue-950/50 hover:bg-blue-800/60 text-blue-300 border border-blue-800/40';
    }
  };

  const currentHoverSong = hoveredDay ? daySongMap.get(hoveredDay) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="bg-[#181818] border border-white/10 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Calendar Year</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a7a7a7] hover:text-white hover:bg-white/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month Selector Carousel */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-white/5 bg-[#141414] flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a7a7a7] hover:text-white cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {MONTH_NAMES.map((month, idx) => (
              <button
                key={month}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedMonthIndex === idx
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#222] text-[#888] hover:text-white hover:bg-[#282828]'
                }`}
              >
                {month}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a7a7a7] hover:text-white cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid & Preview */}
        <div className="p-3 sm:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 overflow-y-auto flex-1">
          {/* Days Grid */}
          <div className="flex-1 flex flex-col gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center justify-between text-xs font-bold text-[#b3b3b3]">
              <span className="text-sm sm:text-base text-white">
                {MONTH_NAMES[selectedMonthIndex]}
              </span>
              <span className="text-[11px] sm:text-xs text-[#727272]">
                Days {startDayOfYear} – {startDayOfYear + daysInMonth - 1} of 365
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = startDayOfYear + idx;
                const song = daySongMap.get(dayNum);
                const season = song?.season || getSeasonFromDay(dayNum);
                const isToday = dayNum === todayDay;

                return (
                  <button
                    key={dayNum}
                    onMouseEnter={() => setHoveredDay(dayNum)}
                    onClick={() => {
                      if (song) {
                        onSelectSong(song);
                        onClose();
                      }
                    }}
                    className={`h-13 sm:h-16 p-1 sm:p-1.5 rounded-lg flex flex-col justify-between text-left transition-all hover:scale-105 active:scale-95 group relative cursor-pointer ${getDayColor(
                      season,
                      isToday
                    )}`}
                  >
                    <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-bold">
                      <span>{idx + 1}</span>
                      <span className="text-[8px] sm:text-[9px] opacity-70">D{dayNum}</span>
                    </div>

                    <div className="truncate text-[9px] sm:text-[10px] leading-tight font-medium w-full">
                      {song?.title || `Day ${dayNum}`}
                    </div>

                    <div className="absolute right-1 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Box (Responsive side or bottom block) */}
          <div className="w-full lg:w-72 bg-[#202020] p-3.5 sm:p-4 rounded-xl border border-white/5 flex flex-col justify-between shrink-0">
            {currentHoverSong ? (
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1db954] uppercase tracking-wider">
                    {currentHoverSong.season}
                  </span>
                  <span className="text-xs text-[#888]">Day {currentHoverSong.day}</span>
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                    {currentHoverSong.title}
                  </h4>
                  <p className="text-xs text-[#b3b3b3] mt-0.5">{currentHoverSong.artist}</p>
                </div>

                <div className="bg-[#181818] p-2.5 rounded-lg text-xs text-[#a7a7a7] flex flex-col gap-1 border border-white/5">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-white font-medium">
                      {formatFullDate(currentHoverSong.day)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-white font-mono text-xs">{currentHoverSong.duration}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectSong(currentHoverSong);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md mt-1 cursor-pointer min-h-[44px]"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Play Day {currentHoverSong.day}</span>
                </button>
              </div>
            ) : (
              <div className="py-4 lg:h-full flex flex-col items-center justify-center text-center text-xs text-[#727272]">
                <CalendarIcon className="w-8 h-8 mb-2 text-[#444]" />
                <p>Tap or hover any date to inspect and play.</p>
              </div>
            )}

            {/* Season color legend */}
            <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-white/10 text-[10px]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Spring (1–90)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Summer (91–181)</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Autumn (182–270)</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Winter (271–365)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
