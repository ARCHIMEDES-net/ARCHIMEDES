import Link from "next/link";

export default function PortalHeader() {
  return (

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        borderBottom: "1px solid #ddd",
        marginBottom: "20px"
      }}
    >

      {/* LOGO */}

      <Link href="/portal">

        <img
          src="/logo/archimedes-live.png"
          style={{
            height: "50px",
            cursor: "pointer"
          }}
        />

      </Link>


      {/* MENU */}

      <div style={{ display: "flex", gap: "15px" }}>

        <Link href="/portal">
          Portál
        </Link>

        <Link href="/portal/kalendar">
          Program
        </Link>

        <Link href="/portal/admin">
          Admin
        </Link>

      </div>


    </div>

  );
}
