import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function PortalMenu({ label, active, children }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    function close(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return <div ref={root} className="relative" onKeyDown={(event) => {
    if (event.key === "Escape") { setOpen(false); root.current?.querySelector("button")?.focus(); }
  }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`min-h-11 rounded-xl px-3 py-2 text-sm font-bold ${active ? "bg-navy-900 text-white" : "text-navy-900 hover:bg-slate-100"}`}>
      {label} <span aria-hidden="true">⌄</span>
    </button>
    {open ? <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl" onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>{children}</div> : null}
  </div>;
}

export function MenuLink({ href, children }) {
  return <Link href={href} className="block min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-900 hover:bg-slate-100">{children}</Link>;
}
