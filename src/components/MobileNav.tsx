import React from 'react';
import { Compass, ListMusic, Calendar, Heart, FolderDown } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenCalendar: () => void;
  onOpenImport: () => void;
  likedCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  onOpenCalendar,
  onOpenImport,
  likedCount,
}) => {
  return (
    <nav
      id="spotify-mobile-nav"
      className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#121212]/95 backdrop-blur-lg border-t border-white/10 flex items-center justify-around z-40 select-none px-2"
    >
      {/* Today */}
      <button
        onClick={() => onSelectView('today')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors min-h-[44px] ${
          currentView === 'today' ? 'text-[#1db954]' : 'text-[#a7a7a7] hover:text-white'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-bold">Today</span>
      </button>

      {/* 365 Library */}
      <button
        onClick={() => onSelectView('all')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors min-h-[44px] ${
          currentView === 'all' ? 'text-[#1db954]' : 'text-[#a7a7a7] hover:text-white'
        }`}
      >
        <ListMusic className="w-5 h-5" />
        <span className="text-[10px] font-bold">365 All</span>
      </button>

      {/* Calendar Year */}
      <button
        onClick={onOpenCalendar}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[#a7a7a7] hover:text-white cursor-pointer transition-colors min-h-[44px]"
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px] font-bold">Calendar</span>
      </button>

      {/* Liked Songs */}
      <button
        onClick={() => onSelectView('favorites')}
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 cursor-pointer transition-colors min-h-[44px] relative ${
          currentView === 'favorites' ? 'text-[#1db954]' : 'text-[#a7a7a7] hover:text-white'
        }`}
      >
        <Heart className="w-5 h-5" />
        <span className="text-[10px] font-bold">Liked ({likedCount})</span>
      </button>

      {/* JSON Schema */}
      <button
        onClick={onOpenImport}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[#a7a7a7] hover:text-white cursor-pointer transition-colors min-h-[44px]"
      >
        <FolderDown className="w-5 h-5" />
        <span className="text-[10px] font-bold">Schema</span>
      </button>
    </nav>
  );
};
