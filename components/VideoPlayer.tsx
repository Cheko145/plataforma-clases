'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { SyntheticEvent } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 animate-pulse" />,
});

interface VideoPlayerProps {
  videoId: string;
  playing?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onDuration?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function VideoPlayer({
  videoId,
  playing,
  onTimeUpdate,
  onDuration,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="aspect-video bg-gray-900 rounded-lg" />;
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
      <ReactPlayer
        src={`https://www.youtube.com/watch?v=${videoId}`}
        width="100%"
        height="100%"
        controls={true}
        playing={playing}
        onTimeUpdate={(e: SyntheticEvent<HTMLVideoElement>) =>
          onTimeUpdate?.(e.currentTarget.currentTime)
        }
        onDurationChange={(e: SyntheticEvent<HTMLVideoElement>) =>
          onDuration?.(e.currentTarget.duration)
        }
        onPlay={onPlay}
        onPause={onPause}
      />
    </div>
  );
}
