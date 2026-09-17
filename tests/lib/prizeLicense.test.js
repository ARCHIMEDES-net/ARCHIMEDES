import { describe,it,expect } from "vitest";
import { prizeEndDate,activePrize } from "../../lib/prizeLicense";
describe("prize dates",()=>{
 it("uses inclusive calendar year dates including leap days",()=>{
  expect(prizeEndDate("2026-09-17")).toBe("2027-09-16");
  expect(prizeEndDate("2024-02-29")).toBe("2025-02-27");
  expect(prizeEndDate("2026-02-30")).toBe("");
 });
 it("respects both ends of prize validity",()=>{
  const org={license_plan:"competition_prize_12m",status:"active",license_status:"active",license_started_at:"2026-09-17T00:00:00Z",license_valid_until:"2027-09-16T23:59:59Z"};
  expect(activePrize(org,new Date("2026-09-16"))).toBe(false);
  expect(activePrize(org,new Date("2026-09-18"))).toBe(true);
  expect(activePrize(org,new Date("2027-09-18"))).toBe(false);
 });
});
