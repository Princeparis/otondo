"use client";

import { useEffect, useState } from "react";

export type PlayerBreakpoint = "mobile" | "tablet" | "desktop";

type ControlVisibility = "always-visible" | "collapsed";
type ControlPresentation = "icon-only" | "labeled" | "icon-with-label";

interface LayoutControlRule {
  visibility: ControlVisibility;
  presentation: ControlPresentation;
}

export const PLAYER_LAYOUT_MATRIX: Record<PlayerBreakpoint, Record<string, LayoutControlRule>> = {
  mobile: {
    title: { visibility: "always-visible", presentation: "labeled" },
    waveform: { visibility: "always-visible", presentation: "icon-with-label" },
    mute: { visibility: "always-visible", presentation: "icon-only" },
    playPause: { visibility: "always-visible", presentation: "icon-only" },
    close: { visibility: "always-visible", presentation: "icon-only" },
    readAlongLink: { visibility: "collapsed", presentation: "labeled" },
    readStoryButton: { visibility: "collapsed", presentation: "icon-only" },
  },
  tablet: {
    title: { visibility: "always-visible", presentation: "labeled" },
    waveform: { visibility: "always-visible", presentation: "icon-with-label" },
    mute: { visibility: "always-visible", presentation: "icon-only" },
    playPause: { visibility: "always-visible", presentation: "icon-only" },
    close: { visibility: "always-visible", presentation: "icon-only" },
    readAlongLink: { visibility: "always-visible", presentation: "labeled" },
    readStoryButton: { visibility: "always-visible", presentation: "icon-only" },
  },
  desktop: {
    title: { visibility: "always-visible", presentation: "labeled" },
    waveform: { visibility: "always-visible", presentation: "icon-with-label" },
    mute: { visibility: "always-visible", presentation: "icon-only" },
    playPause: { visibility: "always-visible", presentation: "icon-only" },
    close: { visibility: "always-visible", presentation: "icon-only" },
    readAlongLink: { visibility: "always-visible", presentation: "labeled" },
    readStoryButton: { visibility: "always-visible", presentation: "icon-with-label" },
  },
};

export const PLAYER_BREAKPOINT_RULES: Record<
  PlayerBreakpoint,
  {
    controlSize: string;
    playControlSize: string;
    typography: {
      title: string;
      meta: string;
    };
    waveform: {
      barCount: number;
      height: string;
      container: string;
      density: string;
    };
    spacing: {
      stack: string;
      inline: string;
      pageSurfacePadding: string;
      dockSurfacePadding: string;
    };
  }
> = {
  mobile: {
    controlSize: "h-11 w-11",
    playControlSize: "h-12 w-12",
    typography: {
      title: "text-base",
      meta: "text-[10px]",
    },
    waveform: {
      barCount: 24,
      height: "h-10",
      container: "rounded-xl px-2 py-1.5",
      density: "gap-2",
    },
    spacing: {
      stack: "space-y-3",
      inline: "gap-2",
      pageSurfacePadding: "p-6",
      dockSurfacePadding: "p-3",
    },
  },
  tablet: {
    controlSize: "h-11 w-11",
    playControlSize: "h-[72px] w-[72px]",
    typography: {
      title: "text-xl",
      meta: "text-xs",
    },
    waveform: {
      barCount: 32,
      height: "h-11",
      container: "rounded-2xl px-2.5 py-2",
      density: "gap-2.5",
    },
    spacing: {
      stack: "space-y-4",
      inline: "gap-3",
      pageSurfacePadding: "p-8",
      dockSurfacePadding: "p-4",
    },
  },
  desktop: {
    controlSize: "h-12 w-12",
    playControlSize: "h-[78px] w-[78px]",
    typography: {
      title: "text-2xl",
      meta: "text-xs",
    },
    waveform: {
      barCount: 40,
      height: "h-12",
      container: "rounded-2xl px-3 py-2.5",
      density: "gap-3",
    },
    spacing: {
      stack: "space-y-5",
      inline: "gap-3",
      pageSurfacePadding: "p-10",
      dockSurfacePadding: "p-4",
    },
  },
};

export function usePlayerBreakpoint(): PlayerBreakpoint {
  const [breakpoint, setBreakpoint] = useState<PlayerBreakpoint>("mobile");

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const tabletQuery = window.matchMedia("(min-width: 768px) and (max-width: 1023px)");

    const handleChange = () => {
      if (tabletQuery.matches) {
        setBreakpoint("tablet");
        return;
      }

      if (mobileQuery.matches) {
        setBreakpoint("mobile");
        return;
      }

      setBreakpoint("desktop");
    };

    handleChange();

    mobileQuery.addEventListener("change", handleChange);
    tabletQuery.addEventListener("change", handleChange);

    return () => {
      mobileQuery.removeEventListener("change", handleChange);
      tabletQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return breakpoint;
}
