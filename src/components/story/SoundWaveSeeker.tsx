"use client";

import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";

interface SoundWaveSeekerProps {
  value: number;
  max: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  isPlaying?: boolean;
  className?: string;
  barCount?: number;
  interactiveLevel?: "low" | "medium" | "high";
  showTooltip?: boolean;
  showBeatPulse?: boolean;
}

function formatTooltipTime(time: number) {
  if (Number.isNaN(time) || time < 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export function SoundWaveSeeker({
  value,
  max,
  onChange,
  disabled,
  isPlaying,
  className,
  barCount = 44,
  interactiveLevel = "medium",
  showTooltip = true,
  showBeatPulse = true,
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

  const getRatioFromClientX = (clientX: number) => {
    const input = inputRef.current;
    if (!input) return null;
    const rect = input.getBoundingClientRect();
    if (!rect.width) return null;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const updateRatioFromPointer = (clientX: number, scrubbing: boolean) => {
    const ratio = getRatioFromClientX(clientX);
    if (ratio === null) return;
    if (scrubbing) {
      setScrubRatio(ratio);
      return;
    }
    setHoverRatio(ratio);
  };

  const previewRatio = scrubRatio ?? hoverRatio;
  const activeHeadRatio = previewRatio ?? progressRatio;


  const isScrubbing = scrubRatio !== null;
  const interactionState = disabled
    ? "idle"
    : isScrubbing
      ? "dragging"
      : isPointerOver
        ? "hover"
        : isPlaying
          ? "playing-active-head"
          : "idle";

  const shouldShowTooltip =
    showTooltip &&
    !disabled &&
    activeHeadRatio !== null &&
    (isPointerOver || isScrubbing || isFocused);

  const tooltipSeconds = Math.round((activeHeadRatio ?? 0) * safeMax);

  const intensityClasses =
    interactiveLevel === "high"
      ? "gap-1"
      : interactiveLevel === "low"
        ? "gap-1.5"
        : "gap-1.25";

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
        onChange={(event) => {
          if (!disabled && isFocused) {
            const nextRatio = Math.max(0, Math.min(1, Number(event.target.value) / safeMax));
            setHoverRatio(nextRatio);
          }
          onChange(event);
        }}
        onPointerEnter={(event) => {
          if (disabled) return;
          setIsPointerOver(true);
          updateRatioFromPointer(event.clientX, false);
        }}
        onPointerMove={(event) => {
          if (disabled) return;
          updateRatioFromPointer(event.clientX, isScrubbing);
        }}
        onPointerLeave={() => {
          setIsPointerOver(false);
          if (!isScrubbing && !isFocused) {
            setHoverRatio(null);
          }
        }}
        onPointerDown={(event) => {
          if (disabled) return;
          setIsPointerOver(true);
          updateRatioFromPointer(event.clientX, true);
        }}
        onPointerUp={() => {
          setScrubRatio(null);
          if (!isFocused) {
            setHoverRatio(null);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          setHoverRatio(null);
          setScrubRatio(null);
        }}
        onFocus={() => {
          if (disabled) return;
          setIsFocused(true);
          setHoverRatio(progressRatio);
        }}
        onKeyDown={(event) => {
          if (disabled) return;
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) {
            const current = Number((event.currentTarget as HTMLInputElement).value);
            const nextRatio = Math.max(0, Math.min(1, current / safeMax));
            setHoverRatio(nextRatio);
          }
        }}
        disabled={disabled}
        className="waveform-range-input absolute inset-0 z-20 h-full w-full cursor-pointer appearance-none rounded-2xl bg-transparent disabled:cursor-not-allowed"
        aria-label="Seek audio position"
      />
    </div>
  );
}
