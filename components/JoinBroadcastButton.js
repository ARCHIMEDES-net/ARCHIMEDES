import Link from "next/link";
import { getStreamUrl, shouldShowJoinButton } from "../lib/broadcastState";

export default function JoinBroadcastButton({ event, compact = false }) {
  if (!shouldShowJoinButton(event)) return null;

  const href = getStreamUrl(event);
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: compact ? 42 : 46,
        padding: compact ? "0 16px" : "0 18px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 800,
        fontSize: compact ? 14 : 15,
        background: "linear-gradient(135deg, #0f766e, #0ea5a4)",
        color: "#ffffff",
        border: "1px solid rgba(15,118,110,0.35)",
        boxShadow: "0 10px 26px rgba(15,118,110,0.18)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 14px 30px rgba(15,118,110,0.24)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 26px rgba(15,118,110,0.18)";
      }}
    >
      ▶ Vstoupit do vysílání
    </Link>
  );
}
