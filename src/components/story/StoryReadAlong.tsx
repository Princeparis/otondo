"use client";

import { useAudio } from "@/contexts/AudioContext";
import { useMemo } from "react";

export function StoryReadAlong({
  paragraphs,
  storySlug,
  className,
}: {
  paragraphs: string[];
  storySlug: string;
  className?: string;
}) {
  const { currentTrack, progress, duration, isPlaying } = useAudio();

  const activeParagraphIndex = useMemo(() => {
    if (
      !currentTrack ||
      currentTrack.storySlug !== storySlug ||
      !duration ||
      paragraphs.length === 0
    ) {
      return -1;
    }

    const ratio = Math.max(0, Math.min(1, progress / duration));
    return Math.min(
      paragraphs.length - 1,
      Math.floor(ratio * paragraphs.length),
    );
  }, [currentTrack, duration, paragraphs.length, progress, storySlug]);

  return (
    <div className={className}>
      {paragraphs.map((content, idx) => {
        const isActive = idx === activeParagraphIndex;
        return (
          <p
            key={idx}
            className={`transition-all duration-500 rounded-2xl px-3 py-2 -mx-3 mb-4 ${
              isActive
                ? "bg-[#fff3c9] text-[#1a1a1a] shadow-[0_8px_24px_-16px_rgba(240,174,0,0.8)] scale-[1.01]"
                : "text-[#1a1a1a]/80"
            }`}
          >
            {content}
            {isActive && isPlaying && (
              <span className="ml-2 inline-flex items-center gap-1 align-middle">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0a500] animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0a500] animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#f0a500] animate-pulse [animation-delay:300ms]" />
              </span>
            )}
          </p>
        );
      })}
    </div>
  );
}
