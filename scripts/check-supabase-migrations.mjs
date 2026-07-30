import fs from "node:fs";
import path from "node:path";

const migrationDir = path.resolve(process.cwd(), "supabase/migrations");
const migrationPattern = /^(\d{14})_[a-z0-9][a-z0-9_-]*\.sql$/;

function fail(message) {
  console.error(`Migration check failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(migrationDir)) {
  fail(`missing directory ${migrationDir}`);
} else {
  const files = fs
    .readdirSync(migrationDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name);

  const parsed = [];
  const versions = new Map();

  for (const file of files) {
    const match = file.match(migrationPattern);
    if (!match) {
      fail(`${file} must use YYYYMMDDHHMMSS_description.sql`);
      continue;
    }

    const version = match[1];
    parsed.push({ file, version });

    const duplicates = versions.get(version) || [];
    duplicates.push(file);
    versions.set(version, duplicates);
  }

  for (const [version, duplicateFiles] of versions) {
    if (duplicateFiles.length > 1) {
      fail(`duplicate version ${version}: ${duplicateFiles.join(", ")}`);
    }
  }

  const directoryOrder = parsed.map(({ version }) => version);
  const sortedOrder = [...directoryOrder].sort();

  if (directoryOrder.join("\n") !== sortedOrder.join("\n")) {
    fail("migration files are not returned in chronological order; rename or inspect the conflicting versions");
  }

  if (!process.exitCode) {
    console.log(`Migration check passed: ${parsed.length} timestamped migrations.`);
  }
}
