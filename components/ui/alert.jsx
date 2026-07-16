import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva("rounded-2xl border p-4 text-sm leading-relaxed", {
  variants: {
    variant: {
      info: "border-blue-100 bg-blue-50 text-blue-900",
      success: "border-emerald-100 bg-emerald-50 text-emerald-800",
      error: "border-red-100 bg-red-50 text-red-700",
      neutral: "border-slate-200 bg-slate-50 text-slate-700",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

function Alert({ className, variant, ...props }) {
  return <div role="status" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export { Alert };
