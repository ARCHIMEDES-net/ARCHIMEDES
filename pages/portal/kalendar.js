import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const AUDIENCE_GROUPS = [
  "1. stupeň",
  "2. stupeň",
  "Dospělí",
  "Senioři",
  "Komunita",
];

const CATEGORIES = [
  "Kariérní poradenství",
  "Wellbeing",
  "Wellbeing story",
  "Čtenářský klub ZŠ",
  "Senior klub",
  "Čtenářský klub dospělí",
  "Vzdělávání",
  "Filmový klub",
  "Speciál",
];

function Pill({ children, strong }) {
  return (
    <span className={`pill ${strong ? "pill-strong" : ""}`}>
      {children}
    </span>
  );
}

function normalizeGroups(e) {
  if (Array.isArray(e.audience_groups) && e.audience_groups.length)
    return e.audience_groups;

  if (Array.isArray(e.audience))
    return e.audience.filter((x) =>
      AUDIENCE_GROUPS.includes(x)
    );

  return [];
}

function normalizeCategory(e) {
  if (e.category) return e.category;

  if (Array.isArray(e.audience)) {
    const found = e.audience.find((x) =>
      CATEGORIES.includes(x)
    );
    if (found) return found;
  }

  return "Speciál";
}

function posterUrl(path) {
  if (!path) return null;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posters/${path}`;
}

export default function ProgramPage() {

  const [events,setEvents]=useState([])
  const [loading,setLoading]=useState(true)

  const [category,setCategory]=useState("Vše")
  const [groups,setGroups]=useState([])

  useEffect(()=>{

    async function load(){

      const {data,error}=await supabase
      .from("events")
      .select("*")
      .eq("is_published",true)
      .order("starts_at",{ascending:true})

      if(!error) setEvents(data || [])

      setLoading(false)
    }

    load()

  },[])

  const filtered=useMemo(()=>{

    return events.filter(e=>{

      const cat=normalizeCategory(e)
      const g=normalizeGroups(e)

      if(category!=="Vše" && cat!==category)
        return false

      if(groups.length>0){

        const match=g.some(x=>groups.includes(x))

        if(!match) return false
      }

      return true

    })

  },[events,category,groups])

  const now=new Date()

  const upcoming=filtered.filter(e=>new Date(e.starts_at)>=now)
  const archive=filtered.filter(e=>new Date(e.starts_at)<now).reverse()

  function toggleGroup(g){

    setGroups(prev=>
      prev.includes(g)
      ? prev.filter(x=>x!==g)
      : [...prev,g]
    )

  }

  function resetFilters(){
    setGroups([])
    setCategory("Vše")
  }

  function Section({title,items}){

    if(items.length===0)
      return null

    return(

      <div style={{marginTop:24}}>

        <div
        style={{
        fontWeight:900,
        marginBottom:8
        }}
        >
        {title} ({items.length})
        </div>

        <div
        style={{
        display:"grid",
        gap:12
        }}
        >

        {items.map(e=>{

        const cat=normalizeCategory(e)
        const g=normalizeGroups(e)
        const pUrl=posterUrl(e.poster_path)

        return(

        <div
        key={e.id}
        className="card card-pad"
        >

        <div
        style={{
        display:"flex",
        gap:16,
        alignItems:"center"
        }}
        >

        {pUrl ? (

        <a
        href={pUrl}
        target="_blank"
        rel="noreferrer"
        >

        <img
        src={pUrl}
        alt="Plakát"
        style={{
        width:96,
        height:96,
        objectFit:"cover",
        borderRadius:14,
        border:"1px solid rgba(11,18,32,.10)"
        }}
        />

        </a>

        ):(
        <div
        style={{
        width:96,
        height:96,
        borderRadius:14,
        border:"1px dashed rgba(11,18,32,.18)",
        background:"rgba(11,18,32,.02)",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:12,
        color:"rgba(11,18,32,.55)",
        fontWeight:800
        }}
        >
        bez plakátu
        </div>
        )}

        <div style={{flex:1}}>

        <div
        style={{
        display:"flex",
        justifyContent:"space-between"
        }}
        >

        <div
        style={{
        fontWeight:900,
        fontSize:16
        }}
        >
        {e.title}
        </div>

        <div className="small">
        {new Date(e.starts_at).toLocaleString("cs-CZ")}
        </div>

        </div>

        <div
        className="row"
        style={{marginTop:8}}
        >

        <Pill strong>{cat}</Pill>

        {g.map(x=>(
        <Pill key={x}>{x}</Pill>
        ))}

        {e.stream_url && <Pill>▶ vysílání</Pill>}
        {e.worksheet_url && <Pill>📄 pracovní list</Pill>}

        </div>

        <div
        className="row"
        style={{marginTop:10}}
        >

        <Link href={`/portal/udalost/${e.id}`}>
        <a className="btn">Detail</a>
        </Link>

        {e.stream_url && (
        <a
        href={e.stream_url}
        target="_blank"
        className="btn"
        >
        ▶ Vysílání
        </a>
        )}

        {e.worksheet_url && (
        <a
        href={e.worksheet_url}
        target="_blank"
        className="btn"
        >
        📄 Pracovní list
        </a>
        )}

        </div>

        </div>

        </div>

        </div>

        )

        })}

        </div>

      </div>

    )

  }

  if(loading)
  return(
  <div className="container">
  Načítám...
  </div>
  )

  return(

  <div className="container">

  <div className="topbar">

  <div>

  <h1 className="h1">
  Program
  </h1>

  <div className="sub">
  Přehled vysílání. Řazeno podle starts_at.
  </div>

  </div>

  <div className="row">

  <Link href="/portal">
  <a className="btn">
  ← Zpět do portálu
  </a>
  </Link>

  <Link href="/portal/admin/udalosti">
  <a className="btn">
  Admin – události
  </a>
  </Link>

  </div>

  </div>

  <div className="card card-pad">

  <div style={{fontWeight:900}}>
  Filtry
  </div>

  <div
  style={{
  marginTop:12,
  display:"grid",
  gridTemplateColumns:"1fr 1fr",
  gap:20
  }}
  >

  <div>

  <div style={{fontWeight:800}}>
  Rubrika
  </div>

  <select
  className="select"
  value={category}
  onChange={e=>setCategory(e.target.value)}
  style={{marginTop:6}}
  >

  <option>Vše</option>

  {CATEGORIES.map(c=>(
  <option key={c}>{c}</option>
  ))}

  </select>

  </div>

  <div>

  <div style={{fontWeight:800}}>
  Pro koho
  </div>

  <div
  className="row"
  style={{marginTop:8}}
  >

  {AUDIENCE_GROUPS.map(g=>{

  const active=groups.includes(g)

  return(

  <button
  key={g}
  className="btn"
  onClick={()=>toggleGroup(g)}
  type="button"
  style={{
  background:active?"#0b1220":"#fff",
  color:active?"white":"black"
  }}
  >

  {g}

  </button>

  )

  })}

  <button
  className="btn"
  onClick={resetFilters}
  type="button"
  >

  Reset

  </button>

  </div>

  </div>

  </div>

  <div className="small" style={{marginTop:10}}>
  Zobrazuji jen publikované události (is_published = true).
  </div>

  </div>

  <Section title="Nadcházející" items={upcoming}/>
  <Section title="Archiv" items={archive}/>

  </div>

  )

}
