# ARCHIMEDES Live — zálohování a obnova

## Ověřený výchozí stav (16. 7. 2026)

- Zdrojový kód a databázové migrace jsou v repozitáři
  `ARCHIMEDES-net/ARCHIMEDES`.
- Produkční web běží na Vercelu.
- Produkční Supabase projekt je `gipikahmjlcynkqexxmz`.
- V GitHubu před touto změnou nebylo žádné automatické zálohovací workflow.
- Dřívější skript `backup_archimedes.sh` na iMacu zálohuje pouze ZIP zdrojového
  kódu. Neobsahuje databázi, Auth uživatele ani Supabase Storage.
- Supabase databázové zálohy neobsahují samotné soubory uložené přes Storage
  API. Storage je proto zálohován samostatně.

## Co automatická záloha obsahuje

Workflow `.github/workflows/supabase-backup.yml` každý den vytváří:

1. přenositelný export rolí, schématu a dat přes Supabase CLI;
2. úplný logický PostgreSQL dump v custom formátu;
3. samostatný dump dat spravovaných schémat `auth` a `storage`;
4. všechny soubory ze všech aktuálně existujících Supabase Storage bucketů;
5. manifest objektů, velikostí a SHA-256 kontrolních součtů;
6. metadata s datem, commitem a číslem workflow runu.

Celý balík se zašifruje pomocí AES-256-CBC s PBKDF2 a teprve potom odešle do
nezávislého S3-kompatibilního úložiště. Nešifrovaná databáze ani soubory se
neukládají jako GitHub artifact.

## Frekvence a testy

- denně v 01:17 UTC vznikne nový šifrovaný snapshot;
- první den v měsíci se stejný snapshot uloží také do měsíční řady;
- po každém uploadu se off-site kopie znovu stáhne, ověří a dešifruje;
- kontrolují se všechny vnitřní SHA-256 součty a čitelnost PostgreSQL archivů;
- každou neděli a při ručním spuštění se provede obnova přenositelného exportu
  do dočasné lokální instance Supabase a ověří se klíčové tabulky;
- GitHub Actions uchovává ještě 14 dní šifrovanou nouzovou kopii.

Test obnovy nikdy nezapisuje do produkční databáze.

## Povinné GitHub Actions secrets

Hodnoty se zadávají v GitHubu přes `Settings > Secrets and variables > Actions`.
Nikdy se neposílají e-mailem, chatem ani necommitují do repozitáře.

| Secret | Obsah |
|---|---|
| `SUPABASE_DB_URL` | Session pooler nebo přímý PostgreSQL connection string |
| `SUPABASE_URL` | `https://gipikahmjlcynkqexxmz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role klíč pro čtení všech Storage bucketů |
| `BACKUP_ENCRYPTION_PASSPHRASE` | Nové unikátní heslo, minimálně 24 znaků |
| `BACKUP_S3_ENDPOINT` | HTTPS endpoint nezávislého S3 úložiště |
| `BACKUP_S3_REGION` | Region cílového úložiště |
| `BACKUP_S3_BUCKET` | Název privátního backup bucketu |
| `BACKUP_S3_ACCESS_KEY_ID` | Přístupový klíč omezený na backup bucket |
| `BACKUP_S3_SECRET_ACCESS_KEY` | Tajná část přístupového klíče |

Přístupový klíč cílového úložiště má mít pouze práva pro zápis, čtení a výpis
objektů v určeném bucketu. Nemá mít oprávnění spravovat účet ani jiné buckety.

## Retence nezávislého úložiště

Na cílovém bucketu se nastaví lifecycle pravidla:

- `archimedes-live/daily/`: odstranit po 35 dnech;
- `archimedes-live/monthly/`: odstranit po 400 dnech;
- pokud poskytovatel podporuje Object Lock, zapnout režim Governance alespoň
  na 14 dní pro denní řadu.

Mazání starých záloh záměrně neprovádí GitHub workflow. Retenci řídí přímo
nezávislé úložiště, aby kompromitovaný workflow nemohl smazat historii.

## Postup obnovy při incidentu

1. Zastavit zápisy do poškozené produkce a zaznamenat čas incidentu.
2. Vybrat poslední úspěšný workflow run před incidentem.
3. Stáhnout odpovídající `.tar.gz.enc` a `.sha256` z nezávislého úložiště.
4. Ověřit vnější SHA-256, archiv dešifrovat a ověřit `MANIFEST.sha256`.
5. Obnovovat nejprve do nového odděleného Supabase projektu, nikdy přímo přes
   běžící produkci.
6. Obnovit role, schéma a data podle oficiálního pořadí Supabase.
7. Obnovit soubory do bucketů a porovnat `storage-manifest.json`.
8. Ověřit Auth přihlášení, počty organizací, členství, události, profily,
   plakáty a oprávnění RLS.
9. Teprve po funkčním a bezpečnostním smoke testu přepnout aplikaci na
   obnovený projekt.

Úplná obnova produkce je řízený incidentní zásah. Automatický test používá
výhradně dočasné oddělené prostředí.
