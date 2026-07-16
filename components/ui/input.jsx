import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-xl border border-slate-900/15 bg-white px-3.5 text-[15px] text-navy-900 placeholder:text-slate-400",
        "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

export { Input };
