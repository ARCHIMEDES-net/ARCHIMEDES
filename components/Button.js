import Link from "next/link";

export default function Button({ href, children, variant = "primary" }) {

  const primary = variant === "primary";

  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
        padding: "0 20px",
        borderRadius: 14,
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 16,
        background: primary ? "#111827" : "white",
        color: primary ? "white" : "#111827",
        border: primary ? "1px solid #111827" : "1px solid rgba(17,24,39,0.18)",
        transition: "all .15s ease",
        boxSizing: "border-box",
      }}

      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = primary
          ? "0 10px 22px rgba(0,0,0,0.18)"
          : "0 8px 18px rgba(0,0,0,0.12)";
        if (primary) e.currentTarget.style.background = "#1f2937";
      }}

      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        if (primary) e.currentTarget.style.background = "#111827";
      }}

      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
      }}

      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
    >
      {children}
    </Link>
  );
}
