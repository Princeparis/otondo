"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface SoundWaveSeekerProps {
  value: number;
  max: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isPlaying?: boolean;
  className?: string;
  barCount?: number;
}

export function SoundWaveSeeker({
  value,
  max,
  onChange,
  disabled,
  isPlaying,
  className,
  barCount = 44,
}: SoundWaveSeekerProps) {
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

  return (
    <div
      className={cn(
        "group relative isolate h-14 w-full rounded-2xl border border-audio-border bg-linear-to-r from-audio-tint/70 via-card to-audio-tint/60 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
        disabled && "opacity-60",
        className,
      )}
    >
      <div className="relative z-10 flex h-full items-end gap-1">
        {bars.map((height, index) => {
          const barPosition = (index + 1) / bars.length;
          const passed = barPosition <= progressRatio;
          const nearHead = Math.abs(barPosition - progressRatio) < 0.06;

          return (
            <span
              key={index}
              className={cn(
                "wave-bar inline-block w-full max-w-[6px] rounded-full transition-all duration-300 ease-out",
                passed
                  ? "bg-linear-to-t from-audio-accent via-audio-accent/80 to-audio-accent/60"
                  : "bg-audio-border/80",
                isPlaying && nearHead && !disabled && "wave-bar-live",
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
        className="pointer-events-none absolute inset-y-2.5 left-0 z-0 rounded-full bg-linear-to-r from-audio-accent/15 to-audio-accent/20 transition-[width] duration-200"
        style={{ width: `${progressRatio * 100}%` }}
      />

      <input
        type="range"
        min={0}
        max={safeMax}
        value={Math.min(value, safeMax)}
        onChange={onChange}
        disabled={disabled}
        className="waveform-range-input absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none rounded-2xl bg-transparent disabled:cursor-not-allowed"
        aria-label="Seek audio position"
      />
    </div>
  );
}
