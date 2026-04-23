"use client";

import { useAudio } from "@/contexts/AudioContext";
import { BookOpen, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";
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
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    isMuted,
    playTrack,
    togglePlay,
    toggleMute,
    seek,
  } = useAudio();
  const breakpoint = usePlayerBreakpoint();
  const responsiveRules = PLAYER_BREAKPOINT_RULES[breakpoint];

  const isThisTrackPlaying = currentTrack?.url === audioUrl;
  const [liveMessage, setLiveMessage] = useState("");
  const seekAnnounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlayClick = () => {
    if (isThisTrackPlaying) {
      togglePlay();
      setLiveMessage(isPlaying ? "Paused" : "Playing");
      return;
    }

    playTrack({ url: audioUrl, title, coverUrl, storySlug });
    setLiveMessage("Playing");
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isThisTrackPlaying) return;
    const nextValue = Number(e.target.value);
    seek(nextValue);
    announceSeek(nextValue);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const displayProgress = isThisTrackPlaying ? progress : 0;
  const displayDuration = isThisTrackPlaying ? duration : 0;
  const isActuallyPlaying = isThisTrackPlaying && isPlaying;
  const seekValueText = `${formatTime(displayProgress)} of ${formatTime(displayDuration)}`;

  const announceSeek = (nextValue: number) => {
    if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    seekAnnounceTimer.current = setTimeout(() => {
      setLiveMessage(`Seeked to ${formatTime(nextValue)}`);
    }, 320);
  };

  const handleSeekStep = (nextValue: number) => {
    if (!isThisTrackPlaying) return;
    seek(nextValue);
    announceSeek(nextValue);
  };

  const handlePlayPauseShortcut = () => {
    if (!isThisTrackPlaying) return;
    togglePlay();
    setLiveMessage(isPlaying ? "Paused" : "Playing");
  };

  useEffect(() => {
    return () => {
      if (seekAnnounceTimer.current) clearTimeout(seekAnnounceTimer.current);
    };
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fafaf8]">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      <div className="relative w-full flex-1 overflow-hidden bg-linear-to-b from-[#ece9ff] via-[#f4f3ea] to-[#fafaf8]">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover opacity-85" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-8xl font-black text-[#1a1a1a]/20">
            {title.charAt(0)}
          </div>
        )}
        <div className="atmospheric-float absolute inset-0 bg-linear-to-t from-[#fafaf8] via-[#fafaf8]/55 to-transparent motion-reduce:animate-none" />
      </div>

      <div
        className={cn(
          "pointer-events-none -mt-12 flex flex-none flex-col items-center rounded-t-[2.5rem] border-t border-[#ece8df] bg-[#fafaf8]/95 shadow-[0_-16px_36px_-20px_rgba(38,24,93,0.45)] backdrop-blur",
          responsiveRules.spacing.pageSurfacePadding,
        )}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e6e4e0] bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#78756f] uppercase">
          <BookOpen className="h-3.5 w-3.5" /> Read + Listen
        </PlayerBadge>

        <h3
          className={cn(
            "min-h-[3.5rem] line-clamp-2 max-w-sm px-3 text-center leading-tight font-black text-[#1a1a1a]",
            responsiveRules.typography.title,
          )}
        >
          {title}
        </h3>

        <div className="pointer-events-auto mt-4 w-full max-w-sm">
          <SoundWaveSeeker
            className={cn(
              responsiveRules.waveform.height,
              responsiveRules.waveform.container,
            )}
            value={displayProgress}
            max={displayDuration || 100}
            onChange={handleProgressChange}
            onSeekStep={handleSeekStep}
            onPlayPauseShortcut={handlePlayPauseShortcut}
            disabled={!isThisTrackPlaying}
            isPlaying={isActuallyPlaying}
            ariaValueText={seekValueText}
          />
          <div
            className={cn(
              "mt-2.5 flex justify-between px-1 font-bold tabular-nums text-[#938f88]",
              responsiveRules.typography.meta,
            )}
          >
            <span>{formatTime(displayProgress)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        <div className="pointer-events-auto mt-5 grid w-full max-w-sm grid-cols-3 items-center">
          <div className="flex justify-end pr-4 sm:pr-8">
            <button
              onClick={() => {
                toggleMute();
                setLiveMessage(isMuted ? "Unmuted" : "Muted");
              }}
              disabled={!isThisTrackPlaying}
              className="focus-visible-ring rounded-full p-3 text-[#6c6963] transition-all duration-140 ease-out hover:bg-[#f0eeeb] hover:text-[#1a1a1a] active:scale-95 disabled:opacity-50"
              aria-label={isMuted && isThisTrackPlaying ? "Unmute audio" : "Mute audio"}
              aria-pressed={isMuted && isThisTrackPlaying}
            >
              {isMuted && isThisTrackPlaying ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePlayClick}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Enter") {
                  event.preventDefault();
                  handlePlayClick();
                }
              }}
              className="focus-visible-ring flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#1a1a1a] text-[#fafaf8] shadow-[0_14px_30px_-12px_rgba(45,31,95,0.6)] transition-transform duration-140 ease-out hover:scale-105 active:scale-95"
              aria-label={isActuallyPlaying ? "Pause audio" : "Play audio"}
              aria-pressed={isActuallyPlaying}
            >
              {isActuallyPlaying ? <Pause size={34} className="fill-current" /> : <Play size={34} className="ml-1 fill-current" />}
            </button>
          </div>

          <div className="flex min-h-11 justify-start pl-4 sm:pl-8">
            {readStoryButton ? (
              <>
                <div className="sm:hidden h-11 w-11" aria-hidden />
                <div className="hidden sm:inline-flex">{readStoryButton}</div>
              </>
            ) : (
              <div className="h-11 w-11" />
            )}
          </div>
        </div>
      </div>
    </PlayerShell>
  );
}
