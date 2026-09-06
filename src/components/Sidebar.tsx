import React from 'react';
import {
  Compass,
  Search,
  Calendar,
  Heart,
  FolderDown,
  UploadCloud,
  ListMusic,
  FolderOpen,
  Sparkles,
  Flame,
  Sun,
  Leaf,
  Snowflake,
} from 'lucide-react';
import { SeasonType, ViewMode } from '../types';
import { seasonInfo } from '../data/defaultCatalog';

interface SidebarProps {
  currentView: ViewMode;
  selectedSeason: SeasonType | null;
  onSelectView: (view: ViewMode, season?: SeasonType) => void;
  todayDay: number;
  totalSongs: number;
  likedCount: number;
  onOpenImportModal: () => void;
  onOpenCalendarModal: () => void;
  onOpenFolderModal: () => void;
  hasLocalFilesLoaded: boolean;
  localFilesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedSeason,
  onSelectView,
  todayDay,
  totalSongs,
  likedCount,
  onOpenImportModal,
  onOpenCalendarModal,
  onOpenFolderModal,
  hasLocalFilesLoaded,
  localFilesCount,
}) => {
  const seasons: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];

  const getSeasonIcon = (season: SeasonType) => {
    switch (season) {
      case 'Spring':
        return <Leaf className="w-4 h-4 text-emerald-400" />;
      case 'Summer':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Autumn':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Winter':
        return <Snowflake className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <aside
      id="spotify-sidebar"
      className="w-64 bg-black flex flex-col h-full select-none text-[#b3b3b3] p-3 gap-2 shrink-0 font-medium"
    >
      {/* Top Brand & Main Navigation Card */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-3.5">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 text-white px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1db954] to-emerald-400 flex items-center justify-center text-black font-black text-xs shadow-md shadow-[#1db954]/20 tracking-wider">
            YOB
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">YOB 365</h1>
            <p className="text-[11px] text-[#a7a7a7] leading-none">Curated Calendar Music</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 mt-1">
          <button
            id="nav-today-btn"
            onClick={() => onSelectView('today')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 text-left ${
              currentView === 'today'
                ? 'bg-[#282828] text-white'
                : 'hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Compass className={`w-5 h-5 ${currentView === 'today' ? 'text-[#1db954]' : ''}`} />
            <div className="flex-1 flex items-center justify-between">
              <span>Today's Track</span>
              <span className="text-[10px] bg-[#1db954]/20 text-[#1db954] px-1.5 py-0.5 rounded font-bold border border-[#1db954]/30">
                Day {todayDay}
              </span>
            </div>
          </button>

          <button
            id="nav-all-btn"
            onClick={() => onSelectView('all')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 text-left ${
              currentView === 'all'
                ? 'bg-[#282828] text-white'
                : 'hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <ListMusic className={`w-5 h-5 ${currentView === 'all' ? 'text-[#1db954]' : ''}`} />
            <div className="flex-1 flex items-center justify-between">
              <span>All 365 Songs</span>
              <span className="text-[11px] text-[#727272]">{totalSongs}</span>
            </div>
          </button>

          <button
            id="nav-calendar-btn"
            onClick={onOpenCalendarModal}
            className="flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 text-left hover:text-white hover:bg-[#1a1a1a]"
          >
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span>Calendar Year</span>
          </button>

          <button
            id="nav-favorites-btn"
            onClick={() => onSelectView('favorites')}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors duration-150 text-left ${
              currentView === 'favorites'
                ? 'bg-[#282828] text-white'
                : 'hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <Heart className={`w-5 h-5 ${currentView === 'favorites' ? 'text-rose-500 fill-rose-500' : 'text-rose-400'}`} />
            <div className="flex-1 flex items-center justify-between">
              <span>Liked Songs</span>
              <span className="text-[11px] text-[#727272]">{likedCount}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Library & Seasons Container */}
      <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center justify-between px-2 py-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">
            Seasonal Playlists
          </span>
          <button
            id="btn-import-schema"
            onClick={onOpenImportModal}
            title="Import or Export JSON Schema"
            className="p-1 hover:text-white text-[#b3b3b3] hover:bg-[#282828] rounded transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
          </button>
        </div>

        {/* Four Seasons List */}
        <div className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1">
          {seasons.map((season) => {
            const info = seasonInfo[season];
            const isSelected = currentView === 'season' && selectedSeason === season;
            return (
              <button
                key={season}
                id={`season-tab-${season.toLowerCase()}`}
                onClick={() => onSelectView('season', season)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all text-left group ${
                  isSelected
                    ? 'bg-[#282828] text-white'
                    : 'hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0 border border-white/10"
                  style={{ backgroundColor: `${info.themeColor}20` }}
                >
                  {getSeasonIcon(season)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate text-white">{info.name}</div>
                  <div className="text-[10px] text-[#727272] truncate">
                    Days {info.dayRange[0]}–{info.dayRange[1]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Local Folder / musics/ Binding Bar */}
        <div className="pt-2 border-t border-[#282828] flex flex-col gap-2 mt-auto">
          <button
            id="btn-open-folder-modal"
            onClick={onOpenFolderModal}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium border transition-colors ${
              hasLocalFilesLoaded
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
                : 'bg-[#181818] border-[#333] hover:bg-[#222] text-[#b3b3b3] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="w-4 h-4 text-[#1db954]" />
              <span className="truncate">
                {hasLocalFilesLoaded ? `${localFilesCount} musics/ loaded` : 'Load local musics/'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-[#1db954]">
              {hasLocalFilesLoaded ? 'Active' : 'Offline'}
            </span>
          </button>

          <button
            id="btn-open-json-tool"
            onClick={onOpenImportModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#242424] hover:bg-[#333] text-white text-xs font-bold transition-transform active:scale-98"
          >
            <FolderDown className="w-3.5 h-3.5 text-[#1db954]" />
            <span>JSON Playlist Schema</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
