import Image from "next/image";

import { cn } from "@/lib/utils";

export function PlayerArtwork({
  coverUrl,
  title,
  dense = false,
}: {
  coverUrl?: string;
  title: string;
  dense?: boolean;
}) {
  if (coverUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border bg-audio-tint",
          dense ? "h-12 w-12 rounded-xl md:h-14 md:w-14" : "h-full w-full",
        )}
      >
        <Image
          src={coverUrl}
          alt={title}
          fill
          className={cn(
            "object-cover",
            !dense && "scale-[1.03] saturate-[1.08] contrast-[1.05]",
          )}
        />
        {!dense ? (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.36),transparent_46%),linear-gradient(to_top,rgba(250,250,248,0.85),transparent_35%)]" />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border font-black",
        dense
          ? "h-12 w-12 rounded-xl text-xl text-audio-accent md:h-14 md:w-14"
          : "h-full w-full text-8xl text-foreground/20",
      )}
    >
      {title.charAt(0)}
    </div>
  );
}
