import { useQuery } from "@tanstack/react-query";

export interface Channel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
  source: 'global' | 'arab';
}

const CORS_PROXY = "/api/proxy-m3u?url=";
const PLAYLIST_GLOBAL = "https://iptv-org.github.io/iptv/index.m3u";
const PLAYLIST_ARAB = "https://raw.githubusercontent.com/hemzaberkane/ARAB-IPTV/refs/heads/main/ARABIPTV.m3u";

// Define important categories with keywords to match
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "أطفال": ["kids", "children", "cartoon", "kids+", "bein kids", "spacetoon", "baraem", "jeem"],
  "مسلسلات": ["series", "drama", "مسلسل", "show", "fiction", "دراما"],
  "رياضة": ["sport", "sports", "football", "soccer", "كورة", "الدوري", "champions", "nba", "boxing", "الرياضة"],
  "أفلام": ["movie", "cinema", "film", "films", "hd", "أفلام"],
  "أخبار": ["news", "news+", "cnn", "bbc", "العربية", "الجزيرة"],
  "موسيقى": ["music", "song", "mtv", "موسيقى"],
  "ترفيه": ["entertainment", "variety", "show", "تلفزيون"],
  "توثيقي": ["documentary", "documentary+", "nat geo", "animal", "discovery"],
  "دين": ["islamic", "quran", "مستودع", "دين", "إسلام"],
};

function isValidStreamUrl(url: string): boolean {
  try {
    // Only accept HTTP/HTTPS URLs or common stream protocols
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return lower.startsWith('http://') || 
           lower.startsWith('https://') || 
           lower.startsWith('rtmp') ||
           lower.includes('m3u8') ||
           lower.includes('ts');
  } catch {
    return false;
  }
}

function parseM3U(content: string, source: 'global' | 'arab'): Channel[] {
  console.log(`Parsing ${source} M3U, content length: ${content.length}`);
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('#EXTINF:')) {
      const infoMatch = line.match(/#EXTINF:[^,]*,(.*)/);
      const name = infoMatch ? infoMatch[1].trim() : "Unknown Channel";
      
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);

      currentChannel = {
        name,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : undefined,
        source
      };
    } else if (!line.startsWith('#') && isValidStreamUrl(line)) {
      if (currentChannel.name) {
        channels.push({
          id: `${source}-${channels.length}-${currentChannel.name}`,
          name: currentChannel.name,
          url: line.trim(),
          logo: currentChannel.logo,
          group: currentChannel.group,
          source
        });
        currentChannel = {};
      }
    }
  }
  console.log(`Found ${channels.length} valid channels in ${source}`);
  return channels;
}

function categorizeChannels(channels: Channel[]): Record<string, Channel[]> {
  const categorized: Record<string, Channel[]> = {
    "أطفال": [],
    "مسلسلات": [],
    "رياضة": [],
    "أفلام": [],
    "أخبار": [],
    "موسيقى": [],
    "ترفيه": [],
    "توثيقي": [],
    "دين": [],
    "أخرى": []
  };

  // Categorize channels
  channels.forEach(channel => {
    const lowerName = channel.name.toLowerCase();
    const lowerGroup = (channel.group || '').toLowerCase();
    let found = false;

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => lowerName.includes(kw) || lowerGroup.includes(kw))) {
        if (categorized[category].length < 50) {
          categorized[category].push(channel);
          found = true;
          break;
        }
      }
    }

    // Add to "أخرى" if not categorized
    if (!found && categorized["أخرى"].length < 100) {
      categorized["أخرى"].push(channel);
    }
  });

  // Log for debugging
  const stats: any = {};
  Object.entries(categorized).forEach(([cat, chs]) => {
    if (chs.length > 0) stats[cat] = chs.length;
  });
  console.log("Categorized channels:", stats);
  
  return categorized;
}

export function useChannels() {
  return useQuery({
    queryKey: ['iptv-channels'],
    queryFn: async () => {
      const [globalRes, arabRes] = await Promise.all([
        fetch(`${CORS_PROXY}${encodeURIComponent(PLAYLIST_GLOBAL)}`),
        fetch(`${CORS_PROXY}${encodeURIComponent(PLAYLIST_ARAB)}`)
      ]);

      if (!globalRes.ok || !arabRes.ok) {
        throw new Error("Failed to fetch playlists");
      }

      const globalText = await globalRes.text();
      const arabText = await arabRes.text();

      console.log(`Global raw length: ${globalText.length}`);
      console.log(`Arab raw length: ${arabText.length}`);

      const globalChannels = parseM3U(globalText, 'global');
      const arabChannels = parseM3U(arabText, 'arab');

      console.log(`Parsed Global: ${globalChannels.length}`);
      console.log(`Parsed Arab: ${arabChannels.length}`);

      const allChannels = [...arabChannels, ...globalChannels]; 
      const uniqueChannels = Array.from(new Map(allChannels.map(c => [c.name, c])).values());

      console.log(`Total unique channels: ${uniqueChannels.length}`);
      return uniqueChannels;
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false
  });
}

export function useCategorizedChannels() {
  const { data: channels = [], ...rest } = useChannels();
  const categorized = categorizeChannels(channels);
  
  console.log("useCategorizedChannels - channels count:", channels.length);
  console.log("useCategorizedChannels - categorized keys:", Object.keys(categorized));
  
  return {
    ...rest,
    categorized,
    allChannels: channels,
  };
}
