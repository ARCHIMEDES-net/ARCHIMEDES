import { describe, expect, it } from "vitest";
import { filterOrganizations, organizationAdminHref, communityLinks, administrationGroups } from "../../lib/portalNavigation";
describe("role-aware navigation",()=>{
  it("routes child schools to onboarding and other organizations to their own card",()=>{
    expect(organizationAdminHref({id:"a",org_type:"school",parent_organization_id:"b"})).toBe("/portal/admin/skoly/a/onboarding");
    expect(organizationAdminHref({id:"b",org_type:"school"})).toBe("/portal/admin/obce/b");
    expect(organizationAdminHref({id:"c",org_type:"child_home",parent_organization_id:"b"})).toBe("/portal/admin/obce/c");
  });
  it("searches Czech names and parent municipalities without diacritics",()=>{
    const rows=[{id:"a",name:"ZŠ",parent_name:"Žabčice",org_type:"school"},{id:"b",name:"Žabčice",org_type:"obec",is_system:true}];
    expect(filterOrganizations(rows,"zabcice").map(x=>x.id)).toEqual(["a"]);
    expect(filterOrganizations(rows,"zabcice","municipality",true).map(x=>x.id)).toEqual(["b"]);
  });
  it("preserves secondary content and administrative destinations",()=>{
    expect(communityLinks.map(x=>x[1])).toContain("/portal/kridla");
    const destinations=administrationGroups.flatMap(g=>g.links.map(x=>x[1]));
    for(const href of ["/portal/admin/onboarding","/portal/admin-start","/portal/admin/upominky-profilu","/portal/admin-skoly","/portal/admin-inzerce","/portal/admin-poptavky","/portal/email-skupiny"]) expect(destinations).toContain(href);
  });
});
