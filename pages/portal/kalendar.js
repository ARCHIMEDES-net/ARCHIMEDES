import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeAudience(aud) {
  if (!aud) return "";
  if (Array.isArray(aud)) return aud.join(", ");
  return String(aud);
}

export default function Kalendar() {

  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");

  useEffect(()=>{

    async function load(){

      setLoading(true);

      const {data,error} = await supabase
        .from("events")
        .select("id,title,audience,starts_at,is_published,stream_url,worksheet_url")
        .eq("is_published",true)
        .order("starts_at",{ascending:true});

      if(error){

        setErr(error.message);
        setRows([]);

      }else{

        setRows(data || []);

      }

      setLoading(false);

    }

    load();

  },[]);


  const now = new Date();

  const upcoming = useMemo(()=>{

    return rows
      .map(r=>({

        ...r,
        start:safeDate(r.starts_at),
        aud:normalizeAudience(r.audience)

      }))
      .filter(r=>r.start && r.start>=now);

  },[rows]);


  const archive = useMemo(()=>{

    return rows
      .map(r=>({

        ...r,
        start:safeDate(r.starts_at),
        aud:normalizeAudience(r.audience)

      }))
      .filter(r=>r.start && r.start<now)
      .reverse();

  },[rows]);


  return (

    <RequireAuth>

    <div style={{
      maxWidth:1000,
      margin:"40px auto",
      fontFamily:"system-ui",
      padding:16
    }}>

      <h1>Program vysílání</h1>

      <div style={{marginBottom:20}}>

        <Link href="/portal">← Portál</Link>

        {" | "}

        <Link href="/portal/pracovni-listy">Pracovní listy</Link>

        {" | "}

        <Link href="/portal/admin/udalosti">
        Admin
        </Link>

      </div>



      {loading && <p>Načítám...</p>}

      {err && <p style={{color:"red"}}>{err}</p>}



{/* NADCHÁZEJÍCÍ */}


<h2 style={{marginTop:20}}>
Nadcházející vysílání
</h2>


{upcoming.length===0 &&

<p>
Žádné plánované vysílání.
</p>

}


{upcoming.map(ev=>(

<div key={ev.id}

style={{

border:"1px solid #ddd",
borderRadius:12,
padding:16,
marginBottom:12

}}>

<div style={{

fontSize:26,
fontWeight:800

}}>

{formatTime(ev.start)}

</div>


<div style={{

fontSize:18,
fontWeight:700

}}>

<Link href={`/portal/udalost/${ev.id}`}>

{ev.title}

</Link>

</div>


<div>

{formatDate(ev.start)}

</div>


{ev.aud &&

<div>

Cílovka: {ev.aud}

</div>

}


<div style={{

marginTop:10,
display:"flex",
gap:10

}}>


{ev.stream_url &&

<a

href={ev.stream_url}
target="_blank"

style={{

border:"1px solid black",
padding:8,
borderRadius:8,
textDecoration:"none",
fontWeight:700

}}

>

▶ Vysílání

</a>

}



{ev.worksheet_url &&

<a

href={ev.worksheet_url}
target="_blank"

style={{

border:"1px solid black",
padding:8,
borderRadius:8,
textDecoration:"none",
fontWeight:700

}}

>

📄 List

</a>

}


</div>

</div>

))}





{/* ARCHIV */}



<h2 style={{marginTop:40}}>
Archiv vysílání
</h2>


{archive.length===0 &&

<p>

Archiv je zatím prázdný.

</p>

}


{archive.map(ev=>(

<div key={ev.id}

style={{

border:"1px solid #eee",
borderRadius:12,
padding:14,
marginBottom:10,
opacity:0.85

}}>

<div style={{

fontSize:20,
fontWeight:700

}}>

<Link href={`/portal/udalost/${ev.id}`}>

{ev.title}

</Link>

</div>


<div>

{formatDate(ev.start)}

</div>

</div>

))}



</div>

</RequireAuth>

  );
}
