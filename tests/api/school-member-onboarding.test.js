import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ rows: {}, writes: [], resolver: vi.fn(), send: vi.fn(), copy: vi.fn(), authorize: vi.fn(), cleanup: vi.fn() }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from(table) {
  let operation = "select", payload, filters = [];
  const run = () => {
    const rows = mock.rows[table] ||= [];
    const matches = () => rows.filter((row) => filters.every(([key,value]) => row[key] === value));
    if (operation === "insert" || operation === "upsert") {
      if (table === "school_member_invitation_attempts" && rows.some((row) => row.idempotency_key === payload.idempotency_key)) return {data:null,error:{code:"23505"}};
      const created = { id: payload.id || "new-id", ...payload };
      rows.push(created); mock.writes.push([table,operation,{...created}]); return {data:created,error:null};
    }
    if (operation === "update") {
      const found = matches(); found.forEach((row) => Object.assign(row,payload));
      mock.writes.push([table,operation,{...payload}]); return {data:found[0] || null,error:null};
    }
    if (operation === "delete") {
      const found = matches(); mock.rows[table] = rows.filter((row) => !found.includes(row));
      mock.writes.push([table,operation,filters]); return {data:null,error:null};
    }
    return {data:matches()[0] || null,error:null};
  };
  const query = {select(){return query;},eq(key,value){filters.push([key,value]);return query;},
    insert(value){operation="insert";payload=value;return query;},upsert(value){operation="upsert";payload=value;return query;},
    update(value){operation="update";payload=value;return query;},delete(){operation="delete";return query;},
    single(){return Promise.resolve(run());},maybeSingle(){return Promise.resolve(run());},then(resolve,reject){return Promise.resolve(run()).then(resolve,reject);}};
  return query;
} }) }));
vi.mock("../../lib/server/platformAdminApi", () => ({ requirePlatformAdmin: (...args) => mock.authorize(...args) }));
vi.mock("../../lib/server/authenticatedRateLimit", () => ({ consumeAuthenticatedRateLimit: async () => true }));
vi.mock("../../lib/server/siteUrl", () => ({ getServerSiteUrl: () => "https://example.test" }));
vi.mock("../../lib/server/registrationEmailProvider", () => ({ registrationEmailWasDefinitelyNotSent: (e) => e.code === "DEFINITELY_NOT_SENT" }));
vi.mock("../../lib/server/customerOnboarding", () => ({
  CustomerOnboardingError: class extends Error { constructor(message,status,code){super(message);this.status=status;this.code=code;} },
  resolveLocalAdministrator: (...args) => mock.resolver(...args), sendCustomerOnboardingEmail: (...args) => mock.send(...args),
  sendCustomerOnboardingAuditCopy: (...args) => mock.copy(...args), cleanupNewAuthUser: (...args) => mock.cleanup(...args),
  updateAuthPreparationStatus: async () => true, validateCustomerOnboardingEmailConfiguration: () => {},
}));
import handler from "../../pages/api/admin/invite-school-member";
const SCHOOL = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PARENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KEY = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const USER = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
async function call(body = {}) {
  const res = { code:200, body:null, setHeader(){}, status(code){this.code=code;return this;},json(value){this.body=value;return this;} };
  await handler({method:"POST",headers:{},body:{organizationId:SCHOOL,idempotencyKey:KEY,fullName:"Jana Nová",email:"jana@example.test",role:"organization_admin",...body}},res);
  return res;
}
beforeEach(() => {
  mock.writes=[];
  mock.rows={ organizations:[
    {id:SCHOOL,name:"Test School",org_type:"school",status:"active",parent_organization_id:PARENT,registration_number:"1234-SK-01",license_plan:null},
    {id:PARENT,name:"Test Municipality",org_type:"municipality",status:"active",license_status:"active",license_plan:"classroom_free_12m",license_valid_until:"2099-09-08"},
  ],profiles:[{id:USER,email:"jana@example.test",full_name:"Original Name",is_active:true,active_organization_id:"other-school",must_set_password:false}] };
  mock.resolver.mockReset().mockResolvedValue({userId:USER,fullName:"Original Name",isNewAccount:false,cleanupEligible:false,setupUrl:null});
  mock.authorize.mockReset().mockResolvedValue({id:"admin-id"});
  mock.send.mockReset().mockResolvedValue({provider:"resend",messageId:"mail-1"});
  mock.copy.mockReset().mockResolvedValue({provider:"resend",messageId:"copy-1"});
  mock.cleanup.mockReset().mockResolvedValue(true);
});
describe("child school member onboarding", () => {
  it("attaches an existing account directly without changing its profile, password or other school", async () => {
    const profile = {...mock.rows.profiles[0]};
    const res=await call(); expect(res.code).toBe(200);
    expect(mock.rows.profiles[0]).toEqual(profile);
    expect(mock.rows.organization_members[0]).toMatchObject({organization_id:SCHOOL,user_id:USER,role_in_org:"organization_admin",status:"active"});
    expect(mock.send).toHaveBeenCalledWith(expect.objectContaining({setupUrl:null,memberRole:"organization_admin"}));
    expect(mock.rows.school_member_invitation_attempts[0].status).toBe("sent");
  });
  it("creates a new teacher profile and membership before sending, with teacher role in the message", async () => {
    mock.rows.profiles=[];
    mock.resolver.mockResolvedValue({userId:USER,fullName:"Jana Nová",isNewAccount:true,cleanupEligible:true,setupUrl:"https://example.test/setup"});
    mock.send.mockImplementation(async () => {
      expect(mock.rows.profiles[0].must_set_password).toBe(true);
      expect(mock.rows.organization_members[0].role_in_org).toBe("member");
      return {provider:"resend",messageId:"mail-1"};
    });
    expect((await call({role:"member"})).code).toBe(200);
    expect(mock.send).toHaveBeenCalledWith(expect.objectContaining({memberRole:"member"}));
  });
  it("replays a completed request without duplicating membership or email", async () => {
    await call(); expect((await call()).body.replayed).toBe(true);
    expect(mock.rows.organization_members).toHaveLength(1); expect(mock.send).toHaveBeenCalledTimes(1);
  });
  it("rejects changing a role under a used idempotency key", async () => {
    await call(); expect((await call({role:"member"})).code).toBe(409); expect(mock.send).toHaveBeenCalledTimes(1);
  });
  it("does not replace existing membership", async () => {
    mock.rows.organization_members=[{id:"existing",organization_id:SCHOOL,user_id:USER,role_in_org:"member",status:"active"}];
    expect((await call()).code).toBe(409);expect(mock.rows.organization_members[0].role_in_org).toBe("member");expect(mock.send).not.toHaveBeenCalled();
  });
  it("preserves access and blocks repeat sending after uncertain delivery", async () => {
    mock.send.mockRejectedValue(new Error("timeout"));
    expect((await call()).code).toBe(502);
    expect(mock.rows.school_member_invitation_attempts[0].status).toBe("delivery_unknown");
    expect((await call()).code).toBe(409);expect(mock.send).toHaveBeenCalledTimes(1);
    expect(mock.rows.organization_members).toHaveLength(1);expect(mock.cleanup).not.toHaveBeenCalled();
  });
  it("rolls back only the new membership on definite rejection, keeping the existing profile", async () => {
    mock.send.mockRejectedValue(Object.assign(new Error("rejected"),{code:"DEFINITELY_NOT_SENT"}));
    expect((await call()).code).toBe(502); expect(mock.rows.organization_members).toHaveLength(0);
    expect(mock.rows.profiles).toHaveLength(1);expect(mock.cleanup).not.toHaveBeenCalled();
    expect(mock.rows.school_member_invitation_attempts[0]).toMatchObject({status:"rolled_back",membership_id:null,user_id:null,prepared_user_id:USER});
  });
  it("rejects an expired parent licence before preparing an account", async () => {
    mock.rows.organizations[1].license_valid_until="2000-01-01";
    expect((await call()).code).toBe(409);expect(mock.resolver).not.toHaveBeenCalled();expect(mock.send).not.toHaveBeenCalled();
  });
  it("requires platform administrator authorization before all data access", async () => {
    mock.authorize.mockImplementation(async (_req,res) => {res.status(403).json({error:"denied"});return null;});
    expect((await call()).code).toBe(403);expect(mock.writes).toHaveLength(0);expect(mock.resolver).not.toHaveBeenCalled();
  });
});
