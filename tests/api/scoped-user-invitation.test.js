import { describe, expect, it, vi } from "vitest";
import { createSupabaseMock } from "../helpers/supabase";
const state = vi.hoisted(()=>({client:{}}));
vi.mock("@supabase/supabase-js",()=>({createClient:()=>state.client}));
import handler from "../../pages/api/invite-user";
const orgId="00000000-0000-4000-8000-000000000009";
function response(){return {setHeader:vi.fn(),status:vi.fn().mockReturnThis(),json:vi.fn().mockReturnThis()};}
function setup(admin, active=true){
  const mocked=createSupabaseMock({user:{id:"admin",email:"admin@example.com"},tableResults:{
    platform_admins:{data:admin?{user_id:"admin",role:"super_admin"}:null},
    profiles:{data:{id:"admin",email:"admin@example.com",is_active:active}},
    organizations:{data:{name:"Škola",org_type:"school",status:"inactive"}},
  }});
  Object.assign(state.client,mocked.supabase);return mocked;
}
function request(){return {method:"POST",headers:{authorization:"Bearer token"},body:{email:"teacher@example.com",fullName:"Jana Novakova",organizationId:orgId}};}
describe("explicit organization invitation authorization",()=>{
  it("rejects a school administrator targeting another organization",async()=>{
    const {queries}=setup(false);const res=response();await handler(request(),res);
    expect(res.status).toHaveBeenCalledWith(403);expect(queries.some(q=>q.table==="organizations")).toBe(false);
  });
  it("rejects an inactive platform administrator",async()=>{
    const {queries}=setup(true,false);const res=response();await handler(request(),res);
    expect(res.status).toHaveBeenCalledWith(403);expect(queries.some(q=>q.table==="organizations")).toBe(false);
  });
  it("uses the requested organization and preserves the inactive-organization block",async()=>{
    const {queries}=setup(true);const res=response();await handler(request(),res);
    expect(queries.find(q=>q.table==="organizations").filters.id).toBe(orgId);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(state.client.auth.admin.generateLink).not.toHaveBeenCalled();
    expect(queries.every(q=>!q.mutation)).toBe(true);
  });
});
