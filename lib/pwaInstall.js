const IOS_ALTERNATIVE_BROWSER_PATTERN =
  /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Ddg|GSA|FBAN|FBAV|Instagram/i;

export function detectInstallPlatform({
  userAgent = "",
  platform = "",
  maxTouchPoints = 0,
} = {}) {
  const normalizedUserAgent = String(userAgent || "");
  const normalizedPlatform = String(platform || "");
  const isIpadDesktopMode =
    normalizedPlatform === "MacIntel" && Number(maxTouchPoints || 0) > 1;
  const isIos = /iPad|iPhone|iPod/i.test(normalizedUserAgent) || isIpadDesktopMode;

  if (isIos) {
    return IOS_ALTERNATIVE_BROWSER_PATTERN.test(normalizedUserAgent)
      ? "ios-other"
      : "ios-safari";
  }

  if (/Android/i.test(normalizedUserAgent)) return "android";
  return "desktop";
}

export function installPlatformFromNavigator(navigatorValue) {
  return detectInstallPlatform({
    userAgent: navigatorValue?.userAgent,
    platform: navigatorValue?.platform,
    maxTouchPoints: navigatorValue?.maxTouchPoints,
  });
}
