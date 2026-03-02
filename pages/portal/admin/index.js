import Link from "next/link";
import RequireAuth from "../../../components/RequireAuth";

export default function AdminHome() {

  return (
    <RequireAuth>

      <div style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        fontFamily: "sans-serif"
      }}>

        {/* Horní menu */}

        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px"
        }}>

          <Link href="/portal">
            ← Zpět do portálu
          </Link>

          <Link href="/portal/kalendar">
            Kalendář
          </Link>

        </div>


        <h1>Admin – ARCHIMEDES Live</h1>

        <p>
          Správa obsahu živé platformy.
        </p>


        <div style={{
          marginTop: "30px",
          display: "grid",
          gap: "20px"
        }}>

          {/* Události */}

          <div style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px"
          }}>

            <h2>Události</h2>

            <p>
              Správa vysílání a kalendáře.
            </p>

            <Link href="/portal/admin-udalosti">

              <button style={{
                padding: "10px 20px",
                cursor: "pointer"
              }}>
                Otevřít admin událostí
              </button>

            </Link>

          </div>



          {/* Rezerva pro další sekce */}

          <div style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
            opacity: 0.6
          }}>

            <h2>Další sekce</h2>

            <p>
              Pracovní listy, inzerce a další obsah bude doplněn.
            </p>

          </div>


        </div>


      </div>

    </RequireAuth>
  );
}
