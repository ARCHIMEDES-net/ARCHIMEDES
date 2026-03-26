import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function SoutezePage() {
  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1>Soutěže a projekty</h1>

        <p>Zapojte se do projektů a ukažte, co vaše škola dokáže.</p>

        <h2>Aktuální soutěže</h2>

        <div>
          <p><strong>Navrhni své město</strong></p>
          <p>Jak bude vypadat vaše obec za 20 let?</p>
        </div>

        <div style={{ marginTop: 20 }}>
          <p><strong>Experiment týdne</strong></p>
          <p>Pošli video nebo fotku vašeho pokusu.</p>
        </div>
      </div>
    </RequireAuth>
  );
}
