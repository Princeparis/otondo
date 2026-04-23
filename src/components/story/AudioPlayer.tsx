"use client";

import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";
import { PlayerArtwork } from "@/components/story/player/PlayerArtwork";
import { PlayerBadge } from "@/components/story/player/PlayerBadge";
import { PlayerControls } from "@/components/story/player/PlayerControls";
import { PlayerShell } from "@/components/story/player/PlayerShell";
import { formatTime } from "@/components/story/player/playerShared";
import { usePlayerBreakpoint, PLAYER_BREAKPOINT_RULES } from "@/components/story/playerBreakpoints";
import { useAudio } from "@/contexts/AudioContext";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function AudioPlayer({
  audioUrl,
  coverUrl,
  title,
  storySlug,
  readStoryButton,
}: {
  audioUrl: string;
  coverUrl?: string;
  title: string;
  storySlug: string;
  readStoryButton?: React.ReactNode;
}) {
  const { currentTrack, isPlaying, progress, duration, isMuted, playTrack, togglePlay, toggleMute, seek } =
    useAudio();

  const breakpoint = usePlayerBreakpoint();
  const rules = PLAYER_BREAKPOINT_RULES[breakpoint];
  const [liveMessage, setLiveMessage] = useState("");
  const seekAnnounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isThisTrackPlaying = currentTrack?.url === audioUrl;
  const displayProgress = isThisTrackPlaying ? progress : 0;
  const displayDuration = isThisTrackPlaying ? duration : 0;
  const isActuallyPlaying = isThisTrackPlaying && isPlaying;

  const announceSeek = (nextValue: number) => {
    if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    seekAnnounceTimer.current = setTimeout(() => {
      setLiveMessage(`Seeked to ${formatTime(nextValue)}`);
    }, 240);
  };

  const handlePlayPause = () => {
    if (isThisTrackPlaying) {
      togglePlay();
      setLiveMessage(isPlaying ? "Paused" : "Playing");
      return;
    }

    playTrack({ url: audioUrl, title, coverUrl, storySlug });
    setLiveMessage("Playing");
  };

  useEffect(() => {
    return () => {
      if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    };
  }, []);

  return (
    <PlayerShell className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-audio-surface">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      <div className="relative min-h-[260px] flex-1 overflow-hidden bg-linear-to-b from-[#e8e2ff] via-[#f6f4ff] to-audio-surface">
        <PlayerArtwork coverUrl={coverUrl} title={title} />
        <div className="atmospheric-float absolute inset-0 bg-linear-to-t from-audio-surface via-audio-surface/40 to-transparent motion-reduce:animate-none" />
      </div>

      <div className="relative -mt-14 rounded-t-[2.5rem] border-t border-audio-border/70 bg-audio-surface/95 backdrop-blur-xl">
        <div className={cn("mx-auto max-w-2xl", rules.spacing.pageSurfacePadding)}>
          <div className="flex flex-col items-center">
            <PlayerBadge className="mb-3">
              <BookOpen className="h-3.5 w-3.5" /> Read + Listen
            </PlayerBadge>

            <h3
              className={cn(
                "line-clamp-2 max-w-xl px-2 text-center leading-tight font-black text-foreground",
                rules.typography.title,
              )}
            >
              {title}
            </h3>

            <div className="mt-5 w-full max-w-xl">
              <SoundWaveSeeker
                className={cn(rules.waveform.height, rules.waveform.container)}
                value={displayProgress}
                max={displayDuration || 100}
                onChange={(event) => {
                  if (!isThisTrackPlaying) return;
                  const nextValue = Number(event.target.value);
                  seek(nextValue);
                  announceSeek(nextValue);
                }}
                onSeekStep={(nextValue) => {
                  if (!isThisTrackPlaying) return;
                  seek(nextValue);
                  announceSeek(nextValue);
                }}
                onPlayPauseShortcut={handlePlayPause}
                disabled={!isThisTrackPlaying}
                isPlaying={isActuallyPlaying}
                barCount={rules.waveform.barCount + 4}
                ariaValueText={`${formatTime(displayProgress)} of ${formatTime(displayDuration)}`}
              />

              <div className={cn("mt-2.5 flex justify-between px-1 font-bold tabular-nums text-audio-muted", rules.typography.meta)}>
                <span>{formatTime(displayProgress)}</span>
                <span>{formatTime(displayDuration)}</span>
              </div>
            </div>

            <div className="mt-5 w-full max-w-xl">
              <PlayerControls
                density="immersive"
                isPlaying={isActuallyPlaying}
                isMuted={isMuted && isThisTrackPlaying}
                onPlayPause={handlePlayPause}
                onMute={() => {
                  toggleMute();
                  setLiveMessage(isMuted ? "Unmuted" : "Muted");
                }}
                muteDisabled={!isThisTrackPlaying}
                rightSlot={
                  readStoryButton ? (
                    <>
                      <div className="sm:hidden h-11 w-11" aria-hidden />
                      <div className="hidden sm:inline-flex">{readStoryButton}</div>
                    </>
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
    </PlayerShell>
  );
}
