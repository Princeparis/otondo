"use client";

import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

interface SoundWaveSeekerProps {
  value: number;
  max: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSeekStep?: (nextValue: number) => void;
  onPlayPauseShortcut?: () => void;
  disabled?: boolean;
  isPlaying?: boolean;
  className?: string;
  barCount?: number;
  ariaLabel?: string;
  ariaValueText?: string;
}

export function SoundWaveSeeker({
  value,
  max,
  onChange,
  onSeekStep,
  onPlayPauseShortcut,
  disabled,
  isPlaying,
  className,
  barCount = 44,
  ariaLabel = "Seek audio position",
  ariaValueText,
}: SoundWaveSeekerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const [isPointerOver, setIsPointerOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const safeMax = max > 0 ? max : 100;
  const progressRatio = Math.max(0, Math.min(1, value / safeMax));

  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, index) => {
        const seed = Math.abs(Math.sin(index * 11.13) + Math.cos(index * 5.73));
        return Math.round(22 + seed * 54);
      }),
    [barCount],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onSeekStep?.(Math.max(0, value - 5));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onSeekStep?.(Math.min(safeMax, value + 5));
      return;
    }

    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      onPlayPauseShortcut?.();
    }
  };

  return (
    <div
      data-interaction-state={interactionState}
      className={cn(
        "group relative isolate h-14 w-full rounded-2xl border border-[#e7e1ff] bg-linear-to-r from-[#f7f4ff] via-white to-[#f6f2ff] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-250 ease-out data-[interaction-state=dragging]:scale-[1.01] data-[interaction-state=dragging]:shadow-[0_16px_28px_-24px_rgba(45,31,95,0.85),inset_0_1px_0_rgba(255,255,255,0.8)]",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className={cn("relative z-10 flex h-full items-end", intensityClasses)}>
        {bars.map((height, index) => {
          const barPosition = (index + 1) / bars.length;
          const passed = barPosition <= progressRatio;
          const nearHead = Math.abs(barPosition - activeHeadRatio) < (isScrubbing ? 0.11 : 0.06);

          return (
            <span
              key={index}
              className={cn(
                "wave-bar inline-block w-full max-w-[6px] rounded-full transition-all duration-300 ease-out",
                passed
                  ? "bg-linear-to-t from-[#6f5ad9] via-[#836bff] to-[#a08eff]"
                  : "bg-[#ddd7f5]",
                showBeatPulse && isPlaying && nearHead && !disabled && !isScrubbing && "wave-bar-live",
                showBeatPulse && nearHead && !disabled && isScrubbing && "wave-bar-scrub",
                !disabled && "group-hover:brightness-110",
              )}
              style={{
                height: `${height}%`,
                animationDelay: `${index * 18}ms`,
              }}
              aria-hidden
            />
          );
        })}
      </div>

      <div
        className="wave-progress-fill pointer-events-none absolute inset-y-2.5 left-0 z-0 rounded-full bg-linear-to-r from-[#6f5ad9]/18 to-[#a08eff]/22"
        style={{ width: `${progressRatio * 100}%` }}
      />

      {shouldShowTooltip && (
        <div
          className="pointer-events-none absolute top-0 z-30 -translate-x-1/2 -translate-y-[130%] rounded-full border border-[#ddd3ff] bg-white px-2 py-1 text-[10px] font-bold tracking-wide text-[#5e4bbb] shadow-[0_8px_20px_-14px_rgba(45,31,95,0.9)]"
          style={{ left: `${(activeHeadRatio ?? 0) * 100}%` }}
          aria-hidden
        >
          {formatTooltipTime(tooltipSeconds)}
        </div>
      )}

      <input
        ref={inputRef}
        type="range"
        min={0}
        max={safeMax}
        value={Math.min(value, safeMax)}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="waveform-range-input focus-visible-ring absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none rounded-2xl bg-transparent disabled:cursor-not-allowed"
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
      />
    </div>
  );
}
