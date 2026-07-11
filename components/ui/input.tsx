import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("focus-ring h-11 w-full rounded-xl border bg-white/80 px-4 text-sm placeholder:text-muted-foreground", className)} {...props} />
));
Input.displayName = "Input";
