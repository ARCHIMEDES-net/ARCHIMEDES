// pages/api/admin/approve-demo-request.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { requestId } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: "Chybí requestId." });
    }

    // 1) načíst žádost
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("leads")
      .select("id, type, organization, contact_name, email, note, status")
      .eq("id", requestId)
      .maybeSingle();

    if (leadError) {
      return res.status(500).json({ error: leadError.message });
    }

    if (!lead) {
      return res.status(404).json({ error: "Žádost nebyla nalezena." });
    }

    const email = String(lead.email || "").trim().toLowerCase();
    const contactName = String(lead.contact_name || "").trim();
    const organization = String(lead.organization || "").trim();

    if (!email) {
      return res.status(400).json({ error: "Žádost nemá e-mail." });
    }

    // 2) najít demo organizaci
    const { data: demoOrg, error: demoOrgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("name", "ARCHIMEDES DEMO SKOLA")
      .maybeSingle();

    if (demoOrgError) {
      return res.status(500).json({ error: demoOrgError.message });
    }

    if (!demoOrg?.id) {
      return res.status(404).json({ error: "Demo organizace ARCHIMEDES DEMO SKOLA nebyla nalezena." });
    }

    // 3) najít existujícího uživatele podle emailu
    const { data: usersData, error: listUsersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listUsersError) {
      return res.status(500).json({ error: listUsersError.message });
    }

    let user = (usersData?.users || []).find(
      (u) => String(u.email || "").toLowerCase() === email
    );

    // 4) pokud neexistuje, pošli invite
    if (!user) {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${siteUrl}/login`,
        });

      if (inviteError) {
        return res.status(500).json({ error: inviteError.message });
      }

      user = inviteData?.user;
    }

    if (!user?.id) {
      return res.status(500).json({ error: "Nepodařilo se získat user_id." });
    }

    // 5) doplnit profil
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      [
        {
          id: user.id,
          full_name: contactName || null,
          user_type: "organization",
        },
      ],
      { onConflict: "id" }
    );

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    // 6) zkontrolovat existující membership
    const { data: existingMembership, error: membershipReadError } =
      await supabaseAdmin
        .from("organization_members")
        .select("id, organization_id, user_id, role_in_org, status")
        .eq("user_id", user.id)
        .maybeSingle();

    if (membershipReadError) {
      return res.status(500).json({ error: membershipReadError.message });
    }

    if (existingMembership?.id) {
      const { error: membershipUpdateError } = await supabaseAdmin
        .from("organization_members")
        .update({
          organization_id: demoOrg.id,
          role_in_org: "demo_viewer",
          status: "active",
        })
        .eq("id", existingMembership.id);

      if (membershipUpdateError) {
        return res.status(500).json({ error: membershipUpdateError.message });
      }
    } else {
      const { error: membershipInsertError } = await supabaseAdmin
        .from("organization_members")
        .insert([
          {
            organization_id: demoOrg.id,
            user_id: user.id,
            role_in_org: "demo_viewer",
            status: "active",
          },
        ]);

      if (membershipInsertError) {
        return res.status(500).json({ error: membershipInsertError.message });
      }
    }

    // 7) označit lead jako approved
    const approvalNote = [
      normServer(lead.note),
      "",
      `Demo schváleno: ${new Date().toISOString()}`,
      `Demo organizace: ${demoOrg.name}`,
      `Uživatel: ${email}`,
      organization ? `Žadatel uvedl organizaci: ${organization}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const { error: leadUpdateError } = await supabaseAdmin
      .from("leads")
      .update({
        status: "approved",
        note: approvalNote,
      })
      .eq("id", lead.id);

    if (leadUpdateError) {
      return res.status(500).json({ error: leadUpdateError.message });
    }

    return res.status(200).json({
      success: true,
      message: "Demo přístup byl schválen.",
      email,
      userId: user.id,
      organizationId: demoOrg.id,
    });
  } catch (e) {
    return res.status(500).json({
      error: e?.message || "Schválení demo přístupu se nepodařilo.",
    });
  }
}

function normServer(v) {
  return (v ?? "").toString().trim();
}
