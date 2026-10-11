export const PLATFORM_INQUIRY_KIND = "platform_consultation";
export const PLATFORM_INQUIRY_LABEL = "Platforma – nezávazné zapojení";
export const PLATFORM_INQUIRY_MARKER = "Druh: platform_consultation";

export function isPlatformInquiry(row) {
  return String(row?.note || "").split("\n").includes(PLATFORM_INQUIRY_MARKER);
}
