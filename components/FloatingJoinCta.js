import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { ArrowUpRight, Building2, GraduationCap, Users, X } from "lucide-react";

const HIDDEN_ROUTES = new Set([
  "/zadost",
  "/ucebna",
  "/poptavka-ucebny",
  "/login",
  "/logout",
  "/reset-hesla",
  "/nastavit-heslo",
  "/nastaveni-pristupu",
  "/join",
  "/welcome",
  "/create-organization",
  "/create-school",
  "/registrace-skoly",
  "/registrace-spolku",
  "/pridat-se-k-organizaci",
  "/guest",
]);

const OPTIONS = [
  {
    type: "obec",
    label: "Obec",
    detail: "Program pro místní školu i spolky",
    icon: Building2,
  },
  {
    type: "skola",
    label: "Škola",
    detail: "Zapojení samostatně nebo přes obec",
    icon: GraduationCap,
  },
  {
    type: "spolek",
    label: "Spolek",
    detail: "Zapojení samostatně nebo přes obec",
    icon: Users,
  },
];

export default function FloatingJoinCta() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const shellRef = useRef(null);
  const triggerRef = useRef(null);
  const firstOptionRef = useRef(null);
  const pathname = router.pathname || "";
  const disabled = pathname.startsWith("/portal") || HIDDEN_ROUTES.has(pathname);

  useEffect(() => {
    if (disabled) {
      setVisible(false);
      setOpen(false);
      return undefined;
    }

    let frame = 0;
    const updateVisibility = () => {
      frame = 0;
      const threshold = pathname === "/" ? Math.min(window.innerHeight * 0.58, 610) : 180;
      const footer = document.querySelector("footer.site-footer");
      const footerIsNear = footer
        ? footer.getBoundingClientRect().top < window.innerHeight - 24
        : false;
      setVisible(window.scrollY > threshold && !footerIsNear);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateVisibility);
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [disabled, pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => firstOptionRef.current?.focus(), 180);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  if (disabled) return null;

  const toggle = () => {
    setOpen((current) => {
      if (!current) track("floating_join_open");
      return !current;
    });
  };

  return (
    <aside
      ref={shellRef}
      className={`floating-join ${visible ? "is-visible" : ""} ${open ? "is-open" : ""}`}
      aria-label="Možnosti zapojení do ARCHIMEDES Live"
    >
      <button
        ref={triggerRef}
        type="button"
        className="floating-join__trigger"
        aria-expanded={open}
        aria-controls="floating-join-panel"
        onClick={toggle}
      >
        <span className="floating-join__dot" aria-hidden="true" />
        <span>{open ? "Zavřít" : "Chci se zapojit"}</span>
        {open ? <X aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}
      </button>

      <div id="floating-join-panel" className="floating-join__panel" aria-hidden={!open}>
        <p className="floating-join__eyebrow">ARCHIMEDES LIVE</p>
        <h2>Koho chcete zapojit?</h2>
        <p className="floating-join__intro">Vyberte cestu a formulář připravíme podle vás.</p>
        <div className="floating-join__options">
          {OPTIONS.map((option, index) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.type}
                ref={index === 0 ? firstOptionRef : undefined}
                href={`/zadost?type=${option.type}`}
                tabIndex={open ? 0 : -1}
                onClick={() => track("floating_join_select", { type: option.type })}
              >
                <span className="floating-join__icon"><Icon aria-hidden="true" /></span>
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.detail}</small>
                </span>
                <ArrowUpRight className="floating-join__arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .floating-join {
          position: fixed;
          z-index: 70;
          right: 22px;
          top: 50%;
          width: 336px;
          transform: translate3d(calc(100% + 42px), -50%, 0);
          opacity: 0;
          pointer-events: none;
          transition: transform 480ms cubic-bezier(.22,1,.36,1), opacity 280ms ease;
        }
        .floating-join.is-visible {
          transform: translate3d(0, -50%, 0);
          opacity: 1;
          pointer-events: auto;
        }
        .floating-join__trigger {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 54px;
          margin-left: auto;
          padding: 0 16px;
          border: 1px solid rgba(255,255,255,.34);
          border-radius: 999px;
          background: rgba(13,49,84,.94);
          box-shadow: 0 18px 50px rgba(8,31,56,.28);
          color: white;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
        }
        .floating-join__trigger:hover { transform: translateX(-4px); background: #123e6c; box-shadow: 0 22px 56px rgba(8,31,56,.34); }
        .floating-join__trigger:focus-visible { outline: 3px solid #efbd58; outline-offset: 3px; }
        .floating-join__trigger :global(svg) { width: 18px; height: 18px; }
        .floating-join__dot { width: 9px; height: 9px; border-radius: 50%; background: #efbd58; box-shadow: 0 0 0 0 rgba(239,189,88,.55); animation: joinPulse 1.6s ease-out 2; }
        .floating-join.is-open .floating-join__dot { display: none; }
        .floating-join__panel {
          position: absolute;
          right: 0;
          top: 66px;
          width: 100%;
          padding: 22px;
          border: 1px solid rgba(255,255,255,.76);
          border-radius: 24px;
          background: rgba(248,251,255,.94);
          box-shadow: 0 28px 80px rgba(8,31,56,.24);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          transform: translateY(-10px) scale(.96);
          transform-origin: top right;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: transform 300ms cubic-bezier(.22,1,.36,1), opacity 200ms ease, visibility 0s linear 300ms;
        }
        .floating-join.is-open .floating-join__panel { transform: none; opacity: 1; visibility: visible; pointer-events: auto; transition-delay: 0s; }
        .floating-join__eyebrow { margin: 0; color: #34618e; font-size: 11px; font-weight: 950; letter-spacing: .16em; }
        .floating-join__panel h2 { margin: 8px 0 0; color: #0d3154; font-size: 24px; line-height: 1.08; letter-spacing: -.035em; font-weight: 950; }
        .floating-join__intro { margin: 8px 0 0; color: #5a6d80; font-size: 13px; line-height: 1.45; }
        .floating-join__options { display: grid; gap: 8px; margin-top: 17px; }
        .floating-join__options :global(a) { display: grid; grid-template-columns: 40px 1fr 18px; align-items: center; gap: 11px; min-height: 62px; padding: 9px 11px; border: 1px solid rgba(13,49,84,.09); border-radius: 16px; background: rgba(255,255,255,.84); color: #0d3154; text-decoration: none; transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease; }
        .floating-join__options :global(a:hover) { transform: translateX(-3px); border-color: rgba(13,49,84,.22); box-shadow: 0 9px 24px rgba(13,49,84,.08); }
        .floating-join__options :global(a:focus-visible) { outline: 3px solid #efbd58; outline-offset: 2px; }
        .floating-join__icon { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 13px; background: #e8f0f8; color: #174e80; }
        .floating-join__icon :global(svg) { width: 19px; height: 19px; }
        .floating-join__options strong { display: block; font-size: 14px; font-weight: 950; }
        .floating-join__options small { display: block; margin-top: 2px; color: #68798a; font-size: 11px; line-height: 1.25; }
        .floating-join__arrow { width: 16px; height: 16px; color: #34618e; }
        @keyframes joinPulse { 70% { box-shadow: 0 0 0 11px rgba(239,189,88,0); } 100% { box-shadow: 0 0 0 0 rgba(239,189,88,0); } }
        @media (max-width: 720px) {
          .floating-join { top: auto; right: 12px; bottom: 12px; width: calc(100% - 24px); transform: translate3d(0, calc(100% + 32px), 0); }
          .floating-join.is-visible { transform: translate3d(0, 0, 0); }
          .floating-join__trigger { min-height: 52px; }
          .floating-join__panel { top: auto; bottom: 64px; max-height: calc(100vh - 104px); overflow-y: auto; transform-origin: bottom right; transform: translateY(10px) scale(.97); }
        }
        @media (prefers-reduced-motion: reduce) {
          .floating-join, .floating-join__trigger, .floating-join__panel, .floating-join__options :global(a) { transition-duration: 0.01ms !important; }
          .floating-join__dot { animation: none; }
        }
      `}</style>
    </aside>
  );
}
