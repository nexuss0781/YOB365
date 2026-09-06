import { Song, SeasonType } from '../types';

export const seasonInfo: Record<
  SeasonType,
  {
    name: SeasonType;
    dateRange: string;
    dayRange: [number, number];
    themeColor: string;
    bgGradient: string;
    accentColor: string;
  }
> = {
  Spring: {
    name: 'Spring',
    dateRange: 'Days 1–90',
    dayRange: [1, 90],
    themeColor: '#10b981',
    bgGradient: 'from-emerald-900/60 via-emerald-950/40 to-[#121212]',
    accentColor: 'text-emerald-400',
  },
  Summer: {
    name: 'Summer',
    dateRange: 'Days 91–181',
    dayRange: [91, 181],
    themeColor: '#f59e0b',
    bgGradient: 'from-amber-900/60 via-amber-950/40 to-[#121212]',
    accentColor: 'text-amber-400',
  },
  Autumn: {
    name: 'Autumn',
    dateRange: 'Days 182–270',
    dayRange: [182, 270],
    themeColor: '#ea580c',
    bgGradient: 'from-orange-950/70 via-stone-950/50 to-[#121212]',
    accentColor: 'text-orange-400',
  },
  Winter: {
    name: 'Winter',
    dateRange: 'Days 271–365',
    dayRange: [271, 365],
    themeColor: '#3b82f6',
    bgGradient: 'from-slate-900/80 via-blue-950/40 to-[#121212]',
    accentColor: 'text-blue-400',
  },
};

