import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/activeOrganizationContext", () => ({
  resolveActiveOrganizationContext: vi.fn(),
}));

vi.mock("../../lib/licenseMode", () => ({
  resolveLicenseMode: vi.fn(),
}));

import { resolveActiveOrganizationContext } from "../../lib/activeOrganizationContext";
import { resolveLicenseMode } from "../../lib/licenseMode";
import { resolveEventDetailLicenseContext } from "../../lib/eventDetailLicenseContext";

describe("event detail license context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses an inherited accessible organization for license resolution", async () => {
    const organization = {
      id: "school-krenov",
      name: "ZŠ Křenov",
      role_in_org: "organization_admin",
    };

    resolveActiveOrganizationContext.mockResolvedValue({
      organization,
      organizationId: organization.id,
      roleInOrg: "organization_admin",
      isOrganizationAdmin: true,
    });
    resolveLicenseMode.mockResolvedValue("active");

    await expect(
      resolveEventDetailLicenseContext({
        supabase: {},
        activeOrganizationId: organization.id,
      })
    ).resolves.toEqual({
      organizationId: organization.id,
      organization,
      licenseMode: "active",
    });

    expect(resolveLicenseMode).toHaveBeenCalledWith(
      {},
      organization.id,
      organization
    );
  });

  it("preserves the existing active fallback when no active organization is set", async () => {
    await expect(
      resolveEventDetailLicenseContext({
        supabase: {},
        activeOrganizationId: "",
      })
    ).resolves.toEqual({
      organizationId: "",
      organization: null,
      licenseMode: "active",
    });

    expect(resolveActiveOrganizationContext).not.toHaveBeenCalled();
    expect(resolveLicenseMode).not.toHaveBeenCalled();
  });

  it("does not grant a different organization when the active context is unavailable", async () => {
    resolveActiveOrganizationContext.mockResolvedValue(null);

    await expect(
      resolveEventDetailLicenseContext({
        supabase: {},
        activeOrganizationId: "foreign-school",
      })
    ).resolves.toEqual({
      organizationId: "foreign-school",
      organization: null,
      licenseMode: "active",
    });

    expect(resolveLicenseMode).not.toHaveBeenCalled();
  });
});
