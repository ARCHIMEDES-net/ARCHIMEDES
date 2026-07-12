import * as React from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[15px] font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand text-white shadow-cta hover:bg-blue-800",
        secondary: "bg-white text-navy-900 border border-slate-900/10 hover:border-slate-300",
        ghost: "text-navy-900 hover:bg-slate-100",
        light: "bg-white text-navy-900 hover:bg-slate-50",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-14 px-7",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const Button = React.forwardRef(function Button(
  { className, variant, size, href, ...props },
  ref
) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return <Link href={href} className={classes} {...props} ref={ref} />;
  }

  return <button className={classes} ref={ref} {...props} />;
});

export { Button, buttonVariants };
