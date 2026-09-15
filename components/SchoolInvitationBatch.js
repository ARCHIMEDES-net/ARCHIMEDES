import { useState } from "react";
import { parseSchoolInvitationBatch, sendSchoolInvitationBatch } from "../lib/schoolInvitationBatch";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert } from "./ui/alert";

export default function SchoolInvitationBatch({ schoolName, members, attempts, send, busy, onBusy, refresh }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  function prepare() {
    try {
      setError("");
      const parsed = parseSchoolInvitationBatch(text);
      setRows(parsed.map((row) => {
        const member = members.find((item) => item.profile?.email?.toLowerCase() === row.email);
        const attempt = attempts.find((item) => item.recipient_email === row.email && !["failed", "rolled_back"].includes(item.status));
        return { ...row, idempotencyKey: crypto.randomUUID(), status: member || attempt ? "skip" : "ready",
          message: member ? "Již připojen ke škole" : attempt ? "Pozvánka již evidována – zkontrolujte její stav" : "Připraven k pozvání" };
      }));
    } catch (e) { setRows([]); setError(e.message); }
  }
  async function submit() {
    if (busy || started) return;
    onBusy(true); setStarted(true); setError("");
    try {
      const complete = await sendSchoolInvitationBatch(rows, send, (email, status, message) =>
        setRows((current) => current.map((row) => row.email === email ? { ...row, status, message } : row)));
      if (!complete) setError("Odesílání se zastavilo. Zkontrolujte stav pozvánek před dalším pokusem; zbývající učitelé nebyli odesláni.");
    } finally { await refresh(); onBusy(false); }
  }
  return <Card className="mt-5 p-6">
    <h2 className="text-xl font-bold">Hromadně pozvat učitele</h2>
    <p className="mt-2">Vložte dva sloupce z Excelu bez záhlaví: jméno a e-mail. Můžete použít také jeden řádek na učitele ve tvaru Jméno Příjmení;email@skola.cz.</p>
    <label htmlFor="teacher-batch" className="mt-4 block font-semibold">Seznam učitelů pro {schoolName}</label>
    <textarea id="teacher-batch" rows={6} disabled={busy || started} value={text} onChange={(e) => { setText(e.target.value); setRows([]); }} className="mt-2 w-full rounded border border-slate-300 p-3" />
    {error ? <Alert variant="error" className="mt-3">{error}</Alert> : null}
    <Button type="button" variant="secondary" disabled={busy || started} onClick={prepare} className="mt-3">Zkontrolovat seznam</Button>
    {rows.length ? <>
      <ul className="mt-4 space-y-2 break-words">{rows.map((row) => <li key={row.email}><strong>{row.fullName}</strong> · {row.email}<p className="text-sm">{row.message}</p></li>)}</ul>
      <p className="mt-4 text-sm">Novému uživateli připravíme účet a pošleme odkaz pro nastavení hesla. Existující účet zachováme. Během odesílání nechte stránku otevřenou.</p>
      <Button type="button" className="mt-3" disabled={busy || started || !rows.some((row) => row.status === "ready")} onClick={submit}>
        {busy ? "Odesílám pozvánky…" : started ? "Dávka zpracována – ověřte přehled níže" : `Odeslat ${rows.filter((row) => row.status === "ready").length} pozvánek učitelům`}
      </Button>
    </> : null}
  </Card>;
}
