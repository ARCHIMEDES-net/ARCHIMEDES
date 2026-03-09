import { getLiveBadge } from "../lib/broadcastState";

export default function BroadcastBadge({ event }) {
  const label = getLiveBadge(event);
  if (!label) return null;

  const isLive = label === "Právě vysíláme";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        background: isLive ? "rgba(220,38,38,0.10)" : "rgba(245,158,11,0.14)",
        color: isLive ? "#b91c1c" : "#92400e",
        border: isLive
          ? "1px solid rgba(220,38,38,0.20)"
          : "1px solid rgba(245,158,11,0.20)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: isLive ? "#dc2626" : "#f59e0b",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}
