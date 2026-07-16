import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert } from "../components/ui/alert";

export default function RetiredOrganizationInterestSignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <Card className="mx-auto max-w-[720px] p-7">
        <h1 className="text-[32px] font-[950] leading-tight text-navy-900">
          Registrace upozornění byla přesunuta
        </h1>

        <Alert variant="neutral" className="mt-5">
          Samostatný účet už nelze založit pouze pomocí kódu spolku nebo školy.
        </Alert>

        <p className="mt-5 leading-relaxed text-slate-700">
          Učitelé se mohou připojit ke své škole školním kódem. Správce spolku
          nebo jiný již registrovaný uživatel si osobní zájmy nastaví po
          přihlášení ve svém profilu.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/join">Jsem učitel</Button>
          <Button href="/login?next=/portal/muj-profil" variant="secondary">
            Přihlásit se a upravit zájmy
          </Button>
        </div>
      </Card>
    </main>
  );
}
