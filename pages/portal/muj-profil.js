import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import PortalHeader from "../../components/PortalHeader";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

const DEFAULT_INTERESTS = ["prvni-stupen", "druhy-stupen"];

const INTEREST_SECTIONS = [
  {
    title: "🎓 Pro školu",
    items: [
      { slug: "prvni-stupen", label: "1. stupeň" },
      { slug: "druhy-stupen", label: "2. stupeň" },
      { slug: "ucitele", label: "Učitelé" },
      { slug: "karierni-poradenstvi", label: "Kariérní poradenství" },
    ],
  },
  {
    title: "🌍 Témata",
    items: [
      { slug: "wellbeing", label: "Wellbeing" },
      { slug: "veda-a-objevy", label: "Věda a objevy" },
      { slug: "svet-v-souvislostech", label: "Svět v souvislostech" },
      { slug: "english-live", label: "Vysílání v angličtině" },
    ],
  },
  {
    title: "🏙️ Kluby a programy",
    items: [
      { slug: "smart-city", label: "Smart City klub" },
      { slug: "ctenarsky-klub", label: "Čtenářský klub" },
      { slug: "filmovy-klub", label: "Filmový klub" },
    ],
  },
  {
    title: "👥 Pro komunitu",
    items: [
      { slug: "rodice", label: "Rodiče" },
      { slug: "seniori", label: "Senioři" },
      { slug: "komunita", label: "Komunita" },
      { slug: "zajmove-skupiny", label: "Zájmové skupiny (hasiči, spolky, kluby)" },
    ],
  },
];

const VISIBLE_INTEREST_SLUGS = new Set(
  INTEREST_SECTIONS.flatMap((section) => section.items.map((item) => item.slug))
);

function roleLabel(roleInOrg) {
  switch (roleInOrg) {
    case "organization_admin":
      return "Administrátor organizace";
    case "member":
      return "Člen organizace";
    case "demo_viewer":
      return "Demo přístup";
    default:
      return "Uživatel";
  }
}

