import { describe, expect, it } from "vitest";
import { getServerSiteUrl } from "../../lib/server/siteUrl";

describe("server application origin", () => {
  it("uses the explicit public site URL in production", () => {
    expect(
      getServerSiteUrl({
        VERCEL_ENV: "production",
        NEXT_PUBLIC_SITE_URL: "https://www.archimedeslive.com/ignored?x=1#part",
      })
    ).toBe("https://www.archimedeslive.com");
  });

  it("prefers the stable Preview branch URL over an inherited production URL", () => {
    expect(
      getServerSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_BRANCH_URL: "app-git-safe-branch-team.vercel.app",
        VERCEL_URL: "app-random-team.vercel.app",
        NEXT_PUBLIC_SITE_URL: "https://www.archimedeslive.com",
      })
    ).toBe("https://app-git-safe-branch-team.vercel.app");
  });

  it("falls back to the deployment URL when Preview has no branch URL", () => {
    expect(
      getServerSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "app-random-team.vercel.app",
        NEXT_PUBLIC_SITE_URL: "https://www.archimedeslive.com",
      })
    ).toBe("https://app-random-team.vercel.app");
  });

  it("uses localhost for local development", () => {
    expect(getServerSiteUrl({ NODE_ENV: "development" })).toBe(
      "http://localhost:3000"
    );
  });

  it.each([
    {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "javascript:alert(1)",
    },
    {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://user:secret@example.test",
    },
    {
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
    {
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "safe.vercel.app/attacker",
      VERCEL_URL: "fallback.vercel.app",
    },
  ])("rejects an invalid or dangerous origin: %o", (environment) => {
    expect(() => getServerSiteUrl(environment)).toThrow();
  });
});
