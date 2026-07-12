import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("focus-ring relative inline-flex max-w-full select-none items-center justify-center gap-2 rounded-full border border-transparent text-center font-bold leading-tight shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-[#205548]",
      accent: "bg-accent text-[#15362d] hover:bg-[#f7c36f]",
      outline: "border-primary/20 bg-transparent text-foreground shadow-none hover:border-primary/35 hover:bg-white/70",
      ghost: "text-foreground shadow-none hover:bg-white/65",
    },
    size: { default: "min-h-11 px-6 py-2.5", sm: "min-h-9 px-4 py-2 text-sm", lg: "min-h-14 px-8 py-3.5 text-base", icon: "size-11 p-0" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
export { buttonVariants };
