import { beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "../helpers/http";
const db = vi.hoisted(() => ({ from: vi.fn(), auth: { getUser: vi.fn() } }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => db }));
import handler from "../../pages/api/admin/event-attendees";
import { loadEventAttendees, attendanceWorkbook } from "../../lib/server/eventAttendees";
const id = "00000000-0000-4000-8000-000000000001";
function query(data, error = null) {
  const q = {};
  for (const key of ["select", "eq", "in", "order", "range", "maybeSingle"]) q[key] = vi.fn(() => q);
  q.then = (resolve) => Promise.resolve({ data, error }).then(resolve);
  return q;
}
function admin() {
  db.auth.getUser.mockResolvedValue({ data: { user: { id: "admin", email: "admin@example.com" } }, error: null });
  db.from.mockReturnValueOnce(query({ user_id: "admin", role: "admin" }))
    .mockReturnValueOnce(query({ id: "admin", email: "admin@example.com", is_active: true }));
}
beforeEach(() => { db.from.mockReset(); db.auth.getUser.mockReset(); });
describe("attendance admin API", () => {
  it("rejects anonymous requests before reading attendance", async () => {
    const { res } = await invoke(handler, { method: "GET", query: { eventId: id } });
    expect(res.statusCode).toBe(401); expect(db.from).not.toHaveBeenCalled();
  });
  it("rejects a regular user even for Excel export", async () => {
    db.auth.getUser.mockResolvedValue({ data: { user: { id: "teacher" } }, error: null });
    db.from.mockReturnValueOnce(query(null));
    const { res } = await invoke(handler, { method: "GET", headers: { authorization: "Bearer test" }, query: { eventId: id, format: "excel" } });
    expect(res.statusCode).toBe(403); expect(db.from).toHaveBeenCalledTimes(1);
  });
  it("rejects inactive administrators", async () => {
    db.auth.getUser.mockResolvedValue({ data: { user: { id: "admin", email: "a@b.cz" } }, error: null });
    db.from.mockReturnValueOnce(query({ user_id: "admin", role: "super_admin" })).mockReturnValueOnce(query({ id: "admin", email: "a@b.cz", is_active: false }));
    const { res } = await invoke(handler, { method: "GET", headers: { authorization: "Bearer test" }, query: { eventId: id } });
    expect(res.statusCode).toBe(403); expect(db.from).toHaveBeenCalledTimes(2);
  });
  it("returns actual registrations with person and organization", async () => {
    admin();
    db.from.mockReturnValueOnce(query({ id, title: "Vysílání" }))
      .mockReturnValueOnce(query([{ id: "r", organization_id: "o", user_id: "p", created_at: "2026-09-11T08:00:00Z" }]))
      .mockReturnValueOnce(query([{ id: "o", name: "Obec" }]))
      .mockReturnValueOnce(query([{ id: "p", full_name: "Učitel", email: "ucitel@example.com" }]));
    const { res } = await invoke(handler, { method: "GET", headers: { authorization: "Bearer test" }, query: { eventId: id } });
    expect(res.statusCode).toBe(200);
    expect(res.body.attendees[0]).toMatchObject({ organization: "Obec", name: "Učitel", email: "ucitel@example.com" });
  });
  it("does not silently truncate more than one page and preserves missing profiles", async () => {
    const rows = Array.from({ length: 200 }, (_, n) => ({ id: String(n), organization_id: "o", user_id: "p" }));
    const second = query([{ id: "last", organization_id: "o", user_id: "missing" }]);
    db.from.mockReturnValueOnce(query(rows)).mockReturnValueOnce(query([{ id: "o", name: "Škola" }])).mockReturnValueOnce(query([]))
      .mockReturnValueOnce(second).mockReturnValueOnce(query([{ id: "o", name: "Škola" }])).mockReturnValueOnce(query([]));
    const result = await loadEventAttendees(db, id);
    expect(result).toHaveLength(201); expect(second.range).toHaveBeenCalledWith(200, 399);
    expect(result[200].email).toBe(""); expect(result[200].organization).toBe("Škola");
  });
  it("escapes spreadsheet content and encodes formulas as text", () => {
    const xml = attendanceWorkbook("A & B", [{ organization: "<škola>", name: '=HYPERLINK("x")', email: "a@b.cz", created_at: "2026-09-11T08:00:00Z" }]);
    expect(xml).toContain("A &amp; B"); expect(xml).toContain("&lt;škola&gt;");
    expect(xml).toContain('ss:Type="String">=HYPERLINK(&quot;x&quot;)');
    expect(xml).not.toContain("ss:Formula");
  });
});
