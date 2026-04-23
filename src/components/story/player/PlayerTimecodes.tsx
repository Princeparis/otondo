import { SoundWaveSeeker } from "@/components/story/SoundWaveSeeker";

import { cn } from "@/lib/utils";

import { formatTime } from "./playerShared";

export function PlayerTimecodes({
  value,
  max,
  onChange,
  isPlaying,
  disabled,
  className,
  seekerClassName,
  barCount,
  labelClassName,
  layout = "stacked",
}: {
  value: number;
  max: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying?: boolean;
  disabled?: boolean;
  className?: string;
  seekerClassName?: string;
  barCount?: number;
  labelClassName?: string;
  layout?: "stacked" | "inline";
}) {
  if (layout === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className={cn("w-8 text-right text-[10px] font-bold tabular-nums text-audio-muted md:text-xs", labelClassName)}>
          {formatTime(value)}
        </span>
        <SoundWaveSeeker
          className={cn("flex-1", seekerClassName)}
          value={value}
          max={max || 100}
          onChange={onChange}
          disabled={disabled}
          isPlaying={isPlaying}
          barCount={barCount}
        />
        <span className={cn("w-8 text-[10px] font-bold tabular-nums text-audio-muted md:text-xs", labelClassName)}>
          {formatTime(max)}
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <SoundWaveSeeker
        className={seekerClassName}
        value={value}
        max={max || 100}
        onChange={onChange}
        disabled={disabled}
        isPlaying={isPlaying}
        barCount={barCount}
      />
      <div
        className={cn(
          "mt-2.5 flex justify-between px-1 text-[11px] font-bold tabular-nums text-audio-muted",
          labelClassName,
        )}
      >
        <span>{formatTime(value)}</span>
        <span>{formatTime(max)}</span>
      </div>
    </div>
  );
}
