import React from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar, FolderDown, Command, Menu } from 'lucide-react';
import { SeasonType, ViewMode } from '../types';
import { formatDayToDateString } from '../utils/calendar';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: ViewMode;
  selectedSeason: SeasonType | null;
  onSelectView: (view: ViewMode, season?: SeasonType) => void;
  todayDay: number;
  onOpenCalendarModal: () => void;
  onOpenImportModal: () => void;
  onOpenShortcutsModal: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentView,
  selectedSeason,
  onSelectView,
  todayDay,
  onOpenCalendarModal,
  onOpenImportModal,
  onOpenShortcutsModal,
  onToggleMobileSidebar,
}) => {
  const seasons: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

  return (
    <header
      id="spotify-header"
      className="h-14 sm:h-16 px-3 sm:px-6 bg-[#121212]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-2 sm:gap-4 border-b border-white/5"
    >
      {/* Left: Mobile Menu + Navigation Arrows & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onSelectView('all')}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            title="All Songs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onSelectView('today')}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Today's Song"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Spotify Search Bar */}
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-[#727272] group-focus-within:text-white absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
          <input
            id="spotify-search-input"
            type="text"
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-8 sm:pr-10 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm text-white placeholder-[#727272] transition-all"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 text-[#a7a7a7] px-1.5 py-0.5 rounded font-mono pointer-events-none">
            /
          </kbd>
        </div>
      </div>

      {/* Center/Right: Season Filter Pills (Desktop only) */}
      <div className="hidden xl:flex items-center gap-1.5">
        <button
          onClick={() => onSelectView('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
            currentView === 'all'
              ? 'bg-white text-black shadow-sm'
              : 'bg-[#242424] text-white hover:bg-[#2e2e2e]'
          }`}
        >
          All (365)
        </button>

        {seasons.map((s) => {
          const isActive = currentView === 'season' && selectedSeason === s;
          return (
            <button
              key={s}
              onClick={() => onSelectView('season', s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#242424] text-white hover:bg-[#2e2e2e]'
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Right: Calendar Badge, Shortcuts & Import JSON */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          id="header-calendar-badge"
          onClick={onOpenCalendarModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1e1e1e] hover:bg-[#282828] border border-white/10 text-xs font-bold text-white transition-all active:scale-95 shadow-sm cursor-pointer min-h-[38px]"
          title="Open Calendar Year (C)"
        >
          <Calendar className="w-3.5 h-3.5 text-[#1db954]" />
          <span className="hidden sm:inline">
            Day {todayDay} ({formatDayToDateString(todayDay)})
          </span>
          <span className="sm:hidden text-[11px]">D{todayDay}</span>
        </button>

        <button
          onClick={onOpenShortcutsModal}
          className="hidden sm:flex p-2 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-[#a7a7a7] hover:text-white transition-colors cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <Command className="w-3.5 h-3.5" />
        </button>

        <button
          id="header-import-json-btn"
          onClick={onOpenImportModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-black text-xs font-extrabold transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#1db954]/20 cursor-pointer"
          title="JSON Schema Importer / Exporter"
        >
          <FolderDown className="w-3.5 h-3.5 text-black" />
          <span>Schema</span>
        </button>
      </div>
    </header>
  );
};
