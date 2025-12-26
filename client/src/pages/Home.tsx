import { useState, useMemo } from "react";
import { ChannelGrid } from "@/components/ChannelGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useCategorizedChannels, type Channel } from "@/hooks/use-iptv";
import { Loader2, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

type ViewMode = "categories" | "channels";

export default function Home() {
  const { categorized, allChannels, isLoading } = useCategorizedChannels();
  const [selectedChannel, setSelectedChannel] = useState<Channel | undefined>();
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayedChannels = useMemo(() => {
    console.log("displayedChannels recalculating - selectedCategory:", selectedCategory);
    console.log("displayedChannels recalculating - categorized:", Object.keys(categorized));
    
    if (selectedCategory === "كل القنوات") {
      console.log("Showing all channels:", allChannels.length);
      return allChannels;
    }
    if (selectedCategory && categorized[selectedCategory]) {
      console.log("Showing category:", selectedCategory, "count:", categorized[selectedCategory].length);
      return categorized[selectedCategory];
    }
    console.log("No channels to display");
    return [];
  }, [selectedCategory, categorized, allChannels]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode("channels");
    setSelectedChannel(undefined);
  };

  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setSelectedChannel(undefined);
  };

  return (
    <div className="min-h-screen h-screen w-full bg-background overflow-hidden flex flex-col lg:flex-row">
      {/* Sidebar / Channels Section */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full lg:w-[30%] xl:w-[350px] h-[45vh] lg:h-full flex flex-col bg-secondary/20 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">IPTV</h1>
          </div>
          {isLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
        </div>

        {/* Back Button (when in channels view) */}
        {viewMode === "channels" && (
          <div className="px-4 py-3 border-b border-white/10">
            <button
              onClick={handleBackToCategories}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              data-testid="button-back-to-categories"
            >
              ← العودة للفئات
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "categories" ? (
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {/* All Channels Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick("كل القنوات")}
                className="px-4 py-3 rounded-2xl bg-accent/20 border border-accent/30 text-foreground hover:bg-accent/30 hover:border-accent/50 transition-all text-sm font-semibold text-center"
                data-testid="button-category-all"
              >
                كل القنوات
                <p className="text-xs text-muted-foreground mt-1">
                  {allChannels.length.toLocaleString()} قناة
                </p>
              </motion.button>

              {/* Category Buttons */}
              {Object.entries(categorized).map(([category, channels]) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category)}
                  className="px-4 py-3 rounded-2xl bg-primary/15 border border-primary/30 text-foreground hover:bg-primary/25 hover:border-primary/50 transition-all text-sm font-semibold text-center"
                  data-testid={`button-category-${category}`}
                >
                  {category}
                  <p className="text-xs text-muted-foreground mt-1">
                    {channels.length} قناة
                  </p>
                </motion.button>
              ))}
            </div>
          ) : (
            <ChannelGrid
              channels={displayedChannels}
              isLoading={isLoading}
              onSelectChannel={setSelectedChannel}
              selectedChannelId={selectedChannel?.id}
            />
          )}
        </div>
      </motion.div>

      {/* Player Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex-1 h-[55vh] lg:h-full p-4 lg:p-6 flex flex-col min-w-0"
      >
        <VideoPlayer channel={selectedChannel} />
      </motion.div>
    </div>
  );
}
