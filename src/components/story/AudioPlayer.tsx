"use client";

import { useAudio } from "@/contexts/AudioContext";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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

  // Determine if this specific track is currently playing globally
  const isThisTrackPlaying = currentTrack?.url === audioUrl;

  const handlePlayClick = () => {
    if (isThisTrackPlaying) {
      togglePlay();
    } else {
      playTrack({ url: audioUrl, title, coverUrl, storySlug });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isThisTrackPlaying) {
      seek(Number(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // If this track isn't loaded globally, we show 0 values
  const displayProgress = isThisTrackPlaying ? progress : 0;
  // If it's loaded, show its duration. Otherwise, we don't know the duration until loaded,
  // but we can just show 0:00 for the unloaded state.
  const displayDuration = isThisTrackPlaying ? duration : 0;
  const isActuallyPlaying = isThisTrackPlaying && isPlaying;

  const playBtnContainer = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      // Butter-smooth transition between play and pause icons
      if (isActuallyPlaying) {
        gsap.to(".play-icon", {
          scale: 0.5,
          opacity: 0,
          rotation: -45,
          duration: 0.3,
          ease: "power2.inOut",
        });
        gsap.fromTo(
          ".pause-icon",
          { scale: 0.5, opacity: 0, rotation: 45 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.inOut",
            delay: 0.1,
          },
        );
      } else {
        gsap.to(".pause-icon", {
          scale: 0.5,
          opacity: 0,
          rotation: -45,
          duration: 0.3,
          ease: "power2.inOut",
        });
        gsap.fromTo(
          ".play-icon",
          { scale: 0.5, opacity: 0, rotation: 45 },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.3,
            ease: "power2.inOut",
            delay: 0.1,
          },
        );
      }
    },
    { dependencies: [isActuallyPlaying], scope: playBtnContainer },
  );

  return (
    <div className="flex flex-col w-full h-full relative bg-[#fafaf8]">
      {/* Cover Image */}
      <div className="flex-1 w-full bg-[#f0eeeb] relative">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1a1a1a] font-bold text-6xl opacity-20">
            {title.charAt(0)}
          </div>
        )}
        {/* Subtle gradient overlay to ensure text/buttons over it are readable */}
        <div className="absolute inset-0 bg-linear-to-t from-[#fafaf8] via-transparent to-transparent opacity-80 lg:opacity-50"></div>
      </div>

      {/* Controls Container */}
      <div className="flex-none p-8 lg:p-10 flex flex-col items-center bg-[#fafaf8] relative z-10 rounded-t-[2.5rem] -mt-10 lg:-mt-12 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] pb-32 lg:pb-12">
        <p className="text-xs font-bold text-[#b0ada8] mb-2 tracking-widest uppercase">
          Playing Now
        </p>
        <h3 className="text-2xl font-black text-[#1a1a1a] text-center mb-10 line-clamp-2 leading-tight px-4 max-w-sm">
          {title}
        </h3>

        <div className="w-full max-w-sm mb-10">
          <input
            type="range"
            min="0"
            max={displayDuration || 100}
            value={displayProgress}
            onChange={handleProgressChange}
            disabled={!isThisTrackPlaying}
            className="w-full h-1.5 bg-[#e6e4e0] rounded-full appearance-none cursor-pointer accent-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[11px] font-bold text-[#b0ada8] mt-3 tabular-nums px-1">
            <span>{formatTime(displayProgress)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-10 w-full mb-4">
          <button
            onClick={toggleMute}
            disabled={!isThisTrackPlaying}
            className="p-3 text-[#b0ada8] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-full transition-colors disabled:opacity-50"
          >
            {isMuted && isThisTrackPlaying ? (
              <VolumeX size={24} />
            ) : (
              <Volume2 size={24} />
            )}
          </button>

          <button
            ref={playBtnContainer}
            onClick={handlePlayClick}
            className="relative h-[80px] w-[80px] bg-[#1a1a1a] text-[#fafaf8] rounded-full flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform shrink-0"
          >
            <div className="absolute inset-0 flex items-center justify-center play-icon">
              <Play size={36} className="fill-current ml-1.5" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pause-icon opacity-0 scale-50">
              <Pause size={36} className="fill-current" />
            </div>
          </button>

          {readStoryButton ? (
            readStoryButton
          ) : (
            <div className="w-[48px]">{/* Spacer */}</div>
          )}
        </div>
      </div>
    </div>
  );
}
