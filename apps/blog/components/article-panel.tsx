import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

type ArticlePanelProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  icon: LucideIcon;
  meta?: ReactNode;
  title: ReactNode;
};

export function ArticlePanel({ children, className, contentClassName, icon: Icon, meta, title }: ArticlePanelProps) {
  return (
    <Card className={cn("my-4 overflow-hidden rounded-xl border-[var(--markdown-soft-border)] bg-[var(--markdown-panel-background)] shadow-sm", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[var(--markdown-soft-border)] px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-foreground/70">
          <Icon aria-hidden="true" className="size-3.5 shrink-0 text-[var(--markdown-link)]" strokeWidth={1.8} />
          <span className="truncate">{title}</span>
        </div>
        {meta && <div className="min-w-0 shrink text-[10px] text-muted-foreground">{meta}</div>}
      </CardHeader>
      <CardContent className={cn("p-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
