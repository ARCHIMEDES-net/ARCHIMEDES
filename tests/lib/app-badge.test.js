import { afterEach, describe, expect, it, vi } from "vitest";
import {
  appBadgePermissionState,
  normalizeBadgeCount,
  requestAppBadgePermission,
} from "../../lib/appBadge";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("app badge", () => {
  it("uses only a bounded unread notification count", () => {
    expect(normalizeBadgeCount(-1)).toBe(0);
    expect(normalizeBadgeCount("2")).toBe(2);
    expect(normalizeBadgeCount(2.9)).toBe(2);
    expect(normalizeBadgeCount(150)).toBe(99);
    expect(normalizeBadgeCount("invalid")).toBe(0);
  });

  it("requests iOS notification permission only after an explicit action", async () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("navigator", { setAppBadge: vi.fn() });
    vi.stubGlobal("window", {
      Notification: { permission: "default", requestPermission },
    });

    expect(appBadgePermissionState()).toBe("default");
    await expect(requestAppBadgePermission()).resolves.toBe("granted");
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it("does not ask again after permission was denied", async () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("navigator", { setAppBadge: vi.fn() });
    vi.stubGlobal("window", {
      Notification: { permission: "denied", requestPermission },
    });

    await expect(requestAppBadgePermission()).resolves.toBe("denied");
    expect(requestPermission).not.toHaveBeenCalled();
  });
});
