import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Song, SeasonType, ViewMode } from './types';
import { generateInitial365Songs } from './data/defaultCatalog';
import { getDayOfYear } from './utils/calendar';
import { audioEngine } from './utils/audioEngine';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SeasonHero } from './components/SeasonHero';
import { TrackList } from './components/TrackList';
import { NowPlayingSidebar } from './components/NowPlayingSidebar';
import { BottomPlayer } from './components/BottomPlayer';
import { ImportModal } from './components/ImportModal';
import { CalendarModal } from './components/CalendarModal';
import { LocalFolderModal } from './components/LocalFolderModal';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { MobileNav } from './components/MobileNav';
import { Toast, ToastMessage } from './components/Toast';

const STORAGE_KEY = 'YOB_365_PLAYLIST_DATA_V2';

export default function App() {
  const todayDay = useMemo(() => getDayOfYear(), []);

  // Songs state (load from localStorage or default)
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return generateInitial365Songs();
  });

  // Views & Filters
  const [currentView, setCurrentView] = useState<ViewMode>('all');
  const [selectedSeason, setSelectedSeason] = useState<SeasonType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [localFilesCount, setLocalFilesCount] = useState<number>(0);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-3), { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Playback state
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(() => {
    const idx = songs.findIndex((s) => s.day === todayDay);
    return idx !== -1 ? idx : 0;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [audioSourceType, setAudioSourceType] = useState<'local' | 'synthesizer'>('local');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    } catch (err) {
      console.warn('Failed to save playlist to localStorage:', err);
    }
  }, [songs]);

  // Current active song object
  const currentSong = useMemo(() => {
    if (songs.length === 0) return null;
    return songs[currentSongIndex] || songs[0];
  }, [songs, currentSongIndex]);

  // Next song in queue
  const nextSong = useMemo(() => {
    if (songs.length <= 1) return null;
    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * songs.length);
      return songs[randIdx];
    }
    const nextIdx = (currentSongIndex + 1) % songs.length;
    return songs[nextIdx];
  }, [songs, currentSongIndex, isShuffle]);

  // Today's song object
  const todaySong = useMemo(() => {
    return songs.find((s) => s.day === todayDay) || songs[0];
  }, [songs, todayDay]);

  // Filter songs based on current view & search query
  const filteredSongs = useMemo(() => {
    let list = songs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.season.toLowerCase().includes(q) ||
          s.day.toString() === q ||
          `day ${s.day}`.includes(q)
      );
    } else if (currentView === 'season' && selectedSeason) {
      list = list.filter((s) => s.season === selectedSeason);
    } else if (currentView === 'today') {
      list = list.filter((s) => s.day === todayDay);
    } else if (currentView === 'favorites') {
      list = list.filter((s) => s.liked);
    }

    return list;
  }, [songs, currentView, selectedSeason, searchQuery, todayDay]);

  // Handler for song ending
  const handleSongEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (currentSong) {
        audioEngine.seek(0);
        audioEngine.playSong(currentSong);
      }
      return;
    }

    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(nextIdx);
      if (songs[nextIdx]) {
        audioEngine.playSong(songs[nextIdx]);
      }
      return;
    }

    const nextIdx = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIdx);
    if (songs[nextIdx]) {
      audioEngine.playSong(songs[nextIdx]);
    }
  }, [songs, currentSongIndex, isShuffle, repeatMode, currentSong]);

  // Audio Engine Callbacks setup
  useEffect(() => {
    audioEngine.setCallbacks({
      onTimeUpdate: (cur, dur) => {
        setCurrentTime(cur);
        if (dur > 0) setDuration(dur);
      },
      onEnded: () => {
        handleSongEnded();
      },
      onStateChange: (playing, source) => {
        setIsPlaying(playing);
        setAudioSourceType(source);
      },
    });
  }, [songs, currentSongIndex, isShuffle, repeatMode, handleSongEnded]);

  // Set volume
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Play a specific song
  const handleSelectSong = (song: Song) => {
    const idx = songs.findIndex((s) => s.id === song.id && s.day === song.day);
    if (idx !== -1) {
      setCurrentSongIndex(idx);
    }
    audioEngine.playSong(song);
  };

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      if (currentSong) {
        audioEngine.playSong(currentSong);
      }
    }
  };

  // Skip Next
  const handleNext = () => {
    if (songs.length === 0) return;
    let nextIdx = (currentSongIndex + 1) % songs.length;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * songs.length);
    }
    setCurrentSongIndex(nextIdx);
    audioEngine.playSong(songs[nextIdx]);
  };

  // Skip Prev
  const handlePrev = () => {
    if (songs.length === 0) return;
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }
    let prevIdx = (currentSongIndex - 1 + songs.length) % songs.length;
    if (isShuffle) {
      prevIdx = Math.floor(Math.random() * songs.length);
    }
    setCurrentSongIndex(prevIdx);
    audioEngine.playSong(songs[prevIdx]);
  };

  // Seek
  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  // Toggle Like
  const handleToggleLike = (songId: number) => {
    let wasLiked = false;
    let trackName = '';
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id === songId) {
          wasLiked = !s.liked;
          trackName = s.title;
          return { ...s, liked: !s.liked };
        }
        return s;
      })
    );
    addToast(wasLiked ? `Added "${trackName}" to Liked Songs` : `Removed from Liked Songs`, 'info');
  };

  // Toggle Repeat Mode
  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      addToast(next === 'one' ? 'Repeat 1 track' : next === 'all' ? 'Repeat all' : 'Repeat off', 'info');
      return next;
    });
  };

  // Toggle Shuffle
  const handleToggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      addToast(next ? 'Shuffle enabled' : 'Shuffle disabled', 'info');
      return next;
    });
  };

  // Select View Navigation
  const handleSelectView = (view: ViewMode, season?: SeasonType) => {
    setCurrentView(view);
    if (view === 'season' && season) {
      setSelectedSeason(season);
    } else {
      setSelectedSeason(null);
    }
    setSearchQuery('');
    setIsMobileSidebarOpen(false);
  };

  // Play all songs in current filtered view
  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      handleSelectSong(filteredSongs[0]);
    }
  };

  // Reset to default 365 catalog
  const handleResetDefault = () => {
    const defaultSongs = generateInitial365Songs();
    setSongs(defaultSongs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSongs));
    addToast('Reset playlist to default 365 songs');
  };

  // Import custom songs
  const handleImportSongs = (imported: Song[]) => {
    setSongs(imported);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    setCurrentSongIndex(0);
    if (imported[0]) {
      audioEngine.playSong(imported[0]);
    }
    addToast(`Successfully imported ${imported.length} songs`);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        handleToggleShuffle();
      } else if (e.key === 'r' || e.key === 'R') {
        handleToggleRepeat();
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentSong) handleToggleLike(currentSong.id);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreenOpen((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setIsCalendarModalOpen((prev) => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        document.getElementById('spotify-search-input')?.focus();
      } else if (e.key === 'Escape') {
        setIsCalendarModalOpen(false);
        setIsImportModalOpen(false);
        setIsFolderModalOpen(false);
        setIsShortcutsModalOpen(false);
        setIsFullscreenOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentSong, currentSongIndex, songs, handleToggleShuffle, handleToggleRepeat]);

  const likedCount = useMemo(() => songs.filter((s) => s.liked).length, [songs]);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white font-sans overflow-hidden">
      {/* Upper Main Section */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Desktop Sidebar (>= 768px) */}
        <div className="hidden md:block">
          <Sidebar
            currentView={currentView}
            selectedSeason={selectedSeason}
            onSelectView={handleSelectView}
            todayDay={todayDay}
            totalSongs={songs.length}
            likedCount={likedCount}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            onOpenFolderModal={() => setIsFolderModalOpen(true)}
            hasLocalFilesLoaded={localFilesCount > 0}
            localFilesCount={localFilesCount}
          />
        </div>

        {/* Mobile Drawer Sidebar (< 768px) */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[85vw] h-full bg-black shadow-2xl">
              <Sidebar
                currentView={currentView}
                selectedSeason={selectedSeason}
                onSelectView={handleSelectView}
                todayDay={todayDay}
                totalSongs={songs.length}
                likedCount={likedCount}
                onOpenImportModal={() => {
                  setIsMobileSidebarOpen(false);
                  setIsImportModalOpen(true);
                }}
                onOpenCalendarModal={() => {
                  setIsMobileSidebarOpen(false);
                  setIsCalendarModalOpen(true);
                }}
                onOpenFolderModal={() => {
                  setIsMobileSidebarOpen(false);
                  setIsFolderModalOpen(true);
                }}
                hasLocalFilesLoaded={localFilesCount > 0}
                localFilesCount={localFilesCount}
              />
            </div>
          </div>
        )}

        {/* Central Scrollable Content Area */}
        <main className="flex-1 bg-[#121212] rounded-none sm:rounded-lg m-0 sm:m-2 md:ml-0 flex flex-col min-w-0 overflow-y-auto relative">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentView={currentView}
            selectedSeason={selectedSeason}
            onSelectView={handleSelectView}
            todayDay={todayDay}
            onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Season / Calendar Playlist Hero */}
          <SeasonHero
            currentView={currentView}
            selectedSeason={selectedSeason}
            songsCount={filteredSongs.length}
            isPlaying={isPlaying}
            onPlayAll={handlePlayAll}
            onToggleShuffle={handleToggleShuffle}
            isShuffle={isShuffle}
            todaySong={todaySong}
            onOpenCalendar={() => setIsCalendarModalOpen(true)}
          />

          {/* Spotify Track Table */}
          <TrackList
            songs={filteredSongs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onSelectSong={handleSelectSong}
            onTogglePlay={handleTogglePlay}
            onToggleLike={handleToggleLike}
            todayDay={todayDay}
            onCopySongInfo={() => addToast('Copied song info to clipboard', 'info')}
          />
        </main>

        {/* Right Now Playing Panel (Desktop >= 1024px) */}
        <div className="hidden xl:block">
          <NowPlayingSidebar
            currentSong={currentSong}
            nextSong={nextSong}
            isOpen={isNowPlayingOpen}
            onClose={() => setIsNowPlayingOpen(false)}
            onToggleLike={handleToggleLike}
            onSelectNext={handleNext}
            audioSourceType={audioSourceType}
            isLocalFileLoaded={localFilesCount > 0}
            onOpenFolderModal={() => setIsFolderModalOpen(true)}
          />
        </div>
      </div>

      {/* Sticky Player Bar (Floating Mini Player on Mobile, Docked Bar on Tablet/Desktop) */}
      <BottomPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleLike={handleToggleLike}
        isNowPlayingOpen={isNowPlayingOpen}
        onToggleNowPlaying={() => setIsNowPlayingOpen((prev) => !prev)}
        audioSourceType={audioSourceType}
        onOpenFullscreen={() => setIsFullscreenOpen(true)}
      />

      {/* Mobile Bottom Navigation (< 640px) */}
      <MobileNav
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenCalendar={() => setIsCalendarModalOpen(true)}
        onOpenImport={() => setIsImportModalOpen(true)}
        likedCount={likedCount}
      />

      {/* Fullscreen Theater Mode */}
      <FullscreenPlayer
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleLike={handleToggleLike}
      />

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSongs={handleImportSongs}
        onResetDefault={handleResetDefault}
        currentSongs={songs}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        songs={songs}
        todayDay={todayDay}
        onSelectSong={handleSelectSong}
      />

      <LocalFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFilesLoaded={(count) => {
          setLocalFilesCount(count);
          addToast(`Loaded ${count} local audio files`);
        }}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Floating Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
