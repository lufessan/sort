import { useState, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { Search, Star, Tv } from "lucide-react";
import { Channel } from "@/hooks/use-iptv";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface ChannelListProps {
  channels: Channel[];
  isLoading: boolean;
  onSelectChannel: (channel: Channel) => void;
  selectedChannelId?: string;
}

export function ChannelList({ channels, isLoading, onSelectChannel, selectedChannelId }: ChannelListProps) {
  const [search, setSearch] = useState("");
  const { data: favorites = [] } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const filteredChannels = useMemo(() => {
    if (!search) return channels;
    const lowerSearch = search.toLowerCase();
    return channels.filter(c => c.name.toLowerCase().includes(lowerSearch));
  }, [channels, search]);

  const toggleFavorite = async (e: React.MouseEvent, channel: Channel) => {
    e.stopPropagation();
    const existing = favorites.find(f => f.url === channel.url);
    if (existing) {
      removeFavorite.mutate(existing.id);
    } else {
      addFavorite.mutate({
        name: channel.name,
        url: channel.url,
        logo: channel.logo || null,
        group: channel.group || null
      });
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const channel = filteredChannels[index];
    const isSelected = selectedChannelId === channel.id;
    const isFav = favorites.some(f => f.url === channel.url);

    return (
      <div style={style} className="px-2 py-1">
        <button
          onClick={() => onSelectChannel(channel)}
          className={cn(
            "w-full h-full flex items-center gap-3 px-3 rounded-lg text-left transition-all duration-200",
            isSelected 
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/20" 
              : "hover:bg-black/5 text-foreground"
          )}
        >
          {/* Logo Placeholder or Image */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center overflow-hidden",
            isSelected ? "bg-white/20" : "bg-black/5"
          )}>
            {channel.logo ? (
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
              />
            ) : null}
            <Tv className={cn("w-5 h-5", channel.logo && "hidden")} />
          </div>

          {/* Text Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{channel.name}</p>
            {channel.group && (
              <p className={cn("text-xs truncate opacity-70", isSelected ? "text-white/80" : "text-muted-foreground")}>
                {channel.group}
              </p>
            )}
          </div>

          {/* Favorite Button */}
          <div 
            role="button"
            onClick={(e) => toggleFavorite(e, channel)}
            className={cn(
              "p-2 rounded-full hover:bg-black/10 transition-colors",
              isFav ? "text-yellow-400 fill-yellow-400" : isSelected ? "text-white/50 hover:text-white" : "text-muted-foreground/30 hover:text-primary"
            )}
          >
            <Star className={cn("w-4 h-4", isFav && "fill-current")} />
          </div>
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white/40 backdrop-blur-md border-l border-white/60">
      {/* Header & Search */}
      <div className="p-4 border-b border-black/5 space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground">Channels</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/50 border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm placeholder:text-muted-foreground"
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <Tv className="w-12 h-12 mb-2 opacity-20" />
            <p>No channels found</p>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }: { height: number; width: number }) => (
              <List
                height={height}
                itemCount={filteredChannels.length}
                itemSize={64}
                width={width}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
      
      {/* Footer Stats */}
      <div className="p-3 text-xs text-center text-muted-foreground border-t border-black/5 bg-white/30">
        {filteredChannels.length.toLocaleString()} Channels Loaded
      </div>
    </div>
  );
}