// Generates exclusively the user provided track catalog with no seeds, no placeholders, and no descriptions
export function generateInitial365Songs(): Song[] {
  const songs: Song[] = [];

  const formatDuration = (d: number) => {
    const mins = Math.floor(d / 60);
    const secs = Math.floor(d % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // User Provided Autumn Tracks (230 - 270)
  const autumnList: { [key: number]: { title: string; artist: string } } = {
    230: { title: 'When I’m Gone', artist: 'Eminem' },
    231: { title: 'Hailie’s Song', artist: 'Eminem' },
    232: { title: 'Cleanin’ Out My Closet', artist: 'Eminem' },
    233: { title: 'Sing for the Moment', artist: 'Eminem' },
    234: { title: 'Like Toy Soldiers', artist: 'Eminem' },
    235: { title: 'Train Wreck', artist: 'James Arthur' },
    236: { title: 'Impossible', artist: 'James Arthur' },
    237: { title: 'Say You Won’t Let Go (sad)', artist: 'James Arthur' },
    238: { title: 'Recover', artist: 'James Arthur' },
    239: { title: 'Safe Inside', artist: 'James Arthur' },
    240: { title: 'Heal', artist: 'Tom Odell' },
    241: { title: 'Another Love (extended sadness)', artist: 'Tom Odell' },
    242: { title: 'Magnetised', artist: 'Tom Odell' },
    243: { title: 'Real Love', artist: 'Tom Odell' },
    244: { title: 'Breathe Me', artist: 'Sia' },
    245: { title: 'Elastic Heart', artist: 'Sia' },
    246: { title: 'Chandelier', artist: 'Sia' },
    247: { title: 'Cheap Thrills (sad version)', artist: 'Sia' },
    248: { title: 'Alive', artist: 'Sia' },
    249: { title: 'Unstoppable', artist: 'Sia' },
    250: { title: 'Courage To Change', artist: 'Sia' },
    251: { title: 'ክረምቱን በናዝሪት', artist: 'Mahmoud Ahmed' },
    252: { title: 'በናዝሪት', artist: 'Teddy Afro' },
    253: { title: 'ምን ቀረኝ', artist: 'Aster Aweke' },
    254: { title: 'ይሉኝታ', artist: 'Eyob Mekonnen' },
    255: { title: 'ባይተዋር', artist: 'Alemayehu Eshete' },
    256: { title: 'ባይ ባይ', artist: 'Abinet Agonafir' },
    257: { title: 'matushika', artist: 'Traditional' },
    258: { title: 'i left my home', artist: 'Traditional' },
    259: { title: 'home (ፍቅረሰ ትልቅ ውሽ መውደሰ ቃል)', artist: 'Traditional' },
    260: { title: 'kamin', artist: 'Traditional' },
    261: { title: 'alchalkum', artist: 'Abinet Agonafir' },
    262: { title: 'mar eske tuaf', artist: 'Teddy Afro' },
    263: { title: 'ayele', artist: 'Rophnan' },
    264: { title: 'Without Me', artist: 'Halsey' },
    265: { title: 'Bad at Love', artist: 'Halsey' },
    266: { title: 'Graveyard', artist: 'Halsey' },
    267: { title: 'You should be sad', artist: 'Halsey' },
    268: { title: 'Control', artist: 'Zoe Wees' },
    269: { title: 'Ghost Town', artist: 'Benson Boone' },
    270: { title: 'In The Stars', artist: 'Benson Boone' },
  };

  Object.entries(autumnList).forEach(([dayStr, item]) => {
    const day = Number(dayStr);
    const durationSec = 210 + ((day * 7) % 75);
    const dayPad = String(day).padStart(3, '0');
    songs.push({
      id: day,
      day,
      title: item.title,
      artist: item.artist,
      season: 'Autumn',
      duration: formatDuration(durationSec),
      fileName: `${dayPad}_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`,
      liked: day === 230 || day === 241 || day === 251,
    });
  });

  // User Provided Winter Tracks (271 - 354 and 365)
  const winterList: { [key: number]: { title: string; artist: string } } = {
    271: { title: 'Hurt', artist: 'Johnny Cash' },
    272: { title: 'The Sound of Silence', artist: 'Disturbed' },
    273: { title: 'Mad World', artist: 'Gary Jules' },
    274: { title: 'Creep', artist: 'Radiohead' },
    275: { title: 'Fake Plastic Trees', artist: 'Radiohead' },
    276: { title: 'No Surprises', artist: 'Radiohead' },
    277: { title: 'How to Disappear Completely', artist: 'Radiohead' },
    278: { title: 'Hallelujah', artist: 'Jeff Buckley' },
    279: { title: 'I Will Follow You into the Dark', artist: 'Death Cab for Cutie' },
    280: { title: 'Soul Meets Body', artist: 'Death Cab for Cutie' },
    281: { title: 'Un-break My Heart', artist: 'Toni Braxton' },
    282: { title: 'I Will Always Love You', artist: 'Whitney Houston' },
    283: { title: 'My Heart Will Go On', artist: 'Celine Dion' },
    284: { title: 'All by Myself', artist: 'Celine Dion' },
    285: { title: 'The Power of Love', artist: 'Celine Dion' },
    286: { title: 'Without You', artist: 'Mariah Carey' },
    287: { title: 'Hero', artist: 'Mariah Carey' },
    288: { title: 'We Belong Together', artist: 'Mariah Carey' },
    289: { title: 'Back to Black', artist: 'Amy Winehouse' },
    290: { title: 'Love is a Losing Game', artist: 'Amy Winehouse' },
    291: { title: 'Rehab', artist: 'Amy Winehouse' },
    292: { title: 'You Know I’m No Good', artist: 'Amy Winehouse' },
    293: { title: 'Hold Me While You Wait', artist: 'Lewis Capaldi' },
    294: { title: 'Bruises', artist: 'Lewis Capaldi' },
    295: { title: 'Forever', artist: 'Lewis Capaldi' },
    296: { title: 'Lost on You', artist: 'Lewis Capaldi' },
    297: { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber' },
    298: { title: 'Without You', artist: 'The Kid LAROI' },
    299: { title: 'Lucid Dreams', artist: 'Juice WRLD' },
    300: { title: 'All Girls Are The Same', artist: 'Juice WRLD' },
    301: { title: 'Robbery', artist: 'Juice WRLD' },
    302: { title: 'Sad!', artist: 'XXXTENTACION' },
    303: { title: 'Moonlight', artist: 'XXXTENTACION' },
    304: { title: 'Changes', artist: 'XXXTENTACION' },
    305: { title: 'Hope', artist: 'XXXTENTACION' },
    306: { title: 'Jocelyn Flores', artist: 'XXXTENTACION' },
    307: { title: 'Everybody Dies In Their Nightmares', artist: 'XXXTENTACION' },
    308: { title: 'Depression & Obsession', artist: 'XXXTENTACION' },
    309: { title: 'Fuck Love', artist: 'XXXTENTACION ft. Trippie Redd' },
    310: { title: 'Look At Me!', artist: 'XXXTENTACION' },
    311: { title: 'Toxic', artist: 'BoyWithUke' },
    312: { title: 'Human', artist: 'Rag’n’Bone Man' },
    313: { title: 'Young Dumb & Broke', artist: 'Khalid' },
    314: { title: 'In the End', artist: 'Linkin Park' },
    315: { title: 'Numb', artist: 'Linkin Park' },
    316: { title: 'Crawling', artist: 'Linkin Park' },
    317: { title: 'Somewhere I Belong', artist: 'Linkin Park' },
    318: { title: 'Breaking the Habit', artist: 'Linkin Park' },
    319: { title: 'Take Me to Church', artist: 'Hozier' },
    320: { title: 'Work Song', artist: 'Hozier' },
    321: { title: 'Cherry Wine', artist: 'Hozier' },
    322: { title: 'From Eden', artist: 'Hozier' },
    323: { title: 'Someone New', artist: 'Hozier' },
    324: { title: 'The Night We Met', artist: 'Lord Huron' },
    325: { title: 'Skinny Love', artist: 'Bon Iver' },
    326: { title: 'Holocene', artist: 'Bon Iver' },
    327: { title: 'i left my home', artist: 'Traditional' },
    328: { title: 'home', artist: 'Traditional' },
    329: { title: 'ለምን', artist: 'Aster Aweke' },
    330: { title: 'አይኔ የጠበቀሽ ነው', artist: 'Teddy Afro' },
    331: { title: 'ያብሌ', artist: 'Traditional' },
    332: { title: 'ባቡሪ', artist: 'Mahmoud Ahmed' },
    333: { title: 'ብሌኔ', artist: 'Eyob Mekonnen' },
    334: { title: 'ምን ቀረኝ', artist: 'Abinet Agonafir' },
    335: { title: 'ይሉኝታ', artist: 'Traditional' },
    336: { title: 'ባይተዋር', artist: 'Traditional' },
    337: { title: 'ባይ ባይ', artist: 'Traditional' },
    338: { title: 'ክረምቱን በናዝሪት', artist: 'Mahmoud Ahmed' },
    339: { title: 'በናዝሪት', artist: 'Teddy Afro' },
    340: { title: 'matushika', artist: 'Traditional' },
    341: { title: 'kamin', artist: 'Traditional' },
    342: { title: '16 tons', artist: 'Geoff Castellucci' },
    343: { title: 'smooth criminal', artist: 'Michael Jackson' },
    344: { title: 'earth song', artist: 'Michael Jackson' },
    345: { title: 'what a wonderful world', artist: 'Louis Armstrong' },
    346: { title: 'barbie girl', artist: 'Aqua' },
    347: { title: 'free now', artist: 'Sleeping at Last' },
    348: { title: 'i will never fall in love again', artist: 'Dionne Warwick' },
    349: { title: 'girl on fire', artist: 'Alicia Keys' },
    350: { title: 'human', artist: 'Rag’n’Bone Man' },
    351: { title: 'young dumb & broke', artist: 'Khalid' },
    352: { title: 'sigma boy', artist: 'Betsy & Maria' },
    353: { title: 'take my body', artist: 'Traditional' },
    354: { title: 'built the catch', artist: 'Traditional' },
    365: { title: 'Final Winter Song', artist: 'Traditional' },
  };

  Object.entries(winterList).forEach(([dayStr, item]) => {
    const day = Number(dayStr);
    const durationSec = 220 + ((day * 9) % 85);
    const dayPad = String(day).padStart(3, '0');
    songs.push({
      id: day,
      day,
      title: item.title,
      artist: item.artist,
      season: 'Winter',
      duration: formatDuration(durationSec),
      fileName: `${dayPad}_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.mp3`,
      liked: day === 271 || day === 272 || day === 278 || day === 314,
    });
  });

  // Sort by day order
  songs.sort((a, b) => a.day - b.day);

  return songs;
}
