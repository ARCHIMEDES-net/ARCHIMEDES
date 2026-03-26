import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";

export default function KomunitaPage() {
  return (
    <RequireAuth>
      <PortalHeader />

      <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1>Komunita</h1>

        <p>Podívejte se, co se děje v ostatních školách a zapojte se.</p>

        <h2>Komunitní dění</h2>
        <div>👉 (zatím placeholder – později napojíme na DB)</div>

        <h2 style={{ marginTop: 40 }}>Kluby</h2>

        <div>
          <p><strong>Čtenářský klub</strong> – 1× měsíčně</p>
          <p><strong>Senior klub</strong> – 2× měsíčně</p>
          <p><strong>Smart City klub</strong> – pro deváťáky</p>
        </div>
      </div>
    </RequireAuth>
  );
}
