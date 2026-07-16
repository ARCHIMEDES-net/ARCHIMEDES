import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = requireEnv("SUPABASE_URL");
const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const outputRoot = path.resolve(
  process.env.BACKUP_STORAGE_DIR || "backup-payload/storage"
);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const manifest = {
  createdAt: new Date().toISOString(),
  buckets: [],
  objectCount: 0,
  totalBytes: 0,
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function safeOutputPath(bucket, objectName) {
  const bucketRoot = path.resolve(outputRoot, bucket);
  const destination = path.resolve(bucketRoot, objectName);

  if (!destination.startsWith(`${bucketRoot}${path.sep}`)) {
    throw new Error(`Unsafe Storage object path: ${bucket}/${objectName}`);
  }

  return destination;
}

async function listAll(bucket, prefix = "") {
  const entries = [];
  const limit = 1000;

  for (let offset = 0; ; offset += limit) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Cannot list ${bucket}/${prefix}: ${error.message}`);
    }

    entries.push(...data);
    if (data.length < limit) break;
  }

  return entries;
}

async function downloadTree(bucket, prefix = "", bucketManifest) {
  const entries = await listAll(bucket, prefix);

  for (const entry of entries) {
    const objectName = prefix ? `${prefix}/${entry.name}` : entry.name;
    const isFolder = entry.id == null && entry.metadata == null;

    if (isFolder) {
      await downloadTree(bucket, objectName, bucketManifest);
      continue;
    }

    const { data, error } = await supabase.storage.from(bucket).download(objectName);
    if (error) {
      throw new Error(`Cannot download ${bucket}/${objectName}: ${error.message}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const destination = safeOutputPath(bucket, objectName);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, buffer);

    const object = {
      name: objectName,
      bytes: buffer.length,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    };

    bucketManifest.objects.push(object);
    bucketManifest.totalBytes += buffer.length;
    manifest.objectCount += 1;
    manifest.totalBytes += buffer.length;
  }
}

async function main() {
  await mkdir(outputRoot, { recursive: true });

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Cannot list Storage buckets: ${error.message}`);
  if (!buckets?.length) throw new Error("No Supabase Storage buckets were found");

  for (const bucket of buckets) {
    const bucketManifest = {
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      objects: [],
      totalBytes: 0,
    };

    await downloadTree(bucket.id, "", bucketManifest);
    manifest.buckets.push(bucketManifest);
    console.log(
      `Downloaded bucket ${bucket.id}: ${bucketManifest.objects.length} objects`
    );
  }

  await writeFile(
    path.join(outputRoot, "storage-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { mode: 0o600 }
  );

  console.log(
    `Storage backup complete: ${manifest.buckets.length} buckets, ` +
      `${manifest.objectCount} objects, ${manifest.totalBytes} bytes`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
