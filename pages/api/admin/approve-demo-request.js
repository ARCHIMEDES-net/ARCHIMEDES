// pages/api/admin/approve-demo-request.js
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function normServer(v) {
  return (v ?? "").toString().trim();
}

async function findAuthUserByEmail(email) {
  const target = String(email || "").trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(error.message || "Nepodařilo se načíst uživatele.");
    }

    const users = data?.users || [];
    const found = users.find(
      (u) => String(u.email || "").trim().toLowerCase() === target
    );

    if (found) return found;
    if (users.length < perPage) return null;

    page += 1;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { requestId } = req.body || {};

    if (!requestId) {
      return res.status(400).json({ error: "Chybí requestId." });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.archimedeslive.com";

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
      return res.status(404).json({
        error: "Demo organizace ARCHIMEDES DEMO SKOLA nebyla nalezena.",
      });
    }

    // 3) najít existujícího auth uživatele podle emailu
    let user = await findAuthUserByEmail(email);

    // 4) pokud neexistuje, vytvořit usera bez hesla
    if (!user) {
      const { data: createData, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: contactName || "",
          },
        });

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      user = createData?.user;
    }

    if (!user?.id) {
      return res.status(500).json({ error: "Nepodařilo se získat user_id." });
    }

    // 5) doplnit profil
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: user.id,
        email,
        full_name: contactName || null,
        user_type: "organization",
      },
      { onConflict: "id" }
    );

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    // 6) zkontrolovat všechna existující membership tohoto usera
    const { data: memberships, error: membershipReadError } = await supabaseAdmin
      .from("organization_members")
      .select("id, organization_id, user_id, role_in_org, status")
      .eq("user_id", user.id);

    if (membershipReadError) {
      return res.status(500).json({ error: membershipReadError.message });
    }

    const existingDemoMembership = (memberships || []).find(
      (m) => m.organization_id === demoOrg.id
    );

    if (existingDemoMembership?.id) {
      const { error: membershipUpdateError } = await supabaseAdmin
        .from("organization_members")
        .update({
          role_in_org: "demo_viewer",
          status: "active",
        })
        .eq("id", existingDemoMembership.id);

      if (membershipUpdateError) {
        return res.status(500).json({ error: membershipUpdateError.message });
      }
    } else {
      const { error: membershipInsertError } = await supabaseAdmin
        .from("organization_members")
        .insert({
          organization_id: demoOrg.id,
          user_id: user.id,
          role_in_org: "demo_viewer",
          status: "active",
        });

      if (membershipInsertError) {
        return res.status(500).json({ error: membershipInsertError.message });
      }
    }

    // 7) poslat email pro nastavení hesla
    const { error: resetError } =
      await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/nastavit-heslo`,
      });

    if (resetError) {
      return res.status(500).json({ error: resetError.message });
    }

    // 8) označit lead jako approved
    const approvalNote = [
      normServer(lead.note),
      "",
      `Demo schváleno: ${new Date().toISOString()}`,
      `Demo organizace: ${demoOrg.name}`,
      `Uživatel: ${email}`,
      `Odeslán odkaz pro nastavení hesla: ${siteUrl}/nastavit-heslo`,
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
      message:
        "Demo přístup byl schválen a byl odeslán e-mail pro nastavení hesla.",
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
