import Head from "next/head";
import Link from "next/link";
import { Bell, CalendarClock, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import PortalHeader from "../../components/PortalHeader";
import RequireAuth from "../../components/RequireAuth";
import { Alert } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  notificationKindLabel,
  safeNotificationTargetPath,
} from "../../lib/notifications";
import { supabase } from "../../lib/supabaseClient";
import {
  appBadgePermissionState,
  publishUnreadNotificationCount,
  requestAppBadgePermission,
  syncAppBadge,
} from "../../lib/appBadge";

function formatBroadcastDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NovinkyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [badgePermission, setBadgePermission] = useState("unsupported");
  const [requestingBadgePermission, setRequestingBadgePermission] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const [
        { data: notificationData, error: notificationError },
        { data: eventData, error: eventError },
      ] = await Promise.all([
        supabase
          .from("user_notifications")
          .select("id, event_id, kind, title, body, target_path, available_at, read_at, events(starts_at)")
          .lte("available_at", nowIso)
          .order("available_at", { ascending: false })
          .limit(100),
        supabase
          .from("events")
          .select("id, title, starts_at, category")
          .eq("is_published", true)
          .gt("starts_at", nowIso)
          .order("starts_at", { ascending: true })
          .limit(1),
      ]);

      if (notificationError) throw notificationError;
      if (eventError) throw eventError;

      setNotifications(Array.isArray(notificationData) ? notificationData : []);
      setNextEvent(Array.isArray(eventData) ? eventData[0] || null : null);
    } catch (loadError) {
      setError(loadError?.message || "Novinky se nepodařilo načíst.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    setBadgePermission(appBadgePermissionState());
  }, []);

  async function markAllRead() {
    const unreadIds = notifications.filter((item) => !item.read_at).map((item) => item.id);
    if (!unreadIds.length) return;
    setSaving(true);
    setError("");
    try {
      const readAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("user_notifications")
        .update({ read_at: readAt })
        .in("id", unreadIds);
      if (updateError) throw updateError;
      setNotifications((items) =>
        items.map((item) => (unreadIds.includes(item.id) ? { ...item, read_at: readAt } : item))
      );
    } catch (updateError) {
      setError(updateError?.message || "Oznámení se nepodařilo označit jako přečtená.");
    } finally {
      setSaving(false);
    }
  }

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  async function enableIconBadge() {
    setRequestingBadgePermission(true);
    const permission = await requestAppBadgePermission();
    setBadgePermission(permission);
    if (permission === "granted") publishUnreadNotificationCount(unreadCount);
    setRequestingBadgePermission(false);
  }

  useEffect(() => {
    if (!loading) publishUnreadNotificationCount(unreadCount);
  }, [loading, unreadCount]);

  return (
    <RequireAuth>
      <Head><title>Co je nového | ARCHIMEDES Live</title></Head>
      <PortalHeader title="Co je nového" />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[900px] px-5 py-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">ARCHIMEDES Live</p>
              <h1 className="text-[34px] font-[950] leading-tight text-navy-900">Co je nového</h1>
              <p className="mt-2 text-slate-600">Nová vysílání, změny termínů a vaše připomenutí na jednom místě.</p>
            </div>
            <Button type="button" variant="secondary" onClick={markAllRead} disabled={!unreadCount || saving}>
              <CheckCheck className="mr-2 h-4 w-4" aria-hidden="true" />
              {saving ? "Ukládám…" : "Označit vše jako přečtené"}
            </Button>
          </div>

          {error ? <Alert variant="error" className="mb-4">{error}</Alert> : null}
          {loading ? <Alert variant="info">Načítám novinky…</Alert> : null}

          {!loading && badgePermission === "default" ? (
            <Card className="mb-5 border-blue-200 bg-blue-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="max-w-xl">
                  <h2 className="font-black text-navy-900">Zobrazovat nepřečtené novinky na ikoně</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Číslo na ikoně ukáže počet nepřečtených novinek a po jejich označení jako přečtené zmizí. iPhone vyžaduje jednorázové povolení oznámení; tímto krokem se nezapnou žádné e-maily ani automatické push zprávy.
                  </p>
                </div>
                <Button type="button" onClick={enableIconBadge} disabled={requestingBadgePermission}>
                  <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                  {requestingBadgePermission ? "Čekám na potvrzení…" : "Zapnout číslo na ikoně"}
                </Button>
              </div>
            </Card>
          ) : null}

          {!loading && badgePermission === "denied" ? (
            <Alert variant="info" className="mb-5">
              Číslo na ikoně je v iPhonu zakázané. Zapnete ho v Nastavení → Oznámení → A Live → Odznaky.
            </Alert>
          ) : null}

          {!loading && nextEvent ? (
            <Card className="mb-5 overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <CalendarClock className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-emerald-700">
                    Nejbližší vysílání
                  </p>
                  <h2 className="mt-2 text-xl font-black leading-tight text-navy-900 sm:text-2xl">
                    {nextEvent.title}
                  </h2>
                  <p className="mt-2 font-semibold text-slate-600">
                    {formatBroadcastDate(nextEvent.starts_at)}
                    {nextEvent.category ? ` · ${nextEvent.category}` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/portal/udalost/${nextEvent.id}`}
                      className="inline-flex min-h-11 items-center rounded-xl bg-navy-900 px-4 py-2 font-bold text-white hover:bg-navy-800"
                    >
                      Nastavit připomenutí
                    </Link>
                    <Link
                      href="/portal/kalendar"
                      className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-navy-900 hover:border-slate-300"
                    >
                      Celý program
                    </Link>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Samotné zobrazení této karty žádné upozornění ani e-mail neodesílá.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          {!loading && !notifications.length ? (
            <Card className="p-8 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-navy-900">Zatím tu nejsou žádná další oznámení</h2>
              <p className="mx-auto mt-2 max-w-xl leading-relaxed text-slate-600">
                Změny termínů a vámi zvolená připomenutí se zobrazí zde. Připomenutí nejbližšího vysílání nastavíte na jeho detailu.
              </p>
              <Link href="/portal/kalendar" className="mt-5 inline-flex rounded-xl bg-navy-900 px-4 py-2 font-bold text-white hover:bg-navy-800">
                Prohlédnout program
              </Link>
            </Card>
          ) : null}

          <div className="grid gap-3">
            {notifications.map((item) => {
              const targetPath = safeNotificationTargetPath(item.target_path);
              const event = Array.isArray(item.events) ? item.events[0] : item.events;
              const content = (
                <Card className={item.read_at ? "p-5" : "border-blue-200 bg-blue-50/60 p-5"}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{notificationKindLabel(item.kind)}</div>
                      <h2 className="mt-1 text-lg font-black text-navy-900">{item.title}</h2>
                      {item.body ? <p className="mt-2 leading-relaxed text-slate-600">{item.body}</p> : null}
                      {event?.starts_at ? (
                        <div className="mt-3 text-sm font-bold text-slate-600">
                          Termín vysílání: {formatBroadcastDate(event.starts_at)}
                        </div>
                      ) : null}
                    </div>
                    {!item.read_at ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" aria-label="Nepřečtené" /> : null}
                  </div>
                </Card>
              );
              return targetPath ? <Link key={item.id} href={targetPath}>{content}</Link> : <div key={item.id}>{content}</div>;
            })}
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