export default function MujProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [userId, setUserId] = useState("");
  const [roleText, setRoleText] = useState("Uživatel");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationCode, setOrganizationCode] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [hiddenLegacyInterests, setHiddenLegacyInterests] = useState([]);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  const selectedCount = useMemo(() => selectedInterests.length, [selectedInterests]);

  function toggleInterest(slug) {
    setSelectedInterests((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  }

  async function loadProfile() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      setUserId(user.id);
      setEmail(user.email || "");
      setFullName(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          ""
      );

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, active_organization_id, email_notifications_enabled")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setEmailNotificationsEnabled(profile?.email_notifications_enabled !== false);

      if (profile?.active_organization_id) {
        const [{ data: membership, error: membershipError }, { data: organization, error: organizationError }] =
          await Promise.all([
            supabase
              .from("organization_members")
              .select("role_in_org, status")
              .eq("user_id", user.id)
              .eq("organization_id", profile.active_organization_id)
              .eq("status", "active")
              .maybeSingle(),
            supabase
              .from("organizations")
              .select("name, join_code")
              .eq("id", profile.active_organization_id)
              .maybeSingle(),
          ]);

        if (membershipError) throw membershipError;
        if (organizationError) throw organizationError;

        setRoleText(roleLabel(membership?.role_in_org));
        setOrganizationName(organization?.name || "");
        setOrganizationCode(organization?.join_code || "");
      } else {
        setRoleText("Uživatel");
        setOrganizationName("");
        setOrganizationCode("");
      }

      const { data: interests, error: interestsError } = await supabase
        .from("user_interests")
        .select("interest_slug")
        .eq("user_id", user.id);

      if (interestsError) throw interestsError;

      const loadedInterests = (interests || [])
        .map((item) => item.interest_slug)
        .filter(Boolean);

      const visibleInterests = loadedInterests.filter((slug) => VISIBLE_INTEREST_SLUGS.has(slug));
      const hiddenInterests = loadedInterests.filter((slug) => !VISIBLE_INTEREST_SLUGS.has(slug));

      setHiddenLegacyInterests(hiddenInterests);

      if (visibleInterests.length > 0) {
        setSelectedInterests(visibleInterests);
      } else if (loadedInterests.length > 0) {
        setSelectedInterests(DEFAULT_INTERESTS);
      } else {
        setSelectedInterests(DEFAULT_INTERESTS);
      }
    } catch (err) {
      console.error("muj-profil loadProfile error:", err);
      setError(err.message || "Nepodařilo se načíst profil.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!userId) {
        throw new Error("Chybí identita uživatele.");
      }

      let visibleToSave = [...selectedInterests];

      if (visibleToSave.length === 0) {
        visibleToSave = [...DEFAULT_INTERESTS];
        setSelectedInterests(visibleToSave);
      }

      const finalInterestSlugs = [...new Set([...visibleToSave, ...hiddenLegacyInterests])];

      const trimmedName = fullName.trim();

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          name: trimmedName,
        },
      });

      if (authUpdateError) throw authUpdateError;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          email_notifications_enabled: emailNotificationsEnabled,
        })
        .eq("id", userId);

      if (profileUpdateError) throw profileUpdateError;

      const { error: deleteError } = await supabase
        .from("user_interests")
        .delete()
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      const rows = finalInterestSlugs.map((slug) => ({
        user_id: userId,
        interest_slug: slug,
      }));

      const { error: insertError } = await supabase.from("user_interests").insert(rows);

      if (insertError) throw insertError;

      setSuccess("Profil byl uložen.");
    } catch (err) {
      console.error("muj-profil handleSave error:", err);
      setError(err.message || "Profil se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <RequireAuth>
      <Head>
        <title>Můj profil | ARCHIMEDES Live</title>
      </Head>

      <PortalHeader />

      <main className="pageWrap">
        <div className="pageInner">
          <section className="card">
            <div className="header">
              <div>
                <p className="eyebrow">Můj profil</p>
                <h1>Zajímá mě</h1>
                <p className="lead">
                  Vyberte, o jaká vysílání máte zájem. Budeme vám posílat jen to,
                  co si zvolíte. Pokud nic nevyberete, nastaví se základní program
                  pro 1. a 2. stupeň.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="infoBox">Načítám profil…</div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="field">
                  <label className="label">Jméno</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                    placeholder="Vaše jméno"
                  />
                </div>

                <div className="field">
                  <label className="label">E-mail</label>
                  <div className="readonlyBox">{email || "—"}</div>
                </div>

                <div className="field">
                  <label className="label">Role</label>
                  <div className="readonlyBox">{roleText}</div>
                </div>

                <div className="field">
                  <label className="label">Organizace</label>
                  <div className="readonlyBox">{organizationName || "—"}</div>
                </div>

                <div className="field">
                  <label className="label">Kód organizace</label>
                  <div className="readonlyBox">{organizationCode || "—"}</div>
                </div>

                <div className="field">
                  <div className="toggleRow">
                    <div>
                      <label className="label">E-mailové pozvánky</label>
                      <p className="helper">
                        Zapněte si pozvánky na vysílání podle vybraných zájmů.
                      </p>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={emailNotificationsEnabled}
                        onChange={(e) => setEmailNotificationsEnabled(e.target.checked)}
                      />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                <div className="field">
                  <label className="label">Zajímá mě</label>
                  <p className="helper">
                    Vyberte oblasti, o kterých chcete dostávat informace e-mailem.
                  </p>

                  {selectedCount === 0 ? (
                    <div className="warningBox">
                      Nevybrali jste žádné zájmy. Po uložení nastavíme automaticky
                      1. stupeň a 2. stupeň.
                    </div>
                  ) : null}

                  {hiddenLegacyInterests.length > 0 ? (
                    <div className="infoBox">
                      V profilu máte i dříve uložené starší zájmy, které zůstávají zachované.
                    </div>
                  ) : null}

                  <div className="interestSections">
                    {INTEREST_SECTIONS.map((section) => (
                      <div key={section.title} className="interestGroup">
                        <h3>{section.title}</h3>
                        <div className="chips">
                          {section.items.map((item) => {
                            const active = selectedInterests.includes(item.slug);
                            return (
                              <button
                                key={item.slug}
                                type="button"
                                className={`chip ${active ? "active" : ""}`}
                                onClick={() => toggleInterest(item.slug)}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error ? <div className="errorBox">{error}</div> : null}
                {success ? <div className="successBox">{success}</div> : null}

                <div className="actions">
                  <button type="submit" className="primaryBtn" disabled={saving}>
                    {saving ? "Ukládám…" : "Uložit profil"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>

      <style jsx>{`
        .pageWrap {
          min-height: 100vh;
          background: #f3f5f8;
        }

        .pageInner {
          max-width: 980px;
          margin: 0 auto;
          padding: 32px 20px 56px;
        }

        .card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
          padding: 28px;
        }

        .header {
          margin-bottom: 20px;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
        }

        h1 {
          margin: 0 0 10px;
          font-size: 34px;
          line-height: 1.1;
          color: #0f172a;
        }

        .lead {
          margin: 0;
          max-width: 760px;
          color: #475569;
          line-height: 1.6;
          font-size: 16px;
        }

        .field {
          margin-top: 26px;
        }

        .label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .helper {
          margin: 0 0 12px;
          color: #64748b;
          line-height: 1.5;
          font-size: 14px;
        }

        .input {
          width: 100%;
          min-height: 52px;
          padding: 0 16px;
          border-radius: 16px;
          border: 1px solid #d1d5db;
          font-size: 16px;
          background: #fff;
          color: #0f172a;
          box-sizing: border-box;
        }

        .readonlyBox {
          min-height: 52px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border: 1px solid #d1d5db;
          border-radius: 16px;
          background: #f8fafc;
          color: #334155;
          font-size: 16px;
        }

        .toggleRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: #f8fafc;
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 58px;
          height: 34px;
          flex: 0 0 auto;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: #cbd5e1;
          transition: 0.2s;
          border-radius: 999px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 26px;
          width: 26px;
          left: 4px;
          top: 4px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
        }

        .switch input:checked + .slider {
          background-color: #0f172a;
        }

        .switch input:checked + .slider:before {
          transform: translateX(24px);
        }

        .interestSections {
          display: grid;
          gap: 22px;
        }

        .interestGroup h3 {
          margin: 0 0 12px;
          font-size: 18px;
          color: #0f172a;
        }

        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .chip {
          appearance: none;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #0f172a;
          padding: 11px 16px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .chip:hover {
          border-color: #94a3b8;
          transform: translateY(-1px);
        }

        .chip.active {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }

        .warningBox,
        .errorBox,
        .successBox,
        .infoBox {
          margin-top: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          line-height: 1.5;
          font-weight: 600;
        }

        .warningBox {
          background: #fff7ed;
          border: 1px solid #fdba74;
          color: #9a3412;
        }

        .errorBox {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }

        .successBox {
          background: #ecfdf5;
          border: 1px solid #86efac;
          color: #166534;
        }

        .infoBox {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
        }

        .actions {
          margin-top: 28px;
        }

        .primaryBtn {
          appearance: none;
          border: none;
          border-radius: 16px;
          background: #0f172a;
          color: #fff;
          padding: 14px 20px;
          min-height: 52px;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.18s ease;
        }

        .primaryBtn:hover {
          opacity: 0.94;
        }

        .primaryBtn:disabled {
          opacity: 0.6;
          cursor: default;
        }

        @media (max-width: 760px) {
          .pageInner {
            padding: 20px 14px 40px;
          }

          .card {
            padding: 20px;
            border-radius: 22px;
          }

          h1 {
            font-size: 28px;
          }

          .toggleRow {
            align-items: flex-start;
          }
        }
      `}</style>
    </RequireAuth>
  );
}
