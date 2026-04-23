"use client";

import { useAudio } from "@/contexts/AudioContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { PlayerArtwork } from "@/components/story/player/PlayerArtwork";
import { PlayerControls } from "@/components/story/player/PlayerControls";
import { PlayerShell } from "@/components/story/player/PlayerShell";
import { PlayerTimecodes } from "@/components/story/player/PlayerTimecodes";

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

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(event.target.value));
  };

  return (
    <PlayerShell className="animate-in slide-in-from-bottom-5 fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-4xl -translate-x-1/2 duration-500">
      <div className="rounded-3xl border border-audio-border bg-card/95 p-3 shadow-xl backdrop-blur-xl md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <PlayerArtwork dense coverUrl={currentTrack.coverUrl} title={currentTrack.title} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-foreground md:text-base">{currentTrack.title}</p>
              {currentTrack.storySlug && (
                <Link
                  href={`/stories/${currentTrack.storySlug}`}
                  className="text-xs font-semibold text-audio-accent transition-colors hover:text-foreground"
                >
                  Open read-along view
                </Link>
              )}
            </div>
          </div>

          <PlayerControls
            density="compact"
            isPlaying={isPlaying}
            isMuted={isMuted}
            onPlayPause={togglePlay}
            onMute={toggleMute}
            onClose={closePlayer}
          />
        </div>

        <PlayerTimecodes
          className="mt-3"
          layout="inline"
          seekerClassName="h-11 rounded-xl px-2.5 py-2"
          labelClassName="text-[10px] md:text-xs"
          value={progress}
          max={duration}
          onChange={handleProgressChange}
          isPlaying={isPlaying}
          barCount={36}
        />
      </div>
    </PlayerShell>
  );
}
