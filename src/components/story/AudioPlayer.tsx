"use client";

import { useAudio } from "@/contexts/AudioContext";
import { BookOpen, Pause, Play, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";

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

  const handlePlayClick = () => {
    if (isThisTrackPlaying) {
      togglePlay();
      return;
    }

    playTrack({ url: audioUrl, title, coverUrl, storySlug });
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isThisTrackPlaying) return;
    seek(Number(e.target.value));
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

  return (
    <div className="relative flex h-full w-full flex-col bg-[#fafaf8]">
      <div className="relative w-full flex-1 overflow-hidden bg-linear-to-b from-[#ece9ff] via-[#f4f3ea] to-[#fafaf8]">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover opacity-85" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-8xl font-black text-[#1a1a1a]/20">
            {title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#fafaf8] via-[#fafaf8]/55 to-transparent" />
      </div>

      <div className="-mt-12 flex flex-none flex-col items-center rounded-t-[2.5rem] border-t border-[#ece8df] bg-[#fafaf8]/95 p-7 shadow-[0_-16px_36px_-20px_rgba(38,24,93,0.45)] backdrop-blur lg:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e6e4e0] bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest text-[#78756f] uppercase">
          <BookOpen className="h-3.5 w-3.5" /> Read + Listen
        </div>

        <h3 className="mb-5 line-clamp-2 max-w-sm px-3 text-center text-2xl leading-tight font-black text-[#1a1a1a]">
          {title}
        </h3>

        <div className="mb-6 w-full max-w-sm">
          <SoundWaveSeeker
            value={displayProgress}
            max={displayDuration || 100}
            onChange={handleProgressChange}
            disabled={!isThisTrackPlaying}
            isPlaying={isActuallyPlaying}
          />
          <div className="mt-2.5 flex justify-between px-1 text-[11px] font-bold tabular-nums text-[#938f88]">
            <span>{formatTime(displayProgress)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        <div className="mb-2 grid w-full grid-cols-3 items-center">
          <div className="flex justify-end pr-4 sm:pr-8">
            <button
              onClick={toggleMute}
              disabled={!isThisTrackPlaying}
              className="rounded-full p-3 text-[#8f8b85] transition-colors hover:bg-[#f0eeeb] hover:text-[#1a1a1a] disabled:opacity-50"
            >
              {isMuted && isThisTrackPlaying ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePlayClick}
              className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-[#1a1a1a] text-[#fafaf8] shadow-[0_14px_30px_-12px_rgba(45,31,95,0.6)] transition-all hover:scale-105"
            >
              {isActuallyPlaying ? <Pause size={34} className="fill-current" /> : <Play size={34} className="ml-1 fill-current" />}
            </button>
          </div>

          <div className="flex justify-start pl-4 sm:pl-8">
            {readStoryButton ? readStoryButton : <div className="w-[48px]" />}
          </div>
        </div>
      </div>
    </div>
  );
}
