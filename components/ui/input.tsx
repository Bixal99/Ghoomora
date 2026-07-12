import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("focus-ring h-11 w-full rounded-xl border border-primary/15 bg-white px-4 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground hover:border-primary/25", className)} {...props} />
));
Input.displayName = "Input";
