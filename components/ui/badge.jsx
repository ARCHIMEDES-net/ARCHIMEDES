import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-eyebrow text-navy-600",
        dark: "bg-navy-900 text-white",
        outline: "border border-slate-200 text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
