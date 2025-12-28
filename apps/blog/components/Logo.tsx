import { cn } from "@workspace/ui/lib/utils";
import { Link } from "next-view-transitions";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/writing"
      aria-label="khryu.dev (Writing으로 이동)"
      draggable={false}
      className={cn(
        "select-none cursor-pointer",
        "text-foreground/90 hover:text-foreground",
        "hover:bg-foreground/5 active:bg-foreground/10",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "transition-colors",
        className
      )}
    >
      <svg width="71" height="22" viewBox="0 0 71 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="block" aria-hidden="true">
        <text x="0" y="16" fontSize="16" fontWeight="500" letterSpacing="-0.02em" fill="currentColor" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
          khryu.dev
        </text>
      </svg>
    </Link>
  );
}
