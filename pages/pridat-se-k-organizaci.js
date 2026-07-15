import { useEffect, useState } from "react";
import { GraduationCap, Globe2, Landmark, Users } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { cn } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert } from "../components/ui/alert";

const INTEREST_SECTIONS = [
  {
    title: "Pro školu",
    icon: GraduationCap,
    items: [
      { code: "skola_1_stupen", label: "1. stupeň ZŠ" },
      { code: "skola_2_stupen", label: "2. stupeň ZŠ" },
      { code: "ucitele", label: "Učitelé" },
      { code: "karierni_poradenstvi", label: "Kariérní poradenství" },
    ],
  },
  {
    title: "Témata",
    icon: Globe2,
    items: [
      { code: "veda_a_objevy", label: "Věda a objevy" },
      { code: "priroda_a_ekologie", label: "Příroda a ekologie" },
      { code: "historie_a_archeologie", label: "Historie a archeologie" },
      { code: "wellbeing", label: "Wellbeing" },
      { code: "svet_v_souvislostech", label: "Svět v souvislostech" },
      { code: "anglictina", label: "Vysílání v angličtině" },
    ],
  },
  {
    title: "Kluby a programy",
    icon: Landmark,
    items: [
      { code: "ctenarsky_klub", label: "Čtenářský klub" },
      { code: "filmovy_klub", label: "Filmový klub" },
    ],
  },
  {
    title: "Pro komunitu a spolky",
    icon: Users,
    items: [
      { code: "hasici", label: "Požární ochrana" },
      { code: "sport", label: "Sport a tělovýchova" },
      { code: "myslivost", label: "Myslivost" },
      { code: "vcelarstvi", label: "Včelařství" },
      { code: "zahradkari", label: "Zahrádkáři a pěstitelé" },
      { code: "rybarstvi", label: "Rybářství" },
      { code: "chovatelstvi", label: "Chovatelství" },
      { code: "folklor", label: "Folklor a tradice" },
      { code: "kultura", label: "Kultura a umění" },
      { code: "seniori", label: "Senioři" },
      { code: "rodice_deti", label: "Rodiče a děti" },
      { code: "mladez", label: "Děti a mládež" },
      { code: "socialni", label: "Sociální a zdravotní" },
      { code: "duchovni", label: "Duchovní společenství" },
      { code: "komunita", label: "Okrašlovací a komunitní" },
      { code: "smart_city", label: "Chytrá obec" },
      { code: "jine", label: "Jiné" },
    ],
  },
];

export default function PridatSeKOrganizaciPage() {
  const [joinCode, setJoinCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted || !data?.session?.user) return;

      const session = data.session;
      setCurrentSession(session);
      setEmail(session.user.email || "");
      setFullName(
        session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          ""
      );
    });

    return () => {
      mounted = false;
    };
  }, []);

  function toggle(code) {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  async function submitForm(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const trimmedJoinCode = joinCode.trim();
      const trimmedName = fullName.trim();
      const trimmedEmail = email.trim();

      if (!trimmedJoinCode) {
        throw new Error("Vyplňte prosím kód organizace.");
      }

      if (!trimmedName) {
        throw new Error("Vyplňte prosím jméno a příjmení.");
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
      if (!emailOk) {
        throw new Error("Zadejte prosím platný e-mail.");
      }

      if (selected.length === 0) {
        throw new Error("Vyberte prosím alespoň jeden okruh, o který máte zájem.");
      }

      const res = await fetch("/api/pridat-se-k-organizaci", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentSession?.access_token
            ? { Authorization: `Bearer ${currentSession.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          joinCode: trimmedJoinCode,
          fullName: trimmedName,
          email: trimmedEmail,
          activityCodes: selected,
        }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Registraci se nepodařilo odeslat.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Registraci se nepodařilo odeslat.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[820px] px-4 py-10">
        <Card className="p-7">
          <Badge variant="outline">
            {result ? "Zaregistrováno" : "Upozornění na vysílání a program"}
          </Badge>

          {!result ? (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Chci dostávat upozornění na vysílání ARCHIMEDES Live
              </h1>

              <p className="mb-2 mt-3 text-[17px] leading-relaxed text-muted">
                Zadejte kód vaší organizace (spolku nebo školy) a vyberte, o
                jaké vysílání a program máte zájem — budeme vám posílat jen
                upozornění na to, co si zvolíte.
              </p>

              <p className="mb-5 text-sm leading-relaxed text-slate-500">
                Kód organizace vám sdělí kontaktní osoba vašeho spolku nebo
                školy, která už má ARCHIMEDES Live aktivovaný.
              </p>

              {error ? (
                <Alert variant="error" className="mb-4">
                  Chyba: {error}
                </Alert>
              ) : null}

              {currentSession ? (
                <Alert variant="neutral" className="mb-4">
                  Zájmy se uloží k vašemu přihlášenému účtu. Členství v další
                  organizaci tím nevznikne.
                </Alert>
              ) : null}

              <form onSubmit={submitForm} className="grid gap-4">
                <div>
                  <Label htmlFor="joinCode">Kód organizace*</Label>
                  <Input
                    id="joinCode"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Např. ORG-A1B2C3D4"
                  />
                </div>

                <div>
                  <Label htmlFor="fullName">Jméno a příjmení*</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="email">E-mail*</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!currentSession}
                  />
                </div>

                <div>
                  <Label>O co máte zájem?*</Label>

                  <div className="grid gap-5">
                    {INTEREST_SECTIONS.map((section) => (
                      <div key={section.title}>
                        <div className="mb-2.5 flex items-center gap-1.5 text-[15px] font-bold text-navy-900">
                          <section.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                          {section.title}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {section.items.map((item) => {
                            const active = selected.includes(item.code);
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => toggle(item.code)}
                                className={cn(
                                  "rounded-full border px-3.5 py-2 text-sm font-bold transition-colors",
                                  active
                                    ? "border-navy-900 bg-navy-900 text-white"
                                    : "border-slate-900/15 bg-white text-navy-900 hover:border-slate-300"
                                )}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-1 flex flex-wrap gap-2.5">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Odesílám..." : "Zaregistrovat se k upozorněním"}
                  </Button>
                  <Button href="/" variant="secondary">
                    Zpět na hlavní stránku
                  </Button>
                  {!currentSession ? (
                    <Button
                      href="/login?next=/pridat-se-k-organizaci"
                      variant="secondary"
                    >
                      Už mám účet
                    </Button>
                  ) : null}
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-4 text-[34px] font-[950] leading-[1.12] tracking-[-0.03em] text-navy-900">
                Jste zaregistrováni
              </h1>

              <Alert variant="success" className="mb-6 mt-5 text-base">
                Budeme vám posílat upozornění na vysílání a program
                ARCHIMEDES Live pro organizaci „{result.organizationName}“
                podle vybraných okruhů.
                {result.emailSent === false
                  ? " Potvrzovací e-mail se teď nepodařilo odeslat, ale registrace proběhla v pořádku."
                  : result.existingAccount
                    ? " Zájmy byly uloženy k vašemu stávajícímu účtu."
                    : " E-mailem jsme vám poslali také bezpečný odkaz pro nastavení hesla."}
              </Alert>

              <Button href="/">Zpět na hlavní stránku</Button>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
