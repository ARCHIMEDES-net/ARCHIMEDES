import Head from "next/head";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
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

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("cs-CZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function NovinkyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const { data, error: loadError } = await supabase
        .from("user_notifications")
        .select("id, kind, title, body, target_path, available_at, read_at")
        .lte("available_at", new Date().toISOString())
        .order("available_at", { ascending: false })
        .limit(100);
      if (loadError) throw loadError;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.message || "Novinky se nepodařilo načíst.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
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

          {!loading && !notifications.length ? (
            <Card className="p-8 text-center">
              <Bell className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-black text-navy-900">Zatím tu nejsou žádná oznámení</h2>
              <p className="mx-auto mt-2 max-w-xl leading-relaxed text-slate-600">
                U připravovaného vysílání můžete zapnout připomenutí. Jakmile bude systém odesílání aktivován, důležité novinky se zobrazí také zde.
              </p>
              <Link href="/portal/kalendar" className="mt-5 inline-flex rounded-xl bg-navy-900 px-4 py-2 font-bold text-white hover:bg-navy-800">
                Prohlédnout program
              </Link>
            </Card>
          ) : null}

          <div className="grid gap-3">
            {notifications.map((item) => {
              const targetPath = safeNotificationTargetPath(item.target_path);
              const content = (
                <Card className={item.read_at ? "p-5" : "border-blue-200 bg-blue-50/60 p-5"}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-black uppercase tracking-wide text-slate-500">{notificationKindLabel(item.kind)}</div>
                      <h2 className="mt-1 text-lg font-black text-navy-900">{item.title}</h2>
                      {item.body ? <p className="mt-2 leading-relaxed text-slate-600">{item.body}</p> : null}
                      <div className="mt-3 text-xs font-semibold text-slate-500">{formatDate(item.available_at)}</div>
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
