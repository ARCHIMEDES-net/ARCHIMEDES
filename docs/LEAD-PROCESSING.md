# Zpracování leadů

Zdroj pravdy pro leady ARCHIMEDES Live tvoří Supabase a aplikační SMTP.
Make není součástí produkčního zpracování leadů.

## Autoritativní workflow

### Objednávka programu

Formulář `/zadost` volá `/api/zadost-o-pristup`. Server:

1. ověří a omezí vstup;
2. uloží lead do `public.leads`;
3. založí neaktivní organizaci čekající na schválení;
4. zapíše archiv žádosti do `public.access_requests`;
5. odešle interní SMTP oznámení;
6. odešle žadateli SMTP potvrzení.

Pokud SMTP selže až po úspěšném databázovém zápisu, lead a onboardingová
data zůstávají zdrojem pravdy a odpověď výslovně uvádí stav e-mailu.

### Poptávka venkovní učebny

Formulář `/poptavka-ucebny` volá `/api/poptavka-ucebny`. Server uloží
lead do `public.leads`, odešle interní SMTP oznámení a potvrzení
žadateli.

### Legacy poptávka

Veřejná cesta `/poptavka` je přesměrovaná na `/zadost`. Zachovaný
endpoint `/api/poptavka` ukládá lead do `public.leads` a odesílá interní
SMTP oznámení; nemá žádnou závislost na Make.

## Administrace

Platformoví administrátoři zpracovávají leady v
`/portal/admin-poptavky`. Změny stavů probíhají přímo nad
`public.leads` podle existujících RLS a autorizačních pravidel.

## Zakázané legacy napojení

Databázový trigger `new_lead_notification`, veřejná route
`/api/make-lead`, oba legacy Make scénáře a jejich webhooky byly
vyřazeny rozhodnutím v issue #83. Nový export osobních údajů nebo nové
externí zpracování leadů vyžaduje samostatné obchodní a bezpečnostní
schválení.
