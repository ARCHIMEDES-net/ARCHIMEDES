import * as React from "react";
import { cn } from "../../lib/utils";

const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        // Karty na archimedeslive.com nesou hierarchii jen jemným
        // borderem, ne dropshadowem — stín je vyhrazený pro foto/hero
        // bloky (viz shadow-card token), ne pro běžné obsahové karty.
        "rounded-card-md border border-slate-900/[0.07] bg-white",
        className
      )}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn("p-6 pb-0", className)} {...props} />;
});

const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-bold tracking-tight text-navy-900", className)}
      {...props}
    />
  );
});

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <p ref={ref} className={cn("mt-2 text-sm leading-relaxed text-muted", className)} {...props} />
  );
});

const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn("p-6", className)} {...props} />;
});

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
