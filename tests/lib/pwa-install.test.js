import { describe, expect, it } from "vitest";
import { detectInstallPlatform } from "../../lib/pwaInstall";

describe("PWA installation platform detection", () => {
  it("recognizes Safari on iPhone", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
      })
    ).toBe("ios-safari");
  });

  it("redirects Chrome on iPhone to the Safari instructions", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0 Mobile/15E148 Safari/604.1",
        platform: "iPhone",
      })
    ).toBe("ios-other");
  });

  it("redirects an in-app browser on iPhone to the Safari instructions", () => {
    expect(
      detectInstallPlatform({
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 346.0.0",
        platform: "iPhone",
      })
    ).toBe("ios-other");
  });

  it("recognizes iPad in desktop mode", () => {
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15",
        platform: "MacIntel",
        maxTouchPoints: 5,
      })
    ).toBe("ios-safari");
  });

  it("recognizes Android", () => {
    expect(
      detectInstallPlatform({
        userAgent: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36",
        platform: "Linux armv8l",
      })
    ).toBe("android");
  });
});
