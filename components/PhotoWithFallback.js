import { useEffect, useRef, useState } from "react";

function initialsFrom(text) {
  return String(text || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * Renders an <img> and falls back to a neutral placeholder (initials on a
 * tinted circle) if the source is missing or fails to load. Used for assets
 * that are provided later (partner logos, erby, reference photos) so the
 * layout never shows a broken-image icon before real files are uploaded.
 */
export default function PhotoWithFallback({
  src,
  alt,
  fallbackLabel,
  className,
  style,
  imgStyle,
  rounded = false,
}) {
  const [failed, setFailed] = useState(!src);
  const imgRef = useRef(null);

  // A same-tick 404 can complete (and error) before React's hydration
  // attaches its event listeners, so onError alone can miss it. Re-check
  // once mounted and fall back if the browser already gave up on it.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) {
      setFailed(true);
    }
  }, [src]);

  if (failed) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e7eef9, #f3f7fc)",
          color: "#3b587f",
          fontWeight: 900,
          fontSize: 14,
          borderRadius: rounded ? 999 : 12,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          ...style,
        }}
        aria-label={alt}
        role="img"
      >
        {initialsFrom(fallbackLabel || alt) || "?"}
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      style={{ borderRadius: rounded ? 999 : undefined, ...style, ...imgStyle }}
      onError={() => setFailed(true)}
    />
  );
}
