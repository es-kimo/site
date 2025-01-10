import { cn } from "@workspace/ui/lib/utils";

function Skeleton({ children, className, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props}>
      {children}
    </div>
  );
}

export { Skeleton };
