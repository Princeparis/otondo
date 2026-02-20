"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function GlobalAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    isMuted,
    togglePlay,
    toggleMute,
    closePlayer,
    seek,
  } = useAudio();

  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server or if no track is loaded
  if (!mounted || !currentTrack) return null;

  // Hide the global player if we are on the specific story's detail page,
  // because the LargeAudioPlayer will be visible there.
  // We assume the URL is /stories/[slug]
  if (
    currentTrack.storySlug &&
    pathname === `/stories/${currentTrack.storySlug}`
  ) {
    return null;
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl bg-[#fafaf8] border border-[#e6e4e0] shadow-xl rounded-2xl p-3 flex items-center justify-between z-50 animate-in slide-in-from-bottom-5">
      {/* Track Info */}
      <div className="flex items-center gap-3 w-1/3">
        {currentTrack.coverUrl ? (
          <div className="w-12 h-12 rounded-lg bg-[#f0eeeb] flex-shrink-0 overflow-hidden relative border border-[#e6e4e0]">
            <Image
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#f0eeeb] flex-shrink-0 flex items-center justify-center text-[#1a1a1a] font-bold border border-[#e6e4e0]">
            {currentTrack.title.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#1a1a1a] truncate">
            {currentTrack.title}
          </p>
          {currentTrack.storySlug && (
            <Link
              href={`/stories/${currentTrack.storySlug}`}
              className="text-xs font-semibold text-[#78756f] hover:text-[#1a1a1a] transition-colors truncate"
            >
              Return to story
            </Link>
          )}
        </div>
      </div>

      {/* Controls & Progress */}
      <div className="flex-1 flex flex-col items-center px-4">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] text-[#fafaf8] flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#78756f] w-8 text-right tabular-nums">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1.5 bg-[#f0eeeb] rounded-full appearance-none cursor-pointer accent-[#1a1a1a]"
          />
          <span className="text-[10px] font-bold text-[#78756f] w-8 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 w-1/3">
        <button
          onClick={toggleMute}
          className="p-2 text-[#78756f] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-full transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={closePlayer}
          className="p-2 text-[#78756f] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
