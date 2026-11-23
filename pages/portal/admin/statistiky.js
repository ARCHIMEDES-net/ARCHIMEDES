import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RequirePlatformAdmin from "../../../components/RequirePlatformAdmin";
import PortalHeader from "../../../components/PortalHeader";
import { supabase } from "../../../lib/supabaseClient";

const PERIODS = [7, 30, 90];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDay(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).split("-");
  return `${Number(day)}. ${Number(month)}. ${year}`;
}

function StatCard({ label, value, hint }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 text-3xl font-black text-navy-900">{value ?? "—"}</p>
      {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
    </section>
  );
}

function UsageStatsView({ stats }) {
  const accounts = stats?.accounts || {};
  const daily = Array.isArray(stats?.daily) ? stats.daily : [];
  const broadcasts = Array.isArray(stats?.broadcasts) ? stats.broadcasts : [];
  const maxDaily = Math.max(1, ...daily.map((row) => Number(row.users) || 0));

  return (
    <>
      <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Měření běží od {stats?.measuredSince ? formatDay(stats.measuredSince) : "nasazení této verze"}.
        Starší dny nejsou k dispozici. Správci platformy se do čísel nezapočítávají.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard
          label={`Aktivní lidé za ${stats?.days ?? 30} dní`}
          value={stats?.activeUsers}
          hint="Různí přihlášení lidé, kteří alespoň jednou otevřeli portál."
        />
        <StatCard
          label="Aktivní lidé za 7 dní"
          value={stats?.activeUsers7d}
          hint="Totéž za poslední týden."
        />
        <StatCard
          label="Vracející se lidé"
          value={stats?.returningUsers}
          hint="Přišli alespoň ve dvou různých dnech."
        />
        <StatCard
          label="Aktivní organizace"
          value={stats?.activeOrganizations}
          hint="Obce, školy a spolky, za které někdo portál otevřel."
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <StatCard label="Účty celkem" value={accounts.total} />
        <StatCard
          label="Nikdy nepřihlášené účty"
          value={accounts.neverSignedIn}
          hint="Účet existuje, ale člověk se ještě nikdy nepřihlásil."
        />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-navy-900">Aktivní lidé po dnech</h2>
        {daily.length ? (
          <div className="mt-3 grid gap-1">
            {daily.map((row) => (
              <div key={row.day} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-slate-600">{formatDay(row.day)}</span>
                <span
                  className="h-4 rounded bg-teal-600"
                  style={{ width: `${Math.max(2, (Number(row.users) / maxDaily) * 100)}%` }}
                  aria-hidden="true"
                />
                <span className="font-bold text-navy-900">{row.users}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-slate-600">Zatím žádná data.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-navy-900">Proběhlá vysílání</h2>
        <p className="mt-1 text-sm text-slate-600">
          „Klikli na vstup“ = různí přihlášení lidé, kteří v portálu klikli na tlačítko vstupu.
          „Připojená zařízení“ uvádí WebMeeting jen u místností založených přes portál
          a až po načtení výsledků vysílání. Jedno zařízení může sledovat celá třída.
        </p>
        {broadcasts.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-slate-600">
                <tr>
                  <th className="py-2 pr-3">Vysílání</th>
                  <th className="py-2 pr-3">Začátek</th>
                  <th className="py-2 pr-3">Přihlášeno</th>
                  <th className="py-2 pr-3">Klikli na vstup</th>
                  <th className="py-2 pr-3">Organizací</th>
                  <th className="py-2">Připojená zařízení</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((row) => (
                  <tr key={row.eventId} className="border-t border-slate-100">
                    <td className="py-2 pr-3 font-semibold text-navy-900">
                      <Link href={`/portal/admin/vysilani/${row.eventId}`}>{row.title}</Link>
                    </td>
                    <td className="py-2 pr-3">{formatDate(row.startsAt)}</td>
                    <td className="py-2 pr-3">{row.registered}</td>
                    <td className="py-2 pr-3">{row.joinClicks}</td>
                    <td className="py-2 pr-3">{row.joinOrganizations}</td>
                    <td className="py-2">
                      {row.connectedDevices ?? (row.integratedRoom ? "načtěte výsledky" : "neměřeno")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-slate-600">V tomto období neproběhlo žádné vysílání.</p>
        )}
      </section>

      <p className="mt-4 text-xs text-slate-500">Vygenerováno {formatDate(stats?.generatedAt)}.</p>
    </>
  );
}

export default function UsageStatisticsPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (period) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Přihlášení vypršelo. Přihlaste se prosím znovu.");
      const response = await fetch(`/api/admin/usage-stats?days=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Statistiky se nepodařilo načíst.");
      setStats(payload.stats);
    } catch (loadError) {
      setError(loadError.message || "Statistiky se nepodařilo načíst.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  return (
    <RequirePlatformAdmin>
      <PortalHeader />
      <main className="mx-auto max-w-[1100px] px-4 py-6">
        <Link href="/portal/admin" className="text-sm font-semibold text-slate-600">← Správa platformy</Link>
        <h1 className="mt-2 text-3xl font-black text-navy-900">Statistiky používání</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {PERIODS.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setDays(period)}
              className={`min-h-11 rounded-xl px-4 py-2 font-bold ${
                days === period
                  ? "bg-navy-900 text-white"
                  : "border border-slate-300 bg-white text-navy-900"
              }`}
            >
              {period} dní
            </button>
          ))}
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-red-800">{error}</p>
        ) : null}
        {loading && !stats ? <p className="mt-4 text-slate-600">Načítám…</p> : null}
        {stats ? <UsageStatsView stats={stats} /> : null}
      </main>
    </RequirePlatformAdmin>
  );
}
