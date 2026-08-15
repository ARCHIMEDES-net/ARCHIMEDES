import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { BellRing, Download, GraduationCap, Globe2, Landmark, Smartphone, Users } from "lucide-react";
import PortalHeader from "../../components/PortalHeader";
import RequireAuth from "../../components/RequireAuth";
import {
  PWA_INSTALLABLE_EVENT,
  PWA_INSTALLED_EVENT,
} from "../../components/PwaRegistration";
import { supabase } from "../../lib/supabaseClient";
import { fetchMyOrganization } from "../../lib/myOrganizations";
import { cn } from "../../lib/utils";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert } from "../../components/ui/alert";
import { Switch } from "../../components/ui/switch";
import { LEGACY_INTEREST_MAP } from "../../lib/interestMappings";
import {
  DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
  isNotificationFoundationMissing,
  normalizeNotificationChannelPreferences,
} from "../../lib/notifications";
import {
  canUsePushNotifications,
  isStandalonePwa,
  pushSubscriptionRow,
  urlBase64ToUint8Array,
} from "../../lib/pwa";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

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
  const [organizationType, setOrganizationType] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [channelPreferences, setChannelPreferences] = useState(
    DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES
  );
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState("");
  const [pushMessage, setPushMessage] = useState("");

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
        const [{ data: membership, error: membershipError }, organization] =
          await Promise.all([
            supabase
              .from("organization_members")
              .select("role_in_org, status")
              .eq("user_id", user.id)
              .eq("organization_id", profile.active_organization_id)
              .eq("status", "active")
              .maybeSingle(),
            fetchMyOrganization(supabase, profile.active_organization_id),
          ]);

        if (membershipError) throw membershipError;

        setRoleText(roleLabel(membership?.role_in_org));
        setOrganizationName(organization?.name || "");
        setOrganizationType(organization?.org_type || "");
        setOrganizationCode(
          organization?.org_type === "school" ? organization?.join_code || "" : ""
        );
        setRegistrationNumber(
          ["municipality", "obec"].includes(organization?.org_type)
            ? organization?.registration_number || ""
            : ""
        );
      } else {
        setRoleText("Uživatel");
        setOrganizationName("");
        setOrganizationType("");
        setOrganizationCode("");
        setRegistrationNumber("");
      }

      const [preferencesResult, legacyResult, channelPreferencesResult] = await Promise.all([
        supabase
          .from("notification_preferences")
          .select("activity_code, enabled")
          .eq("profile_id", user.id),
        supabase
          .from("user_interests")
          .select("interest_slug")
          .eq("user_id", user.id),
        supabase
          .from("notification_channel_preferences")
          .select("email_enabled, push_enabled, new_event_enabled, day_before_enabled, thirty_minutes_before_enabled, schedule_changes_enabled, recording_available_enabled")
          .eq("profile_id", user.id)
          .maybeSingle(),
      ]);

      if (preferencesResult.error) throw preferencesResult.error;
      if (legacyResult.error) throw legacyResult.error;
      if (
        channelPreferencesResult.error &&
        !isNotificationFoundationMissing(channelPreferencesResult.error)
      ) {
        throw channelPreferencesResult.error;
      }

      const nextChannelPreferences = normalizeNotificationChannelPreferences(
        channelPreferencesResult.data,
        profile?.email_notifications_enabled !== false
      );
      setChannelPreferences(nextChannelPreferences);
      setEmailNotificationsEnabled(nextChannelPreferences.email_enabled);

      const explicitPreferences = new Map(
        (preferencesResult.data || []).map((row) => [row.activity_code, row.enabled === true])
      );
      const enabledCodes = (preferencesResult.data || [])
        .filter((row) => row.enabled)
        .map((row) => row.activity_code)
        .filter((code) => ALL_INTEREST_CODES.includes(code));

      for (const legacy of legacyResult.data || []) {
        const code = LEGACY_INTEREST_MAP[legacy.interest_slug];
        if (
          code &&
          ALL_INTEREST_CODES.includes(code) &&
          !explicitPreferences.has(code) &&
          !enabledCodes.includes(code)
        ) {
          enabledCodes.push(code);
        }
      }

      setSelectedInterests(enabledCodes);
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

      const toSave = [...selectedInterests];

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

      const { error: channelPreferencesSaveError } = await supabase
        .from("notification_channel_preferences")
        .upsert(
          {
            profile_id: userId,
            ...channelPreferences,
            email_enabled: emailNotificationsEnabled,
            push_enabled: channelPreferences.push_enabled,
          },
          { onConflict: "profile_id" }
        );
      if (channelPreferencesSaveError) throw channelPreferencesSaveError;

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

  useEffect(() => {
    let mounted = true;

    function refreshInstallState() {
      if (!mounted) return;
      setPwaInstalled(isStandalonePwa());
      setInstallPrompt(window.__archimedesPwaInstallPrompt || null);
    }

    async function refreshPushState() {
      const supported = canUsePushNotifications();
      if (mounted) setPushSupported(supported);
      if (!supported || process.env.NODE_ENV !== "production") return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (mounted) setPushSubscribed(Boolean(subscription));
      } catch (error) {
        console.error("muj-profil push state error:", error);
      }
    }

    refreshInstallState();
    refreshPushState();
    window.addEventListener(PWA_INSTALLABLE_EVENT, refreshInstallState);
    window.addEventListener(PWA_INSTALLED_EVENT, refreshInstallState);

    return () => {
      mounted = false;
      window.removeEventListener(PWA_INSTALLABLE_EVENT, refreshInstallState);
      window.removeEventListener(PWA_INSTALLED_EVENT, refreshInstallState);
    };
  }, []);

  async function handleInstallPwa() {
    const prompt = installPrompt || window.__archimedesPwaInstallPrompt;
    if (!prompt) return;

    await prompt.prompt();
    const choice = await prompt.userChoice;
    window.__archimedesPwaInstallPrompt = null;
    setInstallPrompt(null);
    if (choice?.outcome === "accepted") setPwaInstalled(true);
  }

  async function setStoredPushPreference(profileId, enabled) {
    const { error: preferenceError } = await supabase
      .from("notification_channel_preferences")
      .upsert({ profile_id: profileId, push_enabled: enabled }, { onConflict: "profile_id" });
    if (preferenceError) throw preferenceError;
    setChannelPreferences((current) => ({ ...current, push_enabled: enabled }));
  }

  async function enablePushNotifications() {
    setPushBusy(true);
    setPushError("");
    setPushMessage("");
    let createdSubscription = null;

    try {
      if (!VAPID_PUBLIC_KEY) {
        throw new Error("Push oznámení zatím čekají na bezpečné dokončení serverové konfigurace.");
      }
      if (!pushSupported) {
        throw new Error("Tento prohlížeč push oznámení nepodporuje.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Uživatel není přihlášen.");

      const permission =
        Notification.permission === "default"
          ? await Notification.requestPermission()
          : Notification.permission;
      if (permission !== "granted") {
        throw new Error("Oznámení nebyla povolena v nastavení prohlížeče.");
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        createdSubscription = subscription;
      }

      const row = pushSubscriptionRow(subscription, user.id, navigator.userAgent);
      const { error: subscriptionError } = await supabase
        .from("push_subscriptions")
        .upsert(row, { onConflict: "endpoint" });
      if (subscriptionError) throw subscriptionError;

      await setStoredPushPreference(user.id, true);
      setPushSubscribed(true);
      setPushMessage("Toto zařízení je připravené pro budoucí push oznámení.");
    } catch (error) {
      if (createdSubscription) await createdSubscription.unsubscribe().catch(() => false);
      setPushError(error?.message || "Push oznámení se nepodařilo zapnout.");
    } finally {
      setPushBusy(false);
    }
  }

  async function disablePushNotifications() {
    setPushBusy(true);
    setPushError("");
    setPushMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error("Uživatel není přihlášen.");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription?.endpoint) {
        const { error: deleteError } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
        if (deleteError) throw deleteError;
        await subscription.unsubscribe();
      }

      const { count, error: countError } = await supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", user.id);
      if (countError) throw countError;

      await setStoredPushPreference(user.id, (count || 0) > 0);
      setPushSubscribed(false);
      setPushMessage("Push oznámení byla pro toto zařízení vypnuta.");
    } catch (error) {
      setPushError(error?.message || "Push oznámení se nepodařilo vypnout.");
    } finally {
      setPushBusy(false);
    }
  }

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
                co si zvolíte. Pokud nic nevyberete, tematické pozvánky vám
                posílat nebudeme.
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

                {["municipality", "obec"].includes(organizationType) ? (
                  <div className="mt-6">
                    <Label>Registrační číslo obce</Label>
                    <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 font-mono text-base text-slate-700">
                      {registrationNumber || "—"}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      Číslo identifikuje program obce. Školy a spolky zakládá a
                      s licencí obce propojuje centrální tým ARCHIMEDES.
                    </p>
                  </div>
                ) : null}

                {organizationType === "school" ? (
                  <div className="mt-6">
                    <Label>Kód školy pro učitele</Label>
                    <div className="flex min-h-[52px] items-center rounded-2xl border border-slate-300 bg-slate-50 px-4 font-mono text-base text-slate-700">
                      {organizationCode || "—"}
                    </div>
                  </div>
                ) : null}

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

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <Label>Jaká upozornění chcete dostávat</Label>
                  <p className="mb-4 text-sm leading-relaxed text-slate-500">
                    Volby se použijí pro e-mail a později také pro oznámení nainstalované PWA.
                  </p>

                  <div className="grid gap-3">
                    {[
                      ["new_event_enabled", "Nová vysílání", "Upozornění, když přibude relevantní vysílání."],
                      ["day_before_enabled", "Den před vysíláním", "Připomenutí vybraného vysílání jeden den předem."],
                      [
                        "thirty_minutes_before_enabled",
                        "30 minut před vysíláním",
                        "Zobrazí se v centru novinek; přístupový e-mail v tomto čase posílá WebMeeting.",
                      ],
                      ["schedule_changes_enabled", "Změny a zrušení termínu", "Důležité změny u vybraného vysílání."],
                      ["recording_available_enabled", "Nový záznam", "Informace, že je dostupný záznam vysílání."],
                    ].map(([key, label, description]) => (
                      <div key={key} className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <div className="font-bold text-navy-900">{label}</div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
                        </div>
                        <Switch
                          checked={channelPreferences[key]}
                          disabled={!emailNotificationsEnabled}
                          onChange={(event) =>
                            setChannelPreferences((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Smartphone className="mt-0.5 h-5 w-5 text-navy-900" aria-hidden="true" />
                        <div>
                          <div className="font-bold text-navy-900">Aplikace v telefonu nebo počítači</div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            {pwaInstalled
                              ? "ARCHIMEDES Live je otevřený jako nainstalovaná aplikace."
                              : installPrompt
                                ? "Nainstalujte si ARCHIMEDES Live přímo z tohoto prohlížeče."
                                : "Instalaci najdete také v nabídce prohlížeče jako Přidat na plochu nebo Nainstalovat aplikaci."}
                          </p>
                        </div>
                      </div>
                      {installPrompt && !pwaInstalled ? (
                        <Button type="button" variant="secondary" size="sm" onClick={handleInstallPwa}>
                          <Download className="h-4 w-4" aria-hidden="true" /> Nainstalovat
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-navy-900">
                        <BellRing className="h-4 w-4" aria-hidden="true" /> Push oznámení do telefonu
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {!VAPID_PUBLIC_KEY
                          ? "Rozhraní je připravené, ale serverový klíč ještě není aktivován. Zatím se nic do telefonu neposílá."
                          : pushSubscribed
                            ? "Toto zařízení je registrované. Odesílání zůstává vypnuté do kontrolovaného pilotu."
                            : "Povolení si vyžádáme až po vašem kliknutí. Odesílání zatím zůstává vypnuté."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={pushBusy || !pushSupported || !VAPID_PUBLIC_KEY}
                      onClick={pushSubscribed ? disablePushNotifications : enablePushNotifications}
                    >
                      {pushBusy ? "Ukládám…" : pushSubscribed ? "Vypnout na tomto zařízení" : "Povolit na tomto zařízení"}
                    </Button>
                  </div>
                  {pushError ? <Alert variant="error" className="mt-3">{pushError}</Alert> : null}
                  {pushMessage ? <Alert variant="success" className="mt-3">{pushMessage}</Alert> : null}
                </div>

                <div className="mt-6">
                  <Label>Zajímá mě</Label>
                  <p className="mb-3 text-sm leading-relaxed text-slate-500">
                    Vyberte okruhy, o jaké vysílání a program ARCHIMEDES chcete
                    dostávat upozornění e-mailem.
                  </p>

                  {selectedCount === 0 ? (
                    <Alert variant="neutral" className="mb-3.5 border-orange-200 bg-orange-50 text-orange-800">
                      Nevybrali jste žádné zájmy. Po uložení nebudete zařazeni
                      do žádné tematické pozvánkové skupiny.
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
