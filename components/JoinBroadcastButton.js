import { useEffect, useState } from "react";
import Link from "next/link";
import { getJoinButtonState } from "../lib/broadcastState";
import { supabase } from "../lib/supabaseClient";

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
  forceDynamicJoin = false,
}) {
  const [, setTick] = useState(0);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((v) => v + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const session = Array.isArray(event?.broadcast_sessions)
    ? event.broadcast_sessions[0]
    : event?.broadcast_sessions || event?.broadcast_session;
  const state = forceDynamicJoin && session?.external_meeting_id
    ? {
        state: "join",
        label: "Vstoupit do testovacího vysílání",
        href: "",
        dynamicJoin: true,
        reason: "admin-preview",
      }
    : getJoinButtonState(event);

  async function joinThroughArchimedes() {
    setJoining(true);
    setJoinError("");
    const target = window.open("", "_blank");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Přihlášení vypršelo. Přihlaste se prosím znovu.");

      const response = await fetch(`/api/broadcasts/${event.id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Vstup do vysílání se nepodařilo připravit.");
      }

      if (target) {
        target.opener = null;
        target.location.replace(payload.url);
      } else {
        window.location.assign(payload.url);
      }
    } catch (error) {
      if (target) target.close();
      setJoinError(error.message || "Vstup do vysílání se nepodařilo připravit.");
    } finally {
      setJoining(false);
    }
  }

  if (state.state === "hidden") return null;

  if (state.state === "join" && state.dynamicJoin) {
    return (
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 6, width: fullWidth ? "100%" : "auto" }}>
        <button
          type="button"
          onClick={joinThroughArchimedes}
          disabled={joining}
          style={{
            ...baseButtonStyle,
            ...sizeStyle(compact, fullWidth),
            background: "linear-gradient(135deg, #059669, #0d9488)",
            color: "#ffffff",
            borderColor: "rgba(5,150,105,0.35)",
            boxShadow: compact
              ? "0 10px 22px rgba(5,150,105,0.18)"
              : "0 16px 34px rgba(5,150,105,0.24)",
            cursor: joining ? "wait" : "pointer",
            opacity: joining ? 0.75 : 1,
          }}
        >
          ▶ {joining ? "Připravuji bezpečný vstup…" : state.label || "Vstoupit do vysílání"}
        </button>
        {joinError ? (
          <span role="alert" style={{ color: "#b91c1c", fontSize: 13, whiteSpace: "normal" }}>
            {joinError}
          </span>
        ) : null}
      </span>
    );
  }

  if (state.state === "join" && state.href) {
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
        ▶ {state.label || "Vstoupit do vysílání"}
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
        ⏱ Vstoupit do vysílání od{" "}
        {state.label?.replace("Připojení od ", "")}
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

  if (state.state === "recording") {
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
        title="Odkaz do archivu se zobrazí po publikování hotového záznamu."
      >
        ⏳ {state.label || "Záznam připravujeme"}
      </span>
    );
  }

  if (
    (state.state === "detail" || state.state === "disabled") &&
    showDetailFallback &&
    detailHref
  ) {
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
