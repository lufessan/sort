import ReactPlayer from 'react-player';
import { PlayCircle, AlertCircle } from 'lucide-react';
import { Channel } from '@/hooks/use-iptv';

interface VideoPlayerProps {
  channel?: Channel;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  if (!channel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-black/5 rounded-2xl border border-white/50 backdrop-blur-sm">
        <PlayCircle className="w-20 h-20 mb-4 opacity-20" />
        <h3 className="text-xl font-display font-semibold">Select a Channel</h3>
        <p className="opacity-60">Choose from the list to start streaming</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Player Container - 16:9 Aspect Ratio enforced by layout usually, but here flex-1 */}
      <div className="flex-1 relative bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/20 ring-1 ring-white/20">
        <ReactPlayer
          url={channel.url}
          width="100%"
          height="100%"
          controls
          playing
          onError={(e) => console.error("Player Error:", e)}
        />
        
        {/* Overlay Title (Visible on hover if needed, or static) */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h2 className="text-white text-lg font-bold drop-shadow-md">{channel.name}</h2>
          {channel.group && <span className="text-white/80 text-sm bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">{channel.group}</span>}
        </div>
      </div>

      {/* Channel Info Card */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-1">{channel.name}</h1>
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                Live
              </span>
              {channel.group && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-black/5">
                  {channel.group}
                </span>
              )}
            </div>
          </div>
          {channel.logo && (
            <img 
              src={channel.logo} 
              alt={channel.name} 
              className="h-12 w-auto max-w-[100px] object-contain drop-shadow-sm" 
            />
          )}
        </div>
      </div>
    </div>
  );
}
