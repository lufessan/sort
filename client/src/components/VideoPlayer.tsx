import { PlayCircle, AlertCircle } from 'lucide-react';
import { Channel } from '@/hooks/use-iptv';
import { useState } from 'react';

interface VideoPlayerProps {
  channel?: Channel;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const [playerError, setPlayerError] = useState(false);

  if (!channel) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-black relative overflow-hidden rounded-2xl">
        <PlayCircle className="w-20 h-20 mb-4 opacity-20" />
        <h3 className="text-xl font-display font-semibold text-foreground">اختر قناة</h3>
        <p className="opacity-60 text-sm">اختر من القائمة لبدء البث</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex flex-col rounded-2xl">
      {playerError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-foreground gap-3">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <p>خطأ في تشغيل القناة</p>
          <p className="text-sm text-muted-foreground">{channel.name}</p>
        </div>
      ) : (
        <>
          <video
            controls
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            onError={(e: any) => {
              console.error("Video Error:", e);
              setPlayerError(true);
            }}
          >
            <source src={channel.url} type="application/x-mpegURL" />
            Your browser does not support HTML5 video.
          </video>
          
          {/* Channel Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-foreground">
            <h2 className="text-lg font-bold drop-shadow-md">{channel.name}</h2>
            {channel.group && (
              <p className="text-sm text-white/70">{channel.group}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
