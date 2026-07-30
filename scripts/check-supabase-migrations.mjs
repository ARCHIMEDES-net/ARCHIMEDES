import fs from "node:fs";
import path from "node:path";

const migrationDir = path.resolve(process.cwd(), "supabase/migrations");
const legacyPattern = /^(\d{4})_[a-z0-9][a-z0-9_-]*\.sql$/;
const timestampPattern = /^(\d{14})_[a-z0-9][a-z0-9_-]*\.sql$/;

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
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const versions = new Map();
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

    if (timestampMatch) timestampCount += 1;
    else legacyCount += 1;

    const duplicates = versions.get(key) || [];
    duplicates.push(file);
    versions.set(key, duplicates);
  }

  for (const [key, duplicateFiles] of versions) {
    if (duplicateFiles.length > 1) {
      fail(`duplicate migration version ${key}: ${duplicateFiles.join(", ")}`);
    }
  }

  if (!process.exitCode) {
    console.log(
      `Migration check passed: ${legacyCount} legacy and ${timestampCount} timestamped migrations.`
    );
  }
}
