import { describe, expect, it, vi } from "vitest";
import { parseSchoolInvitationBatch, sendSchoolInvitationBatch } from "../../lib/schoolInvitationBatch";

describe("school invitation batches", () => {
  it("accepts 23 Excel rows and preserves Czech names", () => {
    const rows = parseSchoolInvitationBatch(Array.from({length: 23}, (_, i) => `Jana Nová\tUCITEL${i}@example.test`).join("\r\n"));
    expect(rows).toHaveLength(23);
    expect(rows[0]).toEqual({fullName: "Jana Nová", email: "ucitel0@example.test"});
  });
  it("rejects duplicate addresses irrespective of case, before sending", () => {
    expect(() => parseSchoolInvitationBatch("Jana Nová;JANA@example.test\nJana Nová;jana@example.test")).toThrow("vícekrát");
  });
  it.each(["Jana Nová;broken", "Jana Nová;jana@example.test;extra", "", "jana@example.test"])("rejects invalid input %s", (input) => {
    expect(() => parseSchoolInvitationBatch(input)).toThrow();
  });
  it("stops on uncertain delivery without sending later rows or retrying", async () => {
    const send = vi.fn().mockResolvedValueOnce({ok:true,invitationSent:true}).mockRejectedValueOnce(new Error("timeout"));
    const result = vi.fn();
    const rows = ["one","two","three"].map((email) => ({email,status:"ready"}));
    expect(await sendSchoolInvitationBatch(rows,send,result)).toBe(false);
    expect(send).toHaveBeenCalledTimes(2);
    expect(result).toHaveBeenLastCalledWith("two","review","timeout");
  });
  it("skips existing members and already sent rows", async () => {
    const send = vi.fn().mockResolvedValue({ok:true,invitationSent:true});
    const rows = [{email:"existing",status:"skip"},{email:"sent",status:"sent"},{email:"new",status:"ready"}];
    expect(await sendSchoolInvitationBatch(rows,send,vi.fn())).toBe(true);
    expect(send).toHaveBeenCalledExactlyOnceWith(rows[2]);
  });
});
