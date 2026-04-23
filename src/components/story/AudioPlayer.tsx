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
import { BookOpen, Sparkles } from "lucide-react";
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

      <div className="pointer-events-none absolute -top-20 left-1/2 z-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#8f7cff]/30 blur-3xl lg:h-64 lg:w-64" />
      <div className="pointer-events-none absolute -right-20 top-1/3 z-0 h-56 w-56 rounded-full bg-[#d0c6ff]/40 blur-3xl" />

      <div className="relative min-h-[300px] flex-1 overflow-hidden bg-linear-to-b from-[#ddd2ff] via-[#f4f1ff] to-audio-surface px-4 pt-4">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.88),transparent_48%),radial-gradient(circle_at_80%_30%,rgba(133,110,255,0.22),transparent_52%)]" />
        <PlayerArtwork coverUrl={coverUrl} title={title} />
        <div className="atmospheric-float absolute inset-0 bg-linear-to-t from-audio-surface via-audio-surface/40 to-transparent motion-reduce:animate-none" />
      </div>

      <div className="relative z-10 -mt-16 rounded-t-[2.5rem] border-t border-white/80 bg-audio-surface/95 shadow-[0_-20px_80px_-40px_rgba(84,63,190,0.6)] backdrop-blur-xl">
        <div className={cn("mx-auto max-w-2xl", rules.spacing.pageSurfacePadding)}>
          <div className="flex flex-col items-center">
            <PlayerBadge className="mb-3 border-white/90 bg-white/85 shadow-[0_14px_35px_-26px_rgba(49,34,125,0.9)] backdrop-blur-md">
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

            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-audio-accent shadow-[0_10px_25px_-18px_rgba(57,41,150,0.85)]">
              <Sparkles className="h-3.5 w-3.5" />
              immersive mode
            </div>

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

            <div className="mt-5 w-full max-w-xl rounded-[1.6rem] border border-white/80 bg-white/75 p-2.5 shadow-[0_22px_55px_-32px_rgba(58,40,156,0.95)] backdrop-blur-md">
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
                rightSlot={readStoryButton}
              />
            </div>
          </div>
        </div>
      </div>
    </PlayerShell>
  );
}
