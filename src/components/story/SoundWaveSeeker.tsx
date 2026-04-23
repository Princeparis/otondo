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
        "group relative isolate h-14 w-full overflow-hidden rounded-2xl border border-audio-border/80 bg-linear-to-r from-[#f6f2ff] via-white to-[#f1ecff] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_30px_-28px_rgba(61,40,140,0.8)] transition duration-300 ease-out data-[interaction-state=dragging]:scale-[1.01] data-[interaction-state=dragging]:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_26px_44px_-28px_rgba(61,40,140,0.95)]",
        disabled && "opacity-60",
        className,
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setHoverRatio(null);
        setIsPointerDown(false);
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-0 bg-linear-to-r from-[#6f5ad9]/20 to-[#a08eff]/15 transition-all duration-200"
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
                  ? "bg-linear-to-t from-[#6f5ad9] via-[#846dff] to-[#b4a4ff]"
                  : "bg-[#dcd5f8]",
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
