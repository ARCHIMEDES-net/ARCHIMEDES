import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Kalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (!error && data) {
        setEvents(data);
      }

      setLoading(false);
    }

    fetchEvents();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Načítám události...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Kalendář</h1>

      {events.length === 0 && <p>Zatím nejsou žádné události.</p>}

      <ul>
        {events.map((event) => (
          <li key={event.id} style={{ marginBottom: 16 }}>
            <strong>{event.title}</strong>
            <br />
            {event.audience && <span>Cílovka: {event.audience}</span>}
            <br />
            {event.full_description && <span>{event.full_description}</span>}
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 20 }}>
        <Link href="/portal">Zpět do portálu</Link>
      </p>
    </div>
  );
}
