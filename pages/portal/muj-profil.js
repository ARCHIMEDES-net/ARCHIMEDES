import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { GraduationCap, Globe2, Landmark, Users } from "lucide-react";
import PortalHeader from "../../components/PortalHeader";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";
import { cn } from "../../lib/utils";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert } from "../../components/ui/alert";
import { Switch } from "../../components/ui/switch";

const DEFAULT_INTERESTS = ["skola_1_stupen", "skola_2_stupen"];

// Krok 3 (11.7.2026): sekce/položky odpovídají 1:1 activity_categories
// (migrace 0006) — code tady musí sedět s DB, protože se ukládá do
// notification_preferences.activity_code (FK na activity_categories.code).
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

const ALL_INTEREST_CODES = INTEREST_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.code)
);

function roleLabel(roleInOrg) {
  switch (roleInOrg) {
    case "organization_admin":
      return "Administrátor organizace";
    case "member":
      return "Člen organizace";
    case "demo_viewer":
      return "Demo přístup";
    default:
      return "Uživatel";
  }
}

export default function MujProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState("");
  const [roleText, setRoleText] = useState("Uživatel");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const selectedCount = useMemo(() => selectedInterests.length, [selectedInterests]);

  function toggleInterest(code) {
    setSelectedInterests((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  }

  async function loadProfile() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      setUserId(user.id);
      setEmail(user.email || "");
      setFullName(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, active_organization_id, email_notifications_enabled")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setEmailNotificationsEnabled(profile?.email_notifications_enabled !== false);

      if (profile?.active_organization_id) {
        const [{ data: membership, error: membershipError }, { data: organization, error: organizationError }] =
          await Promise.all([
            supabase
              .from("organization_members")
              .select("role_in_org, status")
              .eq("user_id", user.id)
              .eq("organization_id", profile.active_organization_id)
              .eq("status", "active")
              .maybeSingle(),
            supabase
              .from("organizations")
              .select("name, join_code")
              .eq("id", profile.active_organization_id)
              .maybeSingle(),
          ]);

        if (membershipError) throw membershipError;
        if (organizationError) throw organizationError;

        setRoleText(roleLabel(membership?.role_in_org));
        setOrganizationName(organization?.name || "");
        setOrganizationCode(organization?.join_code || "");
      } else {
        setRoleText("Uživatel");
        setOrganizationName("");
        setOrganizationCode("");
      }

      const { data: preferences, error: preferencesError } = await supabase
        .from("notification_preferences")
        .select("activity_code, enabled")
        .eq("profile_id", user.id);

      if (preferencesError) throw preferencesError;

      const enabledCodes = (preferences || [])
        .filter((row) => row.enabled)
        .map((row) => row.activity_code)
        .filter((code) => ALL_INTEREST_CODES.includes(code));

      setSelectedInterests(enabledCodes.length > 0 ? enabledCodes : DEFAULT_INTERESTS);
    } catch (err) {
      console.error("muj-profil loadProfile error:", err);
      setError(err.message || "Nepodařilo se načíst profil.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!userId) {
        throw new Error("Chybí identita uživatele.");
      }

      let toSave = [...selectedInterests];

      if (toSave.length === 0) {
        toSave = [...DEFAULT_INTERESTS];
        setSelectedInterests(toSave);
      }

      const trimmedName = fullName.trim();

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          name: trimmedName,
        },
      });

      if (authUpdateError) throw authUpdateError;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          email_notifications_enabled: emailNotificationsEnabled,
        })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      // notification_preferences nemá DELETE policy (vědomé rozhodnutí z
      // migrace 0002 — soft-only) — místo mazání řádků upsertujeme VŠECHNY
      // katalogové kódy s enabled podle aktuálního výběru, takže odebraný
      // zájem zůstane v DB jako enabled:false, ne smazaný.
      const rows = ALL_INTEREST_CODES.map((code) => ({
        profile_id: userId,
        activity_code: code,
        enabled: toSave.includes(code),
      }));

      const { error: preferencesSaveError } = await supabase
        .from("notification_preferences")
        .upsert(rows, { onConflict: "profile_id,activity_code" });

      if (preferencesSaveError) throw preferencesSaveError;

      setSuccess("Profil byl uložen.");
    } catch (err) {
      console.error("muj-profil handleSave error:", err);
      setError(err.message || "Profil se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <RequireAuth>
      <Head>
        <title>Můj profil | ARCHIMEDES Live</title>
      </Head>

      <PortalHeader />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[980px] px-5 py-8">
          <Card className="p-7">
            <div className="mb-5">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                Můj profil
              </p>
              <h1 className="text-[34px] font-[950] leading-[1.1] text-navy-900">Zajímá mě</h1>
              <p className="mt-2.5 max-w-[760px] text-base leading-relaxed text-muted">
                Vyberte, o jaká vysílání máte zájem. Budeme vám posílat jen to,
                co si zvolíte. Pokud nic nevyberete, nastaví se základní program
                pro 1. a 2. stupeň.
              </p>
            </div>

            {loading ? (
              <Alert variant="info">Načítám profil…</Alert>
            ) : (
              <form onSubmit={handleSave}>
                <div className="mt-6">
                  <Label htmlFor="fullName">Jméno</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vaše jméno"
                  />
                </div>

                <div className="mt-6">
                  <Label>E-mail</Label>
                  <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-700">
                    {email || "—"}
                  </div>
                </div>

                <div className="mt-6">
                  <Label>Role</Label>
                  <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-700">
                    {roleText}
                  </div>
                </div>

                <div className="mt-6">
                  <Label>Organizace</Label>
                  <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-700">
                    {organizationName || "—"}
                  </div>
                </div>

                <div className="mt-6">
                  <Label>Kód organizace</Label>
                  <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-700">
                    {organizationCode || "—"}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <Label className="mb-0">E-mailové pozvánky</Label>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                        Zapněte si pozvánky na vysílání podle vybraných zájmů.
                      </p>
                    </div>

                    <Switch
                      checked={emailNotificationsEnabled}
                      onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label>Zajímá mě</Label>
                  <p className="mb-3 text-sm leading-relaxed text-slate-500">
                    Vyberte okruhy, o jaké vysílání a program ARCHIMEDES chcete
                    dostávat upozornění e-mailem.
                  </p>

                  {selectedCount === 0 ? (
                    <Alert variant="neutral" className="mb-3.5 border-orange-200 bg-orange-50 text-orange-800">
                      Nevybrali jste žádné zájmy. Po uložení nastavíme automaticky
                      1. stupeň a 2. stupeň.
                    </Alert>
                  ) : null}

                  <div className="grid gap-5">
                    {INTEREST_SECTIONS.map((section) => (
                      <div key={section.title}>
                        <h3 className="mb-3 flex items-center gap-1.5 text-lg font-bold text-navy-900">
                          <section.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                          {section.title}
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {section.items.map((item) => {
                            const active = selectedInterests.includes(item.code);
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => toggleInterest(item.code)}
                                className={cn(
                                  "rounded-full border px-4 py-2.5 text-[15px] font-bold transition-colors",
                                  active
                                    ? "border-navy-900 bg-navy-900 text-white"
                                    : "border-slate-300 bg-white text-navy-900 hover:border-slate-400"
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

                {error ? (
                  <Alert variant="error" className="mt-3.5">
                    {error}
                  </Alert>
                ) : null}
                {success ? (
                  <Alert variant="success" className="mt-3.5">
                    {success}
                  </Alert>
                ) : null}

                <div className="mt-7">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Ukládám…" : "Uložit profil"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </main>
    </RequireAuth>
  );
}
