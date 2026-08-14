import fs from "node:fs/promises";
import process from "node:process";

function requiredEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function automationUrl() {
  const explicit = String(process.env.ONBOARDING_AUTOMATION_URL || "").trim();
  const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const candidate = explicit || `${siteUrl.replace(/\/+$/, "")}/api/admin/automation/activate-municipality`;
  const parsed = new URL(candidate);

  if (
    parsed.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(parsed.hostname)
  ) {
    throw new Error("Onboarding automation URL must use HTTPS.");
  }
  return parsed.toString();
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error("Usage: node scripts/onboard-municipality.mjs <approved-request.json>");
  }

  const request = JSON.parse(await fs.readFile(inputPath, "utf8"));
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    throw new Error("Approved onboarding request must be one JSON object.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(automationUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requiredEnv("ONBOARDING_AUTOMATION_SECRET")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({
      error: "Server returned a non-JSON response.",
    }));

    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!response.ok || result?.ok !== true) process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
