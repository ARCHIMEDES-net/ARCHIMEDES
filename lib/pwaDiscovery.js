export const PWA_DISCOVERY_STORAGE_KEY = "archimedes-pwa-discovery-v1";
export const PWA_DISCOVERY_REMINDER_DELAY_MS = 30 * 24 * 60 * 60 * 1000;

export function readPwaDiscoveryState(value) {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function shouldShowPwaDiscovery({
  standalone = false,
  storedValue = "",
  now = Date.now(),
} = {}) {
  if (standalone) return false;

  const state = readPwaDiscoveryState(storedValue);
  if (state.installed === true) return false;

  const dismissedUntil = Number(state.dismissedUntil || 0);
  return !Number.isFinite(dismissedUntil) || dismissedUntil <= now;
}

export function pwaDiscoveryDismissalValue(now = Date.now()) {
  return JSON.stringify({
    dismissedUntil: now + PWA_DISCOVERY_REMINDER_DELAY_MS,
  });
}

export function pwaDiscoveryInstalledValue() {
  return JSON.stringify({ installed: true });
}
