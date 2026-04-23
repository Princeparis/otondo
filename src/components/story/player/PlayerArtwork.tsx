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
        <Image src={coverUrl} alt={title} fill className="object-cover" />
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
