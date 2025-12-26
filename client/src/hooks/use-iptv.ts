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

function parseM3U(content: string, source: 'global' | 'arab'): Channel[] {
  console.log(`Parsing ${source} M3U, content length: ${content.length}`);
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    if (line.startsWith('#EXTINF:')) {
      // Improved regex to handle various M3U formats
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
    } else if (!line.startsWith('#') && (line.startsWith('http') || line.startsWith('https') || line.includes('://'))) {
      if (currentChannel.name) {
        channels.push({
          id: `${source}-${channels.length}-${currentChannel.name}`,
          name: currentChannel.name,
          url: line,
          logo: currentChannel.logo,
          group: currentChannel.group,
          source
        });
        currentChannel = {};
      }
    }
  }
  console.log(`Found ${channels.length} channels in ${source}`);
  return channels;
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

      console.log(`Global raw length: ${globalText.length}`);
      console.log(`Arab raw length: ${arabText.length}`);

      const globalChannels = parseM3U(globalText, 'global');
      const arabChannels = parseM3U(arabText, 'arab');

      console.log(`Parsed Global: ${globalChannels.length}`);
      console.log(`Parsed Arab: ${arabChannels.length}`);

      // Merge and deduplicate by name
      const allChannels = [...arabChannels, ...globalChannels]; 
      const uniqueChannels = Array.from(new Map(allChannels.map(c => [c.name, c])).values());

      console.log(`Total unique channels: ${uniqueChannels.length}`);
      return uniqueChannels;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false
  });
}
