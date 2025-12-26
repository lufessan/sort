import { useState } from "react";
import { ChannelList } from "@/components/ChannelList";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useChannels, type Channel } from "@/hooks/use-iptv";
import { LayoutGrid, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: channels = [], isLoading, error } = useChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-2xl max-w-md text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Failed to Load Channels</h2>
          <p className="text-muted-foreground">Please check your internet connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen w-full overflow-hidden flex flex-col md:flex-row-reverse relative">
      {/* Background Decor Elements - Subtle */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

      {/* RIGHT SIDEBAR: Channels (RTL Layout preferred by user request "Sidebar Right") */}
      <motion.aside 
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-[350px] lg:w-[400px] h-[40vh] md:h-full shrink-0 z-20 shadow-2xl shadow-black/5"
      >
        <ChannelList 
          channels={channels} 
          isLoading={isLoading} 
          onSelectChannel={setSelectedChannel}
          selectedChannelId={selectedChannel?.id}
        />
      </motion.aside>

      {/* LEFT CONTENT: Player */}
      <main className="flex-1 h-[60vh] md:h-full p-4 md:p-6 lg:p-8 flex flex-col min-w-0 z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 flex flex-col h-full"
        >
          {/* Top Bar / Logo Area */}
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/25">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  StreamDeck
                </h1>
                <p className="text-xs font-medium text-muted-foreground tracking-wider uppercase">Next-Gen Player</p>
              </div>
            </div>
            
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 px-3 py-1.5 rounded-full border border-white/50">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading Playlist...
              </div>
            )}
          </header>

          {/* Player Area */}
          <div className="flex-1 min-h-0">
            <VideoPlayer channel={selectedChannel} />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
