"use client";

import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

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
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const safeMax = max > 0 ? max : 100;
  const progressRatio = Math.max(0, Math.min(1, value / safeMax));
  const activeRatio = hoverRatio ?? progressRatio;

  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, index) => {
        const seed = Math.abs(Math.sin(index * 0.87) + Math.cos(index * 0.41));
        return Math.round(24 + seed * 48);
      }),
    [barCount],
  );

  const interactionState = isPointerDown ? "dragging" : hoverRatio !== null ? "hover" : "idle";

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

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    setHoverRatio(Math.max(0, Math.min(1, ratio)));
  };

  return (
    <div
      data-interaction-state={interactionState}
      className={cn(
        "group relative isolate h-16 w-full overflow-hidden rounded-3xl border border-white/90 bg-linear-to-r from-[#eee7ff] via-[#fcfbff] to-[#ece5ff] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_26px_45px_-34px_rgba(61,40,140,0.95)] transition duration-300 ease-out data-[interaction-state=dragging]:scale-[1.01] data-[interaction-state=dragging]:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_32px_56px_-32px_rgba(61,40,140,0.98)]",
        disabled && "opacity-60",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setHoverRatio(null);
        setIsPointerDown(false);
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.95),transparent_38%),radial-gradient(circle_at_85%_85%,rgba(138,118,255,0.2),transparent_40%)]" />
      <div className="waveform-sheen pointer-events-none absolute -left-1/3 top-0 z-0 h-full w-1/3 bg-linear-to-r from-transparent via-white/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-0 bg-linear-to-r from-[#6f5ad9]/25 via-[#8f79ff]/20 to-[#b9adff]/15 transition-all duration-200"
        style={{ width: `${progressRatio * 100}%` }}
      />

      <div className="relative z-10 flex h-full items-end gap-1">
        {bars.map((height, index) => {
          const barPosition = (index + 1) / bars.length;
          const isPassed = barPosition <= progressRatio;
          const isNearHead = Math.abs(barPosition - activeRatio) < (isPointerDown ? 0.13 : 0.07);

          return (
            <span
              key={index}
              className={cn(
                "wave-bar block h-full w-full max-w-[6px] rounded-full transition-all duration-250",
                isPassed
                  ? "bg-linear-to-t from-[#5f49d7] via-[#7f69ff] to-[#b5a8ff]"
                  : "bg-[#d6cef7]",
                isNearHead && !disabled && isPlaying && "wave-bar-live",
                !disabled && "group-hover:brightness-110",
              )}
              style={{
                height: `${height}%`,
                animationDelay: `${index * 16}ms`,
              }}
              aria-hidden
            />
          );
        })}
      </div>

      <input
        type="range"
        min={0}
        max={safeMax}
        value={Math.min(value, safeMax)}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onPointerDown={() => setIsPointerDown(true)}
        onPointerUp={() => setIsPointerDown(false)}
        disabled={disabled}
        className="waveform-range-input focus-visible-ring absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none rounded-2xl bg-transparent disabled:cursor-not-allowed"
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
      />
    </div>
  );
}
