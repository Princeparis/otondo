"use client";

import { useAudio } from "@/contexts/AudioContext";
import { BookOpen, Pause, Play, Volume2, VolumeX } from "lucide-react";
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

  const displayProgress = isThisTrackPlaying ? progress : 0;
  const displayDuration = isThisTrackPlaying ? duration : 0;
  const isActuallyPlaying = isThisTrackPlaying && isPlaying;

  const playerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const bars = gsap.utils.toArray<HTMLElement>(".eq-bar");
      if (!bars.length) return;

      if (isActuallyPlaying) {
        gsap.to(".play-icon", {
          scale: 0.5,
          opacity: 0,
          rotation: -40,
          duration: 0.25,
          ease: "power2.inOut",
        });
        gsap.to(".pause-icon", {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.25,
          ease: "power2.inOut",
        });

        bars.forEach((bar, i) => {
          gsap.to(bar, {
            keyframes: [
              { height: `${10 + i * 3}px`, duration: 0.25 },
              { height: `${24 - i * 2}px`, duration: 0.28 },
              { height: `${14 + i * 4}px`, duration: 0.22 },
            ],
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.05,
          });
        });
      } else {
        gsap.to(".pause-icon", {
          scale: 0.5,
          opacity: 0,
          rotation: -40,
          duration: 0.2,
        });
        gsap.to(".play-icon", {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: 0.2,
        });
        gsap.killTweensOf(bars);
        gsap.to(bars, { height: 6, duration: 0.3 });
      }
    },
    { dependencies: [isActuallyPlaying], scope: playerRef },
  );

  return (
    <div ref={playerRef} className="flex flex-col w-full h-full relative bg-[#fafaf8]">
      <div className="flex-1 w-full relative overflow-hidden bg-linear-to-b from-[#ece9ff] via-[#f4f3ea] to-[#fafaf8]">
        {coverUrl ? (
          <Image src={coverUrl} alt={title} fill className="object-cover opacity-85" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1a1a1a]/20 font-black text-8xl">
            {title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#fafaf8] via-[#fafaf8]/55 to-transparent" />
      </div>

      <div className="flex-none p-7 lg:p-10 flex flex-col items-center bg-[#fafaf8]/95 backdrop-blur rounded-t-[2.5rem] -mt-12 shadow-[0_-16px_36px_-20px_rgba(38,24,93,0.45)] border-t border-[#ece8df]">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6e4e0] bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase text-[#78756f] mb-3">
          <BookOpen className="h-3.5 w-3.5" /> Read + Listen
        </div>
        <h3 className="text-2xl font-black text-[#1a1a1a] text-center mb-6 line-clamp-2 leading-tight px-3 max-w-sm">
          {title}
        </h3>

        <div className="flex items-end gap-1.5 mb-4 h-6" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="eq-bar block w-1.5 h-1.5 rounded-full bg-[#6f5ad9]" />
          ))}
        </div>

        <div className="w-full max-w-sm mb-6">
          <input
            type="range"
            min="0"
            max={displayDuration || 100}
            value={displayProgress}
            onChange={handleProgressChange}
            disabled={!isThisTrackPlaying}
            className="w-full h-2 bg-[#e8e5dd] rounded-full appearance-none cursor-pointer accent-[#6f5ad9] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-[11px] font-bold text-[#938f88] mt-2.5 tabular-nums px-1">
            <span>{formatTime(displayProgress)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center w-full mb-2">
          <div className="flex justify-end pr-4 sm:pr-8">
            <button
              onClick={toggleMute}
              disabled={!isThisTrackPlaying}
              className="p-3 text-[#8f8b85] hover:text-[#1a1a1a] hover:bg-[#f0eeeb] rounded-full transition-colors disabled:opacity-50"
            >
              {isMuted && isThisTrackPlaying ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handlePlayClick}
              className="relative h-[78px] w-[78px] bg-[#1a1a1a] text-[#fafaf8] rounded-full flex items-center justify-center shadow-[0_14px_30px_-12px_rgba(45,31,95,0.6)] hover:scale-105 transition-transform"
            >
              <div className="absolute inset-0 flex items-center justify-center play-icon">
                <Play size={34} className="fill-current ml-1" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pause-icon opacity-0 scale-50">
                <Pause size={34} className="fill-current" />
              </div>
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
