import Link from "next/link";

const baseBtn = {
  display: "inline-flex",
  alignItems: "center",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "#fff",
  textDecoration: "none",
  color: "#0f172a",
  fontSize: 13,
  fontWeight: 700,
  lineHeight: 1,
};

const activeBtn = {
  ...baseBtn,
  background: "#0f172a",
  border: "1px solid #0f172a",
  color: "#fff",
};

export default function AdminNav({ active = "" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        flexWrap: "wrap",
        marginTop: 6,
      }}
    >
      <Link href="/portal/admin-udalosti" style={active === "udalosti" ? activeBtn : baseBtn}>
        Události
      </Link>

      <Link href="/portal/admin-inzerce" style={active === "inzerce" ? activeBtn : baseBtn}>
        Inzerce
      </Link>

      <Link href="/portal/program" style={active === "program" ? activeBtn : baseBtn}>
        Program
      </Link>

      <Link href="/portal" style={active === "portal" ? activeBtn : baseBtn}>
        Portál
      </Link>
    </div>
  );
}
