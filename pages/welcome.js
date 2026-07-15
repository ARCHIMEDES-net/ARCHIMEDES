import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import RequireAuth from "../components/RequireAuth";
import PortalHeader from "../components/PortalHeader";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";

async function resolveWelcomeState() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    return { target: "/login", shouldRedirect: true };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_type, active_organization_id, must_set_password")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.must_set_password) {
    return { target: "/nastavit-heslo", shouldRedirect: true };
  }

  if (profile?.active_organization_id) {
    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("organization_id, status")
      .eq("user_id", user.id)
      .eq("organization_id", profile.active_organization_id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (membership?.organization_id) {
      return { target: "/portal", shouldRedirect: true };
    }
  }

  const { data: fallbackMembership, error: fallbackMembershipError } =
    await supabase
      .from("organization_members")
      .select("organization_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

  if (fallbackMembershipError) throw fallbackMembershipError;

  if (fallbackMembership?.organization_id) {
    if (profile?.active_organization_id !== fallbackMembership.organization_id) {
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          active_organization_id: fallbackMembership.organization_id,
        })
        .eq("id", user.id);

      if (updateProfileError) throw updateProfileError;
    }

    return { target: "/portal", shouldRedirect: true };
  }

  if (profile?.user_type === "individual") {
    return { target: "/portal", shouldRedirect: true };
  }

  return { target: "", shouldRedirect: false, user };
}

export default function WelcomePage() {
  const router = useRouter();

  const [savingIndividual, setSavingIndividual] = useState(false);
  const [error, setError] = useState("");
  const [checkingAccess, setCheckingAccess] = useState(true);

  const handledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      try {
        const result = await resolveWelcomeState();

        if (cancelled) return;

        if (result?.shouldRedirect && result?.target) {
          router.replace(result.target);
          return;
        }

        setCheckingAccess(false);
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Nepodařilo se ověřit přístup.");
          setCheckingAccess(false);
        }
      }
    }

    if (!handledRef.current) {
      handledRef.current = true;
      checkAccess();
    }

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function continueAsIndividual() {
    setSavingIndividual(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Uživatel není přihlášen.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ user_type: "individual" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push("/portal");
    } catch (e) {
      setError(e?.message || "Nepodařilo se pokračovat jako jednotlivec.");
    } finally {
      setSavingIndividual(false);
    }
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-slate-50">
        <PortalHeader />

        <main className="mx-auto max-w-[1040px] px-4 pb-14 pt-10">
          {checkingAccess ? (
            <Card className="p-7">
              <h1 className="mb-2.5 text-[30px] font-[950] leading-[1.15] text-navy-900">
                Ověřujeme váš přístup
              </h1>
              <p className="text-base leading-relaxed text-muted">
                Načítáme váš účet a přiřazení k organizaci…
              </p>
            </Card>
          ) : (
            <>
              <Card className="mb-5 p-7">
                <h1 className="mb-2.5 text-[34px] font-[950] leading-[1.15] text-navy-900">
                  Vítejte v ARCHIMEDES Live
                </h1>

                <p className="mb-2.5 max-w-[820px] text-[17px] leading-relaxed text-slate-700">
                  Ještě nejste přiřazeni ke škole, obci ani jiné organizaci.
                  Vyberte, jak chcete v ARCHIMEDES Live pokračovat.
                </p>

                <p className="max-w-[860px] text-[15px] leading-relaxed text-slate-500">
                  Přístup do portálu je určen pro registrované organizace, jejich
                  členy a vybrané jednotlivce. Pokud si nejste jistí správnou
                  volbou, můžete jednoduše odeslat žádost o přístup.
                </p>

                {error ? (
                  <Alert variant="error" className="mt-4">
                    {error}
                  </Alert>
                ) : null}
              </Card>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                <Card className="flex min-h-[220px] flex-col p-5">
                  <h2 className="mb-2.5 text-2xl font-black text-navy-900">
                    Připojit se ke škole
                  </h2>
                  <p className="text-slate-600">
                    Jste učitel a máte kód školy? Připojte svůj účet ke škole.
                  </p>
                  <div className="mt-auto">
                    <Button href="/join" className="mt-3.5">
                      Připojit se
                    </Button>
                    <div className="mt-2.5 text-sm leading-relaxed text-slate-500">
                      Samostatná registrace jednotlivých členů je výjimka určená
                      pouze školám a jejich učitelům.
                    </div>
                  </div>
                </Card>

                <Card className="flex min-h-[220px] flex-col p-5">
                  <h2 className="mb-2.5 text-2xl font-black text-navy-900">
                    Zaregistrovat organizaci
                  </h2>
                  <p className="text-slate-600">
                    Obec nejprve podá žádost. Škola nebo spolek se potom
                    zaregistrují pod aktivní obcí.
                  </p>
                  <div className="mt-auto">
                    <Button href="/zadost" className="mt-3.5">
                      Pokračovat k registraci
                    </Button>
                    <div className="mt-2.5 text-sm leading-relaxed text-slate-500">
                      Přímé založení organizace bez obce není možné.
                    </div>
                  </div>
                </Card>

                <Card className="flex min-h-[220px] flex-col p-5">
                  <h2 className="mb-2.5 text-2xl font-black text-navy-900">
                    Pokračovat jako jednotlivec
                  </h2>
                  <p className="text-slate-600">
                    Individuální přístup je určen pro vybrané uživatele, hosty,
                    moderátory, odborníky nebo partnery bez organizačního účtu.
                  </p>
                  <div className="mt-auto">
                    <Button
                      type="button"
                      onClick={continueAsIndividual}
                      disabled={savingIndividual}
                      className="mt-3.5"
                    >
                      {savingIndividual ? "Pokračuji..." : "Pokračovat"}
                    </Button>
                    <div className="mt-2.5 text-sm leading-relaxed text-slate-500">
                      Rozsah obsahu se může lišit od přístupu školy nebo obce.
                    </div>
                  </div>
                </Card>

                <Card className="flex min-h-[220px] flex-col p-5">
                  <h2 className="mb-2.5 text-2xl font-black text-navy-900">
                    Požádat o přístup
                  </h2>
                  <p className="text-slate-600">
                    Nejste si jistí, jaký typ přístupu je pro vás správný? Pošlete
                    nám krátkou žádost a ozveme se vám s dalším postupem.
                  </p>
                  <div className="mt-auto">
                    <Button href="/zadost-o-pristup" className="mt-3.5">
                      Odeslat žádost
                    </Button>
                    <div className="mt-2.5 text-sm leading-relaxed text-slate-500">
                      Vhodné pro nové školy, obce, zájemce o licenci i
                      individuální dotazy.
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </RequireAuth>
  );
}
