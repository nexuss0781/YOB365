import { Song, SeasonType, PlaylistSchema } from '../types';
import { getSeasonFromDay } from './calendar';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  songs: Song[];
  metadata?: {
    name?: string;
    version?: string;
    totalParsed: number;
    seasonBreakdown: Record<SeasonType, number>;
  };
}

export const JSON_SCHEMA_EXAMPLE: PlaylistSchema = {
  version: '1.0',
  name: 'YOB 365 Playlist',
  songs: [
    {
      id: 230,
      day: 230,
      title: 'When I’m Gone',
      artist: 'Eminem',
      season: 'Autumn',
      duration: '3:05',
      fileName: '230_when_im_gone.mp3',
    },
    {
      id: 271,
      day: 271,
      title: 'Hurt',
      artist: 'Johnny Cash',
      season: 'Winter',
      duration: '3:38',
      fileName: '271_hurt_johnny_cash.mp3',
    },
  ],
};

export function validateAndParseJSON(jsonString: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      isValid: false,
      errors: [`Invalid JSON: ${message}`],
      warnings: [],
      songs: [],
    };
  }

  let rawSongs: unknown[] = [];
  let metaName: string | undefined;
  let metaVersion: string | undefined;

  if (Array.isArray(parsed)) {
    rawSongs = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    metaName = typeof obj.name === 'string' ? obj.name : undefined;
    metaVersion = typeof obj.version === 'string' ? obj.version : undefined;

    if (Array.isArray(obj.songs)) {
      rawSongs = obj.songs;
    } else if (Array.isArray(obj.tracks)) {
      rawSongs = obj.tracks;
    } else if (Array.isArray(obj.playlist)) {
      rawSongs = obj.playlist;
    } else {
      errors.push('Missing "songs" array in JSON object.');
      return { isValid: false, errors, warnings, songs: [] };
    }
  } else {
    errors.push('Root must be an Object with "songs" or an Array of songs.');
    return { isValid: false, errors, warnings, songs: [] };
  }

  if (rawSongs.length === 0) {
    errors.push('Songs array is empty.');
    return { isValid: false, errors, warnings, songs: [] };
  }

  const validSongs: Song[] = [];
  const validSeasons: SeasonType[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
  const seasonCount: Record<SeasonType, number> = {
    Spring: 0,
    Summer: 0,
    Autumn: 0,
    Winter: 0,
  };

  const dayMap = new Map<number, boolean>();

  rawSongs.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Song at index [${index}] is invalid.`);
      return;
    }

    const rec = item as Record<string, unknown>;
    const id = typeof rec.id === 'number' ? rec.id : index + 1;
    let day = typeof rec.day === 'number' ? rec.day : id;

    if (day < 1 || day > 365) {
      day = Math.min(365, Math.max(1, day));
    }

    dayMap.set(day, true);

    const title = typeof rec.title === 'string' && rec.title.trim() ? rec.title.trim() : `Track ${day}`;
    const artist = typeof rec.artist === 'string' && rec.artist.trim() ? rec.artist.trim() : 'Various Artists';

    let season: SeasonType;
    if (typeof rec.season === 'string' && validSeasons.includes(rec.season as SeasonType)) {
      season = rec.season as SeasonType;
    } else {
      season = getSeasonFromDay(day);
    }

    seasonCount[season]++;

    const duration = typeof rec.duration === 'string' && rec.duration.includes(':') ? rec.duration : '3:30';
    const dayPad = String(day).padStart(3, '0');
    const fileName =
      typeof rec.fileName === 'string' && rec.fileName.trim()
        ? rec.fileName.trim()
        : `${dayPad}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`;

    validSongs.push({
      id,
      day,
      title,
      artist,
      season,
      duration,
      fileName,
      liked: Boolean(rec.liked),
    });
  });

  // Sort by day ascending
  validSongs.sort((a, b) => a.day - b.day);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    songs: validSongs,
    metadata: {
      name: metaName,
      version: metaVersion,
      totalParsed: validSongs.length,
      seasonBreakdown: seasonCount,
    },
  };
}

// Parses raw text formatted like "230. When I’m Gone – Eminem"
export function parseRawTextToSongs(text: string): Song[] {
  const lines = text.split('\n');
  const songs: Song[] = [];
  let currentSeason: SeasonType = 'Autumn';

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const upper = trimmed.toUpperCase();
    if (upper.includes('WINTER')) currentSeason = 'Winter';
    else if (upper.includes('SPRING')) currentSeason = 'Spring';
    else if (upper.includes('SUMMER')) currentSeason = 'Summer';
    else if (upper.includes('AUTUMN') || upper.includes('FALL')) currentSeason = 'Autumn';

    const match = trimmed.match(/^(\d{1,3})\.?\s*(.+)$/);
    if (match) {
      const day = parseInt(match[1], 10);
      const rest = match[2].trim();
      let title = rest;
      let artist = 'Various Artists';

      if (rest.includes('–')) {
        const parts = rest.split('–');
        title = parts[0].trim();
        artist = parts[1].trim();
      } else if (rest.includes(' - ')) {
        const parts = rest.split(' - ');
        title = parts[0].trim();
        artist = parts[1].trim();
      }

      const dayPad = String(day).padStart(3, '0');
      songs.push({
        id: day,
        day,
        title,
        artist,
        season: currentSeason,
        duration: '3:30',
        fileName: `${dayPad}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`,
      });
    }
  });

  return songs;
}
