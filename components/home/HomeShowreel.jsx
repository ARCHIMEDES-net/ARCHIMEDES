import Link from "next/link";
import { Pause, Play, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SectionEyebrow from "./SectionEyebrow";

export default function HomeShowreel() {
  const videoRef = useRef(null);
  const userPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45 && !prefersReducedMotion && !userPausedRef.current) {
          video.play().catch(() => setIsPlaying(false));
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.45, 1] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => setIsPlaying(false));
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }

  return (
    <section aria-labelledby="home-showreel-title" className="relative z-10 bg-white pb-12 sm:pb-16">
      <div className="mx-auto -mt-14 max-w-[1180px] px-5 sm:-mt-16">
        <div className="grid overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] lg:grid-cols-[0.37fr_0.63fr] lg:items-stretch">
          <div className="order-2 flex items-center px-6 py-8 sm:px-9 sm:py-10 lg:order-1 lg:px-10">
            <div>
              <SectionEyebrow>ARCHIMEDES Live v praxi</SectionEyebrow>
              <h2
                id="home-showreel-title"
                className="text-[clamp(30px,3.5vw,44px)] font-[950] leading-[1.02] tracking-[-0.045em] text-navy-900"
              >
                Přes obrazovku. A přesto spolu.
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
                Děti, senioři, obce i známé osobnosti v jednom živém programu.
              </p>
              <Link
                href="/program"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-brand transition hover:text-navy-900"
              >
                Prohlédnout program
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="order-1 relative aspect-video overflow-hidden bg-navy-900 lg:order-2 lg:aspect-auto lg:min-h-[430px]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src="/archimedes-live-homepage.mp4"
              poster="/archimedes-live-homepage-poster.webp"
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              aria-label="Krátká ukázka programu ARCHIMEDES Live"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/45 to-transparent" />
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute bottom-4 right-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/45 bg-white/90 text-navy-900 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
              aria-label={isPlaying ? "Pozastavit video" : "Přehrát video"}
            >
              {isPlaying ? <Pause className="h-5 w-5" aria-hidden="true" /> : <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
