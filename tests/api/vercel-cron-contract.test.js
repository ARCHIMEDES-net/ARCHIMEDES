import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("notification cron", () => {
  it("runs the idempotent reminder planner every ten minutes", () => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));
    expect(config.crons).toContainEqual({
      path: "/api/cron/send-reminders",
      schedule: "*/10 * * * *",
    });
  });

  it("runs profile completion reminders on working days only", () => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));
    expect(config.crons).toContainEqual({
      path: "/api/cron/profile-completion-reminders",
      schedule: "0 7 * * 1-5",
    });
  });
});
