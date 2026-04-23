import { cn } from "@/lib/utils";

export function PlayerBadge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-bold tracking-widest text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}
