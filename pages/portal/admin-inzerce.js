import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import RequirePlatformAdmin from "../../components/RequirePlatformAdmin";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Alert } from "../../components/ui/alert";
import { Switch } from "../../components/ui/switch";

export default function AdminInzerce() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("marketplace_posts")
      .select(
        "id,type,category,title,location,is_archimedes,is_pinned,status,created_at,expires_at,contact_email,contact_phone"
      )
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message || "Chyba při načítání.");
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id, field, value) {
    setErr("");
    const { error } = await supabase
      .from("marketplace_posts")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      setErr(error.message || "Nepodařilo se uložit změnu.");
      return;
    }

    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function remove(id) {
    if (!confirm("Opravdu smazat inzerát?")) return;

    setErr("");
    const { error } = await supabase.from("marketplace_posts").delete().eq("id", id);

    if (error) {
      setErr(error.message || "Nepodařilo se smazat.");
      return;
    }

    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <RequirePlatformAdmin>
      <PortalHeader />

      <div className="mx-auto max-w-[1100px] px-5 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-black text-navy-900">Admin – inzerce</h1>
            <p className="mt-1 text-sm text-muted">Správa inzerátů (TOP, ARCHIMEDES, mazání).</p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2.5">
            <Button href="/portal" variant="secondary" size="sm">
              Portál
            </Button>
            <Button href="/portal/inzerce" variant="secondary" size="sm">
              Inzerce
            </Button>
            <Button href="/portal/inzerce/novy" variant="secondary" size="sm">
              + Nový inzerát
            </Button>
            <Button onClick={load} variant="secondary" size="sm">
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Obnovit
            </Button>
          </div>
        </div>

        {err ? (
          <Alert variant="error" className="mt-4">
            <b>Chyba:</b> {err}
          </Alert>
        ) : null}

        {loading ? (
          <div className="mt-6 text-muted">Načítám…</div>
        ) : (
          <div className="mt-6 grid gap-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="text-base font-black text-navy-900">{r.title}</div>

                  <div className="ml-1.5 text-xs text-slate-500">
                    {r.category} • {r.type} • {r.status} •{" "}
                    {new Date(r.created_at).toLocaleString("cs-CZ")}
                    {r.expires_at
                      ? ` • Expirace: ${new Date(r.expires_at).toLocaleString("cs-CZ")}`
                      : ""}
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-4">
                    <Button href={`/portal/inzerce/${r.id}`} variant="ghost" size="sm">
                      Detail
                    </Button>

                    <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
                      TOP
                      <Switch
                        checked={!!r.is_pinned}
                        onChange={(e) => toggle(r.id, "is_pinned", e.target.checked)}
                      />
                    </label>

                    <label className="flex items-center gap-2 text-sm font-bold text-navy-900">
                      ARCHIMEDES
                      <Switch
                        checked={!!r.is_archimedes}
                        onChange={(e) => toggle(r.id, "is_archimedes", e.target.checked)}
                      />
                    </label>

                    <Button
                      onClick={() => remove(r.id)}
                      variant="secondary"
                      size="sm"
                      className="border-red-200 text-red-600 hover:border-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Smazat
                    </Button>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Kontakt: {r.contact_email || "—"} • {r.contact_phone || "—"}{" "}
                  {r.location ? `• ${r.location}` : ""}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RequirePlatformAdmin>
  );
}
