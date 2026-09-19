import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold cursor-pointer select-none transition-all duration-200 active:scale-[0.96] active:duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "relative overflow-hidden bg-gradient-to-b from-fern to-forest text-white shadow-[0_8px_20px_-4px_rgba(47,122,63,0.45)] border border-white/30 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(47,122,63,0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:to-transparent before:opacity-80",
        destructive:
          "relative overflow-hidden bg-gradient-to-b from-destructive to-destructive-ink text-destructive-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg border border-white/20",
        outline:
          "border border-white/60 dark:border-white/15 bg-white/60 dark:bg-white/10 backdrop-blur-md text-foreground shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:bg-white/90 dark:hover:bg-white/20 hover:shadow-md",
        secondary:
          "bg-secondary/80 backdrop-blur-md text-secondary-foreground shadow-sm hover:-translate-y-0.5 hover:bg-secondary border border-border/40",
        ghost: "hover:bg-accent/80 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "relative overflow-hidden border border-white/60 dark:border-white/15 bg-white/70 dark:bg-white/10 backdrop-blur-xl text-foreground shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:bg-white/95 dark:hover:bg-white/20 hover:shadow-lg",
      },
      size: {
        default: "h-10 px-5 py-2.5 rounded-xl",
        sm: "h-8.5 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base shadow-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
