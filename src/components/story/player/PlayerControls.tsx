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
    <div className="mb-2 grid w-full grid-cols-3 items-center">
      <div className="flex justify-end pr-4 sm:pr-8">
        <button
          onClick={onMute}
          disabled={muteDisabled}
          className={getIconButtonClassName("immersive")}
          aria-label={muteState.label}
        >
          <muteState.Icon size={22} />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onPlayPause}
          className={getPrimaryButtonClassName("immersive")}
          aria-label={playState.label}
        >
          <playState.Icon className={cn("h-[34px] w-[34px]", playState.iconClassName)} />
        </button>
      </div>

      <div className="flex justify-start pl-4 sm:pl-8">{rightSlot ?? <div className="w-[48px]" />}</div>
    </div>
  );
}
