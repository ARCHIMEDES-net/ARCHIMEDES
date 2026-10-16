import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";

export default function HeroPromoVideo() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const videoRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const video = videoRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    video?.play().catch(() => {}); // Native controls remain available if autoplay is blocked.
    return () => {
      video?.pause();
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Přehrát: Poznejte ARCHIMEDES za 2 minuty"
        className="group mt-8 block w-[260px] max-w-full overflow-hidden rounded-2xl border border-white/60 bg-[#153a63]/90 text-left text-white shadow-xl backdrop-blur transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#efbd58] lg:absolute lg:right-5 lg:top-6 lg:mt-0 lg:w-[240px]"
      >
        <span className="relative block aspect-video overflow-hidden">
          <img src="/archimedes-promo-2min-poster.webp" alt="" width="640" height="360" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/15">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efbd58] text-slate-950 shadow-lg transition group-hover:scale-110">
              <Play className="ml-1 h-6 w-6" fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        </span>
        <span className="block px-4 py-3 text-sm font-bold leading-snug">Poznejte ARCHIMEDES<br /><span className="text-[#efbd58]">za 2 minuty</span></span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="hero-promo-title"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        className="hero-promo-dialog"
      >
        <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <h2 id="hero-promo-title" className="text-sm font-bold sm:text-lg">Poznejte ARCHIMEDES za 2 minuty</h2>
            <button autoFocus type="button" onClick={() => setOpen(false)} aria-label="Zavřít video" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#efbd58]">
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          {open && <video ref={videoRef} src="/archimedes-promo-2min.mp4" poster="/archimedes-promo-2min-poster.webp" controls playsInline preload="none" className="block max-h-[75dvh] w-full bg-black" aria-label="Dvouminutové představení projektu ARCHIMEDES" />}
        </div>
      </dialog>
      <style jsx>{`
        .hero-promo-dialog { width: min(1100px, calc(100vw - 24px)); max-width: none; max-height: calc(100dvh - 24px); padding: 0; border: 0; margin: auto; background: transparent; color: white; overflow: auto; }
        .hero-promo-dialog::backdrop { background: rgba(2, 6, 23, .85); }
      `}</style>
    </>
  );
}
