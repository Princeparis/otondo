import { cn } from "@/lib/utils";

export function PlayerShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("bg-audio-surface text-foreground", className)}>{children}</div>;
}
