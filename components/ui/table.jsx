import * as React from "react";
import { cn } from "../../lib/utils";

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div className="w-full overflow-x-auto rounded-card-md border border-slate-200">
      <table ref={ref} className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
});

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={cn("bg-slate-50", className)} {...props} />;
});

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} className={cn("divide-y divide-slate-100", className)} {...props} />;
});

const TableRow = React.forwardRef(function TableRow({ className, ...props }, ref) {
  return <tr ref={ref} className={cn("transition-colors hover:bg-slate-50/70", className)} {...props} />;
});

const TableHead = React.forwardRef(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      className={cn(
        "whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500",
        className
      )}
      {...props}
    />
  );
});

const TableCell = React.forwardRef(function TableCell({ className, ...props }, ref) {
  return <td ref={ref} className={cn("px-4 py-3 align-top text-navy-900", className)} {...props} />;
});

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
