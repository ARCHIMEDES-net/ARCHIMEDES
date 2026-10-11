import { track } from "@vercel/analytics";

// Never send form values, contact details or unrestricted URL parameters.
// Analytics failure must not interrupt a submission or navigation.
export function trackConversion(name, properties = {}) {
  try {
    track(name, properties);
  } catch (_) {
    // Operational records remain authoritative for submitted inquiries/orders.
  }
}
