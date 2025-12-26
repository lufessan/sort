import { useState, useMemo } from "react";
import { Search, Tv } from "lucide-react";
import { Channel } from "@/hooks/use-iptv";
import { cn } from "@/lib/utils";

interface ChannelGridProps {
  channels: Channel[];
  isLoading: boolean;
  onSelectChannel: (channel: Channel) => void;
  selectedChannelId?: string;
}

export function ChannelGrid({ channels, isLoading, onSelectChannel, selectedChannelId }: ChannelGridProps) {
  const [search, setSearch] = useState("");

  const filteredChannels = useMemo(() => {
    if (!search) return channels;
    const lowerSearch = search.toLowerCase();
    return channels.filter(c => c.name.toLowerCase().includes(lowerSearch));
  }, [channels, search]);

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2 rounded-xl glass-input placeholder:text-muted-foreground text-sm"
          placeholder="ابحث عن قناة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="input-search-channels"
        />
      </div>

      {/* Channels Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
            <Tv className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">لا توجد قنوات</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {filteredChannels.map((channel) => {
              const isSelected = selectedChannelId === channel.id;
              
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border transition-all duration-200 flex items-center justify-center",
                    "hover:scale-105 active:scale-95",
                    isSelected
                      ? "border-primary/50 bg-primary/20 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
                      : "border-white/10 bg-secondary/30 hover:border-white/20 hover:bg-secondary/50"
                  )}
                  title={channel.name}
                  data-testid={`button-channel-${channel.id}`}
                >
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Tv className={cn("w-6 h-6 text-muted-foreground/60", channel.logo && "hidden")} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="text-xs text-center text-muted-foreground">
          {filteredChannels.length} / {channels.length} قنوات
        </div>
      )}
    </div>
  );
}
