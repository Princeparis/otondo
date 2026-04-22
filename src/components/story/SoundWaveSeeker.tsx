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
        return Math.round(20 + seed * 58);
      }),
    [barCount],
  );

  return (
    <div
      className={cn(
        "group relative isolate h-14 w-full",
        disabled && "opacity-60",
        className,
      )}
    >
      <div
        className="relative z-10 grid h-full w-full items-end gap-x-1"
        style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }}
      >
        {bars.map((height, index) => {
          const barPosition = (index + 1) / bars.length;
          const passed = barPosition <= progressRatio;
          const nearHead = Math.abs(barPosition - progressRatio) < 0.055;

          return (
            <span
              key={index}
              className={cn(
                "wave-bar block w-full rounded-full transition-all duration-300 ease-out",
                passed
                  ? "bg-linear-to-t from-[#6f5ad9] via-[#836bff] to-[#a08eff]"
                  : "bg-[#ddd7f5]",
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

      <input
        type="range"
        min={0}
        max={safeMax}
        value={Math.min(value, safeMax)}
        onChange={onChange}
        disabled={disabled}
        className="waveform-range-input absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed"
        aria-label="Seek audio position"
      />
    </div>
  );
}
