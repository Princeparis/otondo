"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";


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
  if (!currentTrack) return null;

  if (["/login", "/signup", "/admin/login"].includes(pathname)) return null;

  if (currentTrack.storySlug && pathname === `/stories/${currentTrack.storySlug}`) {
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] max-w-4xl z-50 animate-in slide-in-from-bottom-5 duration-500">
      <div className="rounded-3xl border border-[#dfd8ff] bg-white/95 backdrop-blur-xl shadow-[0_22px_60px_-30px_rgba(68,44,150,0.65)] p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {currentTrack.coverUrl ? (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#f0eeeb] overflow-hidden relative border border-[#ece8df] shrink-0">
                <Image src={currentTrack.coverUrl} alt={currentTrack.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#f3f0ff] text-[#6f5ad9] border border-[#dfd8ff] flex items-center justify-center text-xl font-black shrink-0">
                {currentTrack.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm md:text-base font-black text-[#1a1a1a] truncate">{currentTrack.title}</p>
              {currentTrack.storySlug && (
                <Link
                  href={`/stories/${currentTrack.storySlug}`}
                  className="text-xs font-semibold text-[#6f5ad9] hover:text-[#1a1a1a] transition-colors"
                >
                  Open read-along view
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button
              onClick={toggleMute}
              className="p-2.5 text-[#7f7a72] hover:text-[#1a1a1a] hover:bg-[#f7f6f1] rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-[#1a1a1a] text-[#fafaf8] flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
            <button
              onClick={closePlayer}
              className="p-2 text-[#7f7a72] hover:text-[#1a1a1a] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-bold text-[#8d887f] tabular-nums w-8 text-right">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleProgressChange}
            className="flex-1 h-1.5 md:h-2 bg-[#ece8df] rounded-full appearance-none cursor-pointer accent-[#6f5ad9]"
          />
          <span className="text-[10px] md:text-xs font-bold text-[#8d887f] tabular-nums w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
