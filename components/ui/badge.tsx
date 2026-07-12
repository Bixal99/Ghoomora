import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full border border-primary/10 bg-white/80 px-3 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur", className)} {...props} />;
}
