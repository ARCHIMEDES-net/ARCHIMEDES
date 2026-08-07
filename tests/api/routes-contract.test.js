import { describe, expect, it } from "vitest";
import { invoke } from "../helpers/http";

const guardedRoutes = [
  ["admin/activate-municipality", () => import("../../pages/api/admin/activate-municipality"), "GET", "POST"],
  ["admin/invite-municipality-admin", () => import("../../pages/api/admin/invite-municipality-admin"), "GET", "POST"],
  ["admin/broadcast-recipients", () => import("../../pages/api/admin/broadcast-recipients"), "GET", "POST"],
  ["admin/group-counts", () => import("../../pages/api/admin/group-counts"), "POST", "GET"],
  ["admin/group-users", () => import("../../pages/api/admin/group-users"), "POST", "GET"],
  ["admin/webmeeting/attendance", () => import("../../pages/api/admin/webmeeting/attendance"), "POST", "GET"],
  ["admin/webmeeting/create-meeting", () => import("../../pages/api/admin/webmeeting/create-meeting"), "GET", "POST"],
  ["admin/webmeeting/moderator-url", () => import("../../pages/api/admin/webmeeting/moderator-url"), "GET", "POST"],
  ["admin/webmeeting/status", () => import("../../pages/api/admin/webmeeting/status"), "DELETE", "GET, POST"],
  ["admin/webmeeting/sync-results", () => import("../../pages/api/admin/webmeeting/sync-results"), "GET", "POST"],
  ["admin/webmeeting/update-meeting", () => import("../../pages/api/admin/webmeeting/update-meeting"), "GET", "POST"],
  ["broadcasts/[eventId]/join", () => import("../../pages/api/broadcasts/[eventId]/join"), "GET", "POST"],
  ["cron/send-reminders", () => import("../../pages/api/cron/send-reminders"), "DELETE", "GET, POST"],
  ["instagram", () => import("../../pages/api/instagram"), "POST", "GET"],
  ["invite-user", () => import("../../pages/api/invite-user"), "GET", "POST"],
  ["join-organization", () => import("../../pages/api/join-organization"), "GET", "POST"],
  ["municipality/invite-context", () => import("../../pages/api/municipality/invite-context"), "GET", "POST"],
  [
    "municipality/organization-invites",
    () => import("../../pages/api/municipality/organization-invites"),
    "DELETE",
    "GET, POST, PATCH",
  ],
  ["poptavka-ucebny", () => import("../../pages/api/poptavka-ucebny"), "GET", "POST"],
  ["poptavka", () => import("../../pages/api/poptavka"), "GET", "POST"],
  ["portal-posts-create", () => import("../../pages/api/portal-posts-create"), "GET", "POST"],
  ["portal-posts-delete", () => import("../../pages/api/portal-posts-delete"), "GET", "POST"],
  ["portal-posts-update", () => import("../../pages/api/portal-posts-update"), "GET", "POST"],
  ["registrace-skoly", () => import("../../pages/api/registrace-skoly"), "GET", "POST"],
  ["registrace-spolku", () => import("../../pages/api/registrace-spolku"), "GET", "POST"],
  ["zadost-o-pristup", () => import("../../pages/api/zadost-o-pristup"), "GET", "POST"],
];

const retiredRoutes = [
  ["admin/approve-demo-request", () => import("../../pages/api/admin/approve-demo-request")],
  [
    "admin/create-organization-from-request",
    () => import("../../pages/api/admin/create-organization-from-request"),
  ],
  ["create-organization", () => import("../../pages/api/create-organization")],
  ["demo-approve-from-email", () => import("../../pages/api/demo-approve-from-email")],
  ["demo-request", () => import("../../pages/api/demo-request")],
  ["pridat-se-k-organizaci", () => import("../../pages/api/pridat-se-k-organizaci")],
  ["start-demo", () => import("../../pages/api/start-demo")],
];

describe("API route security contracts", () => {
  it.each(guardedRoutes)(
    "%s rejects unsupported methods and disables caching",
    async (_name, load, rejectedMethod, allowedMethods) => {
      const { default: handler } = await load();
      const { res } = await invoke(handler, { method: rejectedMethod });

      expect(res.statusCode).toBe(405);
      expect(res.getHeader("allow")).toBe(allowedMethods);
      expect(res.getHeader("cache-control")).toBe("no-store");
      expect(res.body).toMatchObject({ error: expect.any(String) });
    }
  );

  it.each(retiredRoutes)("%s remains unavailable and non-cacheable", async (_name, load) => {
    const { default: handler } = await load();
    const { res } = await invoke(handler, { method: "POST" });

    expect(res.statusCode).toBe(410);
    expect(res.getHeader("cache-control")).toBe("no-store");
  });

  it("keeps the retired marketplace contact endpoint inert and non-cacheable", async () => {
    const { default: handler } = await import("../../pages/api/contact-marketplace");
    const { res } = await invoke(handler, {
      method: "POST",
      body: { email: "attacker@example.com" },
    });

    expect(res.statusCode).toBe(200);
    expect(res.getHeader("cache-control")).toBe("no-store");
    expect(res.body).toEqual({ ok: false, message: "Dočasně deaktivováno" });
  });
});
