import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
const state = vi.hoisted(() => ({ client: null }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => state.client }));
import handler from "../../pages/api/admin/organization-directory";

function response() { return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), setHeader: vi.fn() }; }
function setup(admin = true) {
  const mocked = createSupabaseMock({ user: { id: "admin", email: "admin@example.com" }, tableResults: {
    platform_admins: { data: admin ? { user_id: "admin", role: "super_admin" } : null },
    profiles: { data: { id: "admin", email: "admin@example.com", is_active: true } },
  } });
  const original = mocked.supabase.from;
  const readPage = vi.fn(async (start) => ({ data: start === 0 ? Array.from({length:500},(_,i)=>({id:String(i),name:`Obec ${i}`,org_type:"municipality"})) : [{id:"school",name:"Škola",parent_organization_id:"0",org_type:"school"}], error:null }));
  mocked.supabase.from = vi.fn(table => table === "organizations" ? {select:()=>({order:()=>({range:readPage})})} : original(table));
  state.client = mocked.supabase;
  return { ...mocked,readPage };
}
describe("administrative organization directory", () => {
  beforeEach(()=>setup());
  it("rejects missing credentials before reading any organizations",async()=>{
    const res=response(); await handler({method:"GET",headers:{}},res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(state.client.from).not.toHaveBeenCalledWith("organizations");
  });
  it("does not expose the directory to a teacher",async()=>{
    setup(false); const res=response(); await handler({method:"GET",headers:{authorization:"Bearer token"}},res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(state.client.from).not.toHaveBeenCalledWith("organizations");
  });
  it("returns organizations beyond the first page without requiring membership",async()=>{
    const {readPage}=setup(); const res=response(); await handler({method:"GET",headers:{authorization:"Bearer token"}},res);
    expect(res.status).toHaveBeenCalledWith(200);
    const rows=res.json.mock.calls[0][0].organizations;
    expect(rows).toHaveLength(501);
    expect(rows[500].parent_name).toBe("Obec 0");
    expect(readPage).toHaveBeenNthCalledWith(2,500,999);
    expect(state.client.from).not.toHaveBeenCalledWith("organization_members");
  });
  it("does not accept mutations",async()=>{
    const res=response(); await handler({method:"POST",headers:{}},res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
