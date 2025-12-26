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
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      const info = line.substring(8);
      const parts = info.split(',');
      const name = parts[parts.length - 1].trim();
      
      // Extract attributes like tvg-logo, group-title
      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      const groupMatch = line.match(/group-title="([^"]*)"/);

      currentChannel = {
        name,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : undefined,
        source
      };
    } else if (line.startsWith('http')) {
      // URL line
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

      const globalText = await globalRes.text();
      const arabText = await arabRes.text();

      const globalChannels = parseM3U(globalText, 'global');
      const arabChannels = parseM3U(arabText, 'arab');

      // Merge and deduplicate by name
      const allChannels = [...arabChannels, ...globalChannels]; // Prioritize Arab playlist
      const seen = new Set();
      const uniqueChannels = allChannels.filter(channel => {
        const duplicate = seen.has(channel.name);
        seen.add(channel.name);
        return !duplicate;
      });

      return uniqueChannels;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false
  });
}
