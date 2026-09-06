export type SeasonType = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface Song {
  id: number;
  day: number;
  title: string;
  artist: string;
  season: SeasonType;
  duration: string;
  fileName?: string;
  localAudioUrl?: string;
  liked?: boolean;
}

export interface PlaylistSchema {
  version: string;
  name?: string;
  songs: Song[];
}

export type ViewMode = 'all' | 'season' | 'today' | 'favorites' | 'search';

export interface PlayerState {
  currentSongIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isSynthPlaying: boolean;
  audioSourceType: 'local' | 'synthesizer';
}
