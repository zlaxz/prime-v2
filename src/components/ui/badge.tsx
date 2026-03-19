import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary/[0.08] text-primary",
        secondary: "bg-secondary/[0.08] text-secondary",
        destructive: "bg-destructive/[0.08] text-destructive",
        success: "bg-[hsl(145_55%_65%)]/[0.08] text-[hsl(145_55%_50%)]",
        warning: "bg-[hsl(40_80%_70%)]/[0.08] text-[hsl(40_80%_50%)]",
        outline: "border border-input/40 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
