"use client";

import { useAudio } from "@/contexts/AudioContext";
import { useEffect, useMemo, useRef } from "react";

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
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

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

  useEffect(() => {
    if (
      activeParagraphIndex < 0 ||
      !isPlaying ||
      currentTrack?.storySlug !== storySlug
    ) {
      return;
    }

    const activeElement = paragraphRefs.current[activeParagraphIndex];
    if (!activeElement) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const behavior = prefersReducedMotion ? "auto" : "smooth";

      const scrollContainer = activeElement.closest<HTMLElement>("*");
      let nearestScrollableParent: HTMLElement | null = null;

      if (scrollContainer) {
        let parent: HTMLElement | null = activeElement.parentElement;
        while (parent) {
          const { overflowY } = window.getComputedStyle(parent);
          if (overflowY === "auto" || overflowY === "scroll") {
            nearestScrollableParent = parent;
            break;
          }
          parent = parent.parentElement;
        }
      }

      if (!nearestScrollableParent) {
        activeElement.scrollIntoView({
          behavior,
          block: "center",
          inline: "nearest",
        });
        return;
      }

      const threshold = 24;
      const containerRect = nearestScrollableParent.getBoundingClientRect();
      const elementRect = activeElement.getBoundingClientRect();

      const topBound = containerRect.top + threshold;
      const bottomBound = containerRect.bottom - threshold;
      const isComfortablyVisible =
        elementRect.top >= topBound && elementRect.bottom <= bottomBound;

      if (!isComfortablyVisible) {
        activeElement.scrollIntoView({
          behavior,
          block: "center",
          inline: "nearest",
        });
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeParagraphIndex, currentTrack?.storySlug, isPlaying, storySlug]);

  return (
    <div className={className}>
      {paragraphs.map((content, idx) => {
        const isActive = idx === activeParagraphIndex;
        return (
          <p
            key={idx}
            ref={(el) => {
              paragraphRefs.current[idx] = el;
            }}
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
