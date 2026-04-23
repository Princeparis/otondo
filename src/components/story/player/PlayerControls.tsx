import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  getIconButtonClassName,
  getMuteState,
  getPlayState,
  getPrimaryButtonClassName,
} from "./playerShared";

export function PlayerControls({
  isPlaying,
  isMuted,
  onPlayPause,
  onMute,
  muteDisabled,
  density,
  rightSlot,
  onClose,
}: {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onMute: () => void;
  muteDisabled?: boolean;
  density: "immersive" | "compact";
  rightSlot?: React.ReactNode;
  onClose?: () => void;
}) {
  const playState = getPlayState(isPlaying);
  const muteState = getMuteState(isMuted);

  if (density === "compact") {
    return (
      <div className="shrink-0 rounded-2xl border border-audio-border bg-audio-card px-1.5 py-1 shadow-xs">
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={onMute}
            disabled={muteDisabled}
            className={getIconButtonClassName("compact")}
            aria-label={muteState.label}
          >
            <muteState.Icon className="h-4 w-4" />
          </button>
          <button
            onClick={onPlayPause}
            className={getPrimaryButtonClassName("compact")}
            aria-label={playState.label}
          >
            <playState.Icon className={cn("h-5 w-5", playState.iconClassName)} />
          </button>
          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-audio-muted transition-colors hover:text-foreground"
              aria-label="Close player"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div className="flex justify-end pr-2 sm:pr-6">
        <button
          onClick={onMute}
          disabled={muteDisabled}
          className={cn(
            getIconButtonClassName("immersive"),
            "border border-white/90 bg-white/80 shadow-[0_16px_28px_-20px_rgba(42,28,120,0.95)] backdrop-blur-sm hover:bg-white",
          )}
          aria-label={muteState.label}
        >
          <muteState.Icon size={22} />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onPlayPause}
          className={cn(
            getPrimaryButtonClassName("immersive"),
            "shadow-[0_24px_40px_-24px_rgba(35,23,99,1)] ring-1 ring-white/85",
          )}
          aria-label={playState.label}
        >
          <playState.Icon className={cn("h-[34px] w-[34px]", playState.iconClassName)} />
        </button>
      </div>

      <div className="flex justify-start pl-2 sm:pl-6">
        {rightSlot ?? <div className="h-12 w-12" aria-hidden />}
      </div>
    </div>
  );
}
