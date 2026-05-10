import Link from "next/link";
import { getJoinButtonState } from "../lib/broadcastState";

const baseButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 16,
  textDecoration: "none",
  fontWeight: 900,
  border: "1px solid transparent",
  whiteSpace: "nowrap",
  lineHeight: 1.1,
};

function sizeStyle(compact, fullWidth) {
  return {
    minHeight: compact ? 42 : 52,
    padding: compact ? "0 15px" : "0 20px",
    fontSize: compact ? 14 : 16,
    width: fullWidth ? "100%" : "auto",
  };
}

export default function JoinBroadcastButton({
  event,
  compact = false,
  fullWidth = false,
  detailHref = "",
  archiveHref = "/portal/archiv",
  showWaiting = true,
  showDetailFallback = true,
}) {
  const state = getJoinButtonState(event);

  if (state.state === "hidden") return null;

  if (state.state === "join") {
    return (
      <a
        href={state.href}
        target="_blank"
        rel="noreferrer"
        style={{
          ...baseButtonStyle,
          ...sizeStyle(compact, fullWidth),
          background: "linear-gradient(135deg, #059669, #0d9488)",
          color: "#ffffff",
          borderColor: "rgba(5,150,105,0.35)",
          boxShadow: compact
            ? "0 10px 22px rgba(5,150,105,0.18)"
            : "0 16px 34px rgba(5,150,105,0.24)",
        }}
      >
        {state.label}
      </a>
    );
  }

  if (state.state === "waiting" && showWaiting) {
    return (
      <span
        style={{
          ...baseButtonStyle,
          ...sizeStyle(compact, fullWidth),
          background: "#f8fafc",
          color: "#475569",
          borderColor: "rgba(15,23,42,0.12)",
          cursor: "default",
        }}
        title="Tlačítko pro vstup se aktivuje 15 minut před začátkem vysílání."
      >
        ⏱ {state.label}
      </span>
    );
  }

  if (state.state === "finished") {
    return (
      <Link
        href={archiveHref}
        style={{
          ...baseButtonStyle,
          ...sizeStyle(compact, fullWidth),
          background: "#0f172a",
          color: "#ffffff",
          borderColor: "rgba(15,23,42,0.16)",
        }}
      >
        {state.label || "Přejít do archivu"}
      </Link>
    );
  }

  if ((state.state === "detail" || state.state === "disabled") && showDetailFallback && detailHref) {
    return (
      <Link
        href={detailHref}
        style={{
          ...baseButtonStyle,
          ...sizeStyle(compact, fullWidth),
          background: "#0f172a",
          color: "#ffffff",
          borderColor: "rgba(15,23,42,0.16)",
        }}
      >
        {state.label || "Otevřít detail"}
      </Link>
    );
  }

  return null;
}
