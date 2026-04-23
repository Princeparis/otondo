"use client";

import { useAudio } from "@/contexts/AudioContext";
import { BookOpen } from "lucide-react";

import { PlayerArtwork } from "@/components/story/player/PlayerArtwork";
import { PlayerBadge } from "@/components/story/player/PlayerBadge";
import { PlayerControls } from "@/components/story/player/PlayerControls";
import { PlayerShell } from "@/components/story/player/PlayerShell";
import { PlayerTimecodes } from "@/components/story/player/PlayerTimecodes";

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

  const isThisTrackPlaying = currentTrack?.url === audioUrl;
  const displayProgress = isThisTrackPlaying ? progress : 0;
  const displayDuration = isThisTrackPlaying ? duration : 0;
  const isActuallyPlaying = isThisTrackPlaying && isPlaying;

  const handlePlayClick = () => {
    if (isThisTrackPlaying) {
      togglePlay();
      return;
    }

    playTrack({ url: audioUrl, title, coverUrl, storySlug });
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isThisTrackPlaying) return;
    seek(Number(event.target.value));
  };

  return (
    <PlayerShell className="relative flex h-full w-full flex-col">
      <div className="relative w-full flex-1 overflow-hidden bg-linear-to-b from-audio-tint via-secondary to-audio-surface">
        <PlayerArtwork coverUrl={coverUrl} title={title} />
        <div className="absolute inset-0 bg-linear-to-t from-audio-surface via-audio-surface/55 to-transparent" />
      </div>

      <div className="-mt-12 flex flex-none flex-col items-center rounded-t-[2.5rem] border-t border-audio-border bg-audio-surface/95 p-7 shadow-xl backdrop-blur lg:p-10">
        <PlayerBadge className="mb-3">
          <BookOpen className="h-3.5 w-3.5" /> Read + Listen
        </PlayerBadge>

        <h3 className="mb-5 line-clamp-2 max-w-sm px-3 text-center text-2xl leading-tight font-black text-foreground">
          {title}
        </h3>

        <PlayerTimecodes
          className="mb-6 w-full max-w-sm"
          value={displayProgress}
          max={displayDuration}
          onChange={handleProgressChange}
          disabled={!isThisTrackPlaying}
          isPlaying={isActuallyPlaying}
        />

        <PlayerControls
          density="immersive"
          isPlaying={isActuallyPlaying}
          isMuted={isThisTrackPlaying && isMuted}
          onPlayPause={handlePlayClick}
          onMute={toggleMute}
          muteDisabled={!isThisTrackPlaying}
          rightSlot={readStoryButton}
        />
      </div>
    </PlayerShell>
  );
}
