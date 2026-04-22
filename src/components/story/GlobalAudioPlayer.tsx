"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";

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
    <div className="animate-in slide-in-from-bottom-5 fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-4xl -translate-x-1/2 duration-500">
      <div className="rounded-3xl border border-[#dfd8ff] bg-white/95 p-3 shadow-[0_22px_60px_-30px_rgba(68,44,150,0.65)] backdrop-blur-xl md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {currentTrack.coverUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#ece8df] bg-[#f0eeeb] md:h-14 md:w-14">
                <Image src={currentTrack.coverUrl} alt={currentTrack.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#dfd8ff] bg-[#f3f0ff] text-xl font-black text-[#6f5ad9] md:h-14 md:w-14">
                {currentTrack.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#1a1a1a] md:text-base">{currentTrack.title}</p>
              {currentTrack.storySlug && (
                <Link
                  href={`/stories/${currentTrack.storySlug}`}
                  className="text-xs font-semibold text-[#6f5ad9] transition-colors hover:text-[#1a1a1a]"
                >
                  Open read-along view
                </Link>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-[#ebe6ff] bg-[#faf9ff] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={toggleMute}
                className="rounded-full p-2.5 text-[#7f7a72] transition-colors hover:bg-[#f7f6f1] hover:text-[#1a1a1a]"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={togglePlay}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1a1a1a] text-[#fafaf8] transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>
              <button
                onClick={closePlayer}
                className="rounded-full p-2 text-[#7f7a72] transition-colors hover:text-[#1a1a1a]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="w-8 text-right text-[10px] font-bold tabular-nums text-[#8d887f] md:text-xs">
            {formatTime(progress)}
          </span>
          <SoundWaveSeeker
            className="h-11 min-w-0 flex-1"
            value={progress}
            max={duration || 100}
            onChange={handleProgressChange}
            isPlaying={isPlaying}
            barCount={36}
          />
          <span className="w-8 text-[10px] font-bold tabular-nums text-[#8d887f] md:text-xs">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
