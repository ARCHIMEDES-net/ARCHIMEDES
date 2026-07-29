import crypto from "crypto";

function clientAddress(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "")
    .split(",")[0]
    .trim();

  return (
    forwarded ||
    String(req.headers?.["x-real-ip"] || "").trim() ||
    String(req.socket?.remoteAddress || "").trim() ||
    "unknown"
  );
}

export async function consumeAuthenticatedRateLimit({
  supabaseAdmin,
  req,
  route,
  userId,
  resourceId = "",
  limit,
  windowSeconds,
}) {
  const salt = process.env.RATE_LIMIT_SALT || "archimedes-live-authenticated-api";
  const keyMaterial = [userId, resourceId, clientAddress(req)].join(":");
  const keyHash = crypto
    .createHmac("sha256", salt)
    .update(keyMaterial)
    .digest("hex");

  const { data, error } = await supabaseAdmin.rpc("consume_api_rate_limit", {
    p_route: route,
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error("authenticated rate limit error:", error);
    throw new Error("Nepodařilo se ověřit bezpečnost požadavku.");
  }

  return data === true;
}
