import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { cn } from "@/lib/utils";

export const formatTime = (time: number) => {
  if (Number.isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const getPlayState = (isPlaying: boolean) => ({
  label: isPlaying ? "Pause" : "Play",
  Icon: isPlaying ? Pause : Play,
  iconClassName: isPlaying ? "fill-current" : "ml-0.5 fill-current",
});

export const getMuteState = (isMuted: boolean) => ({
  label: isMuted ? "Unmute" : "Mute",
  Icon: isMuted ? VolumeX : Volume2,
});

export const getIconButtonClassName = (density: "immersive" | "compact") =>
  cn(
    "rounded-full text-audio-muted transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50",
    density === "immersive" ? "p-3" : "p-2.5",
  );

export const getPrimaryButtonClassName = (density: "immersive" | "compact") =>
  cn(
    "flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105",
    density === "immersive" ? "h-[78px] w-[78px] shadow-lg" : "h-11 w-11 shadow-sm",
  );
