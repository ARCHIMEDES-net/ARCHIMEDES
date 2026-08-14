import fs from "node:fs";
import path from "node:path";

const migrationDir = path.resolve(process.cwd(), "supabase/migrations");
const productionLedgerPath = path.resolve(
  process.cwd(),
  "supabase/production-migration-ledger.json"
);
const legacyPattern = /^(\d{4})_[a-z0-9][a-z0-9_-]*\.sql$/;
const timestampPattern = /^(\d{14})_([a-z0-9][a-z0-9_-]*)\.sql$/;
const ledgerIdentityPattern = /^(\d{14})_([a-z0-9][a-z0-9_-]*)$/;

function fail(message) {
  console.error(`Migration check failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(migrationDir)) {
  fail(`missing directory ${migrationDir}`);
} else if (!fs.existsSync(productionLedgerPath)) {
  fail(`missing production ledger ${productionLedgerPath}`);
} else {
  const files = fs
    .readdirSync(migrationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const versions = new Map();
  const timestampedMigrations = [];
  let legacyCount = 0;
  let timestampCount = 0;

  for (const file of files) {
    const legacyMatch = file.match(legacyPattern);
    const timestampMatch = file.match(timestampPattern);
    const match = timestampMatch || legacyMatch;

    if (!match) {
      fail(
        `${file} must use either legacy NNNN_description.sql or ` +
          "YYYYMMDDHHMMSS_description.sql"
      );
      continue;
    }

    const version = match[1];
    const namespace = timestampMatch ? "timestamp" : "legacy";
    const key = `${namespace}:${version}`;

    if (timestampMatch) {
      timestampCount += 1;
      timestampedMigrations.push({
        version,
        name: timestampMatch[2],
        identity: file.slice(0, -4),
      });
    } else {
      legacyCount += 1;
    }

    const duplicates = versions.get(key) || [];
    duplicates.push(file);
    versions.set(key, duplicates);
  }

  for (const [key, duplicateFiles] of versions) {
    if (duplicateFiles.length > 1) {
      fail(`duplicate migration version ${key}: ${duplicateFiles.join(", ")}`);
    }
  }

  let productionLedger;
  try {
    productionLedger = JSON.parse(fs.readFileSync(productionLedgerPath, "utf8"));
  } catch (error) {
    fail(`cannot parse production ledger: ${error.message}`);
  }

  const productionIdentities = productionLedger?.migrations;
  if (!Array.isArray(productionIdentities) || productionIdentities.length === 0) {
    fail("production ledger must contain a non-empty migrations array");
  } else {
    const localByIdentity = new Map(
      timestampedMigrations.map((migration) => [migration.identity, migration])
    );
    const localByVersion = new Map(
      timestampedMigrations.map((migration) => [migration.version, migration])
    );
    const productionByIdentity = new Map();
    const productionByVersion = new Map();

    for (const identity of productionIdentities) {
      const match = typeof identity === "string" && identity.match(ledgerIdentityPattern);
      if (!match) {
        fail(`invalid production ledger identity: ${String(identity)}`);
        continue;
      }

      const [, version, name] = match;
      if (productionByIdentity.has(identity)) {
        fail(`duplicate production ledger identity: ${identity}`);
      }
      if (productionByVersion.has(version)) {
        fail(`duplicate production ledger version: ${version}`);
      }

      productionByIdentity.set(identity, { version, name });
      productionByVersion.set(version, { identity, name });
    }

    for (const [identity, productionMigration] of productionByIdentity) {
      if (localByIdentity.has(identity)) continue;

      const sameVersion = localByVersion.get(productionMigration.version);
      fail(
        sameVersion
          ? `production migration ${identity} is named locally as ${sameVersion.identity}`
          : `production migration ${identity} is missing locally`
      );
    }

    const latestProductionVersion = [...productionByVersion.keys()].sort().at(-1);
    for (const localMigration of timestampedMigrations) {
      if (productionByIdentity.has(localMigration.identity)) continue;

      const sameVersion = productionByVersion.get(localMigration.version);
      if (sameVersion) {
        fail(
          `local migration ${localMigration.identity} conflicts with production ${sameVersion.identity}`
        );
      } else if (
        latestProductionVersion &&
        localMigration.version <= latestProductionVersion
      ) {
        fail(
          `untracked historical migration ${localMigration.identity}; ` +
            "only newer, not-yet-deployed migrations may be absent from the production ledger"
        );
      }
    }
  }

  if (!process.exitCode) {
    console.log(
      `Migration check passed: ${legacyCount} legacy and ${timestampCount} timestamped migrations.`
    );
  }
}
