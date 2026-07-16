import * as React from "react";
import { cn } from "../../lib/utils";

const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn("mb-2 block text-sm font-bold text-navy-900", className)}
      {...props}
    />
  );
});

export { Label };
