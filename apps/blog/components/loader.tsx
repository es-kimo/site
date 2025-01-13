import { LoaderCircleIcon } from "lucide-react";

export function Loader() {
  return <LoaderCircleIcon className="animate-spin" size={12} color="hsl(var(--muted-foreground))" />;
}
