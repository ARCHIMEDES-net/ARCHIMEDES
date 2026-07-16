import * as React from "react";
import { cn } from "../../lib/utils";

const Switch = React.forwardRef(function Switch({ className, checked, onChange, ...props }, ref) {
  return (
    <label className={cn("relative inline-flex h-[34px] w-[58px] flex-none cursor-pointer", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-slate-300 transition-colors duration-200",
          "peer-checked:bg-navy-900",
          "after:absolute after:left-1 after:top-1 after:h-[26px] after:w-[26px] after:rounded-full after:bg-white after:shadow-[0_2px_6px_rgba(15,23,42,0.18)] after:transition-transform after:duration-200",
          "peer-checked:after:translate-x-6"
        )}
      />
    </label>
  );
});

export { Switch };
