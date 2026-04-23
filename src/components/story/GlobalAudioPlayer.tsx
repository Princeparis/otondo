"use client";

import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";
import { PlayerArtwork } from "@/components/story/player/PlayerArtwork";
import { PlayerControls } from "@/components/story/player/PlayerControls";
import { PlayerShell } from "@/components/story/player/PlayerShell";
import { formatTime } from "@/components/story/player/playerShared";
import { usePlayerBreakpoint, PLAYER_BREAKPOINT_RULES } from "@/components/story/playerBreakpoints";
import { useAudio } from "@/contexts/AudioContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function GlobalAudioPlayer() {
  const { currentTrack, isPlaying, progress, duration, isMuted, togglePlay, toggleMute, closePlayer, seek } =
    useAudio();

  const breakpoint = usePlayerBreakpoint();
  const rules = PLAYER_BREAKPOINT_RULES[breakpoint];
  const pathname = usePathname();
  const [liveMessage, setLiveMessage] = useState("");
  const seekAnnounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    };
  }, []);

  if (!currentTrack) return null;
  if (["/login", "/signup", "/admin/login"].includes(pathname)) return null;
  if (currentTrack.storySlug && pathname === `/stories/${currentTrack.storySlug}`) return null;

  const announceSeek = (nextValue: number) => {
    if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    seekAnnounceTimer.current = setTimeout(() => {
      setLiveMessage(`Seeked to ${formatTime(nextValue)}`);
    }, 240);
  };

  return (
    <div className="fixed right-0 bottom-3 left-0 z-50 px-2 sm:bottom-4 sm:px-4">
      <PlayerShell className="animate-in slide-in-from-bottom-6 mx-auto max-w-5xl rounded-3xl border border-audio-border/80 bg-white/92 shadow-[0_28px_80px_-42px_rgba(66,44,150,0.88)] backdrop-blur-2xl duration-500 motion-reduce:animate-none">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        <div className={cn("space-y-3", rules.spacing.dockSurfacePadding)}>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex flex-1 items-center gap-3">
              <PlayerArtwork coverUrl={currentTrack.coverUrl} title={currentTrack.title} dense />
              <div className="min-w-0">
                <p className={cn("truncate font-black text-foreground", rules.typography.title)} title={currentTrack.title}>
                  {currentTrack.title}
                </p>
                {currentTrack.storySlug ? (
                  <Link
                    href={`/stories/${currentTrack.storySlug}`}
                    className="text-xs font-semibold text-audio-accent transition-colors hover:text-foreground"
                  >
                    Open immersive read-along
                  </Link>
                ) : null}
              </div>
            </div>

            <PlayerControls
              density="compact"
              isPlaying={isPlaying}
              isMuted={isMuted}
              onPlayPause={() => {
                togglePlay();
                setLiveMessage(isPlaying ? "Paused" : "Playing");
              }}
              onMute={() => {
                toggleMute();
                setLiveMessage(isMuted ? "Unmuted" : "Muted");
              }}
              onClose={closePlayer}
            />
          </div>

          <div className={cn("flex items-center", rules.waveform.density)}>
            <span className={cn("w-8 text-right font-bold tabular-nums text-audio-muted", rules.typography.meta)}>
              {formatTime(progress)}
            </span>
            <SoundWaveSeeker
              className={cn("flex-1", rules.waveform.height, rules.waveform.container)}
              value={progress}
              max={duration || 100}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                seek(nextValue);
                announceSeek(nextValue);
              }}
              onSeekStep={(nextValue) => {
                seek(nextValue);
                announceSeek(nextValue);
              }}
              onPlayPauseShortcut={() => {
                togglePlay();
                setLiveMessage(isPlaying ? "Paused" : "Playing");
              }}
              isPlaying={isPlaying}
              barCount={rules.waveform.barCount}
              ariaValueText={`${formatTime(progress)} of ${formatTime(duration)}`}
            />
            <span className={cn("w-8 font-bold tabular-nums text-audio-muted", rules.typography.meta)}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </PlayerShell>
    </div>
  );
}
