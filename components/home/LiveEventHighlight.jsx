import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import { trackConversion } from "../../lib/conversionAnalytics";
import { Button } from "../ui/button";

// Aktualita na úvodní stránce: Miss World Krystyna Pyszková, 26. 11. 2026 v 10:30.
// Po skončení vysílání se sama skryje (nahradí ji odkaz na záznam).
const EVENT = {
  hideAfter: "2026-11-26T11:30:00Z", // 12:30 v Praze
  registrationUrl: "https://admin.webmeeting.cz/enrol/enrol/20275?code=186fd2f6",
  video: "/aktualita-miss-world-pozvanka.mp4",
  videoPoster: "/aktualita-miss-world-pozvanka-nahled.jpg",
  poster: "/aktualita-miss-world-plakat.webp",
};

export default function LiveEventHighlight() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (Date.now() > Date.parse(EVENT.hideAfter)) setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <section
      aria-labelledby="aktualita-miss-world-title"
      className="border-b border-slate-200 bg-[#0f1a4a] text-white"
    >
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-14">
        <div>
          <span className="inline-flex rounded-full bg-[#efbd58] px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-950">
            Aktualita · zdarma pro všechny školy
          </span>

          <h2
            id="aktualita-miss-world-title"
            className="mt-5 text-[clamp(34px,4.6vw,56px)] font-[950] leading-[1] tracking-[-0.04em]"
          >
            Miss World ve vaší třídě
          </h2>

          <p className="mt-4 inline-flex items-center gap-2 text-lg font-bold text-[#efbd58]">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
            Čtvrtek 26. 11. 2026 v 10:30 · živě pro 2. stupeň ZŠ
          </p>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Krystyna Pyszková, Miss World 2024, bude s moderátorkou Karolínou
            Kopíncovou mluvit o své cestě k titulu a o aplikaci Money Monsters,
            která hravou formou učí hospodařit s penězi. Hodí se do výchovy
            k občanství, matematiky i třídnických hodin.
          </p>

          <p className="mt-4 max-w-xl text-base font-semibold leading-relaxed text-white">
            Vysílání i záznam jsou výjimečně zdarma pro všechny školy, i když
            vaše obec program ARCHIMEDES Live zatím nemá. Do vysílání se
            zaregistrujte předem. Odkaz na připojení vám přijde e-mailem asi
            15 až 30 minut před začátkem. Vysílání pak stačí pustit ve třídě
            na tabuli.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              href={EVENT.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-auto min-h-12 whitespace-normal bg-[#efbd58] py-3 text-center text-slate-950 hover:bg-[#f5ca73]"
              onClick={() => trackConversion("aktualita_miss_world_registrace")}
            >
              Zaregistrovat třídu do vysílání
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              href={EVENT.poster}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              className="h-auto min-h-12 whitespace-normal border border-white/50 bg-white/5 py-3 text-center text-white hover:bg-white/15"
            >
              Zobrazit plakát
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 items-start gap-4">
          <video
            className="aspect-[9/16] w-full rounded-2xl bg-black object-cover shadow-[0_18px_42px_rgba(0,0,0,0.35)]"
            src={EVENT.video}
            poster={EVENT.videoPoster}
            controls
            playsInline
            preload="none"
          >
            Váš prohlížeč video nepřehraje.
          </video>
          <a href={EVENT.poster} target="_blank" rel="noopener noreferrer" className="block">
            <img
              src={EVENT.poster}
              alt="Plakát: Miss World ve vaší třídě, 26. 11. 2026 v 10:30, host Krystyna Pyszková, moderuje Karolína Kopíncová"
              loading="lazy"
              className="w-full rounded-2xl shadow-[0_18px_42px_rgba(0,0,0,0.35)]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
