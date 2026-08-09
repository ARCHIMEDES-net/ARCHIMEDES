export const PASSWORD_MIN_LENGTH = 8;

export const LEAKED_PASSWORD_MESSAGE =
  "Toto heslo bylo nalezeno v databázi dříve uniklých hesel. Z bezpečnostních důvodů zvolte jiné, jedinečné heslo.";

const PASSWORD_LENGTH_MESSAGE = `Heslo musí mít alespoň ${PASSWORD_MIN_LENGTH} znaků.`;
const PASSWORD_CHARACTERS_MESSAGE =
  "Heslo nesplňuje požadovanou kombinaci znaků. Zvolte jiné heslo.";
const WEAK_PASSWORD_MESSAGE =
  "Heslo nesplňuje bezpečnostní požadavky. Zvolte jiné heslo.";

function passwordReasons(value) {
  if (!value || typeof value !== "object") return [];

  const directReasons = Array.isArray(value.reasons) ? value.reasons : [];
  const nestedValue = value.weakPassword || value.weak_password;
  const nestedReasons = Array.isArray(nestedValue?.reasons)
    ? nestedValue.reasons
    : [];

  return [...new Set([...directReasons, ...nestedReasons])].filter(
    (reason) => typeof reason === "string"
  );
}

export function getWeakPasswordMessage(value) {
  const reasons = passwordReasons(value);
  const isWeakPasswordError =
    value?.code === "weak_password" ||
    value?.name === "AuthWeakPasswordError" ||
    reasons.length > 0;

  if (!isWeakPasswordError) return null;
  if (reasons.includes("pwned")) return LEAKED_PASSWORD_MESSAGE;
  if (reasons.includes("length")) return PASSWORD_LENGTH_MESSAGE;
  if (reasons.includes("characters")) return PASSWORD_CHARACTERS_MESSAGE;

  return WEAK_PASSWORD_MESSAGE;
}
