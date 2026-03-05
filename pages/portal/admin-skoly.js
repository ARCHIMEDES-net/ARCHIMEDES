import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import PortalHeader from "../../components/PortalHeader";
import { supabase } from "../../lib/supabaseClient";

const BUCKET = "schools";

export default function AdminSkoly() {

  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");

  const emptyForm = {
    name:"",
    city:"",
    region:"",
    country:"Česká republika",
    school_type:"",
    website:"",
    contact_name:"",
    contact_email:"",
    contact_phone:"",
    short_description:"",
    classroom_description:"",
    archimedes_since:"",
    has_archimedes_classroom:true,
    is_published:true
  }

  const [form,setForm] = useState(emptyForm);
  const [file,setFile] = useState(null);

  async function load(){

    setLoading(true);
    setErr("");

    const {data,error} = await supabase
      .from("schools")
      .select("*")
      .order("created_at",{ascending:false});

    if(error){
      setErr(error.message);
      setLoading(false);
      return;
    }

    setRows(data || []);
    setLoading(false);
  }

  useEffect(()=>{ load() },[]);

  function updateField(key,value){
    setForm({...form,[key]:value});
  }

  async function uploadPhoto(id){

    if(!file) return null;

    const ext = file.name.split(".").pop();
    const path = `${id}.${ext}`;

    const {error} = await supabase
      .storage
      .from(BUCKET)
      .upload(path,file,{upsert:true});

    if(error){
      alert(error.message);
      return null;
    }

    return path;
  }

  async function saveSchool(){

    const {data,error} = await supabase
      .from("schools")
      .insert([form])
      .select()
      .single();

    if(error){
      alert(error.message);
      return;
    }

    if(file){

      const path = await uploadPhoto(data.id);

      if(path){
        await supabase
          .from("schools")
          .update({photo_path:path})
          .eq("id",data.id);
      }
    }

    setForm(emptyForm);
    setFile(null);

    load();
  }

  async function removeSchool(id){

    if(!confirm("Opravdu smazat školu?")) return;

    const {error} = await supabase
      .from("schools")
      .delete()
      .eq("id",id);

    if(error){
      alert(error.message);
      return;
    }

    load();
  }

  return (

  <RequireAuth>
  <PortalHeader title="Administrace škol"/>

  <div style={{maxWidth:1100,margin:"0 auto",padding:20}}>

    <h2>Přidat školu</h2>

    <div style={{display:"grid",gap:8,marginBottom:30}}>

      <input placeholder="Název školy"
      value={form.name}
      onChange={(e)=>updateField("name",e.target.value)}/>

      <input placeholder="Město"
      value={form.city}
      onChange={(e)=>updateField("city",e.target.value)}/>

      <input placeholder="Kraj"
      value={form.region}
      onChange={(e)=>updateField("region",e.target.value)}/>

      <input placeholder="Web školy"
      value={form.website}
      onChange={(e)=>updateField("website",e.target.value)}/>

      <input placeholder="Kontaktní osoba"
      value={form.contact_name}
      onChange={(e)=>updateField("contact_name",e.target.value)}/>

      <input placeholder="Email"
      value={form.contact_email}
      onChange={(e)=>updateField("contact_email",e.target.value)}/>

      <input placeholder="Telefon"
      value={form.contact_phone}
      onChange={(e)=>updateField("contact_phone",e.target.value)}/>

      <textarea
      placeholder="Krátký popis školy"
      value={form.short_description}
      onChange={(e)=>updateField("short_description",e.target.value)}/>

      <textarea
      placeholder="Popis učebny ARCHIMEDES"
      value={form.classroom_description}
      onChange={(e)=>updateField("classroom_description",e.target.value)}/>

      <input
      type="date"
      value={form.archimedes_since}
      onChange={(e)=>updateField("archimedes_since",e.target.value)}
      />

      <input
      type="file"
      onChange={(e)=>setFile(e.target.files[0])}
      />

      <button onClick={saveSchool}>
        Uložit školu
      </button>

    </div>


    <h2>Seznam škol</h2>

    {loading ? "Načítám..." : null}

    {err ? <div>Chyba: {err}</div> : null}

    <div style={{display:"grid",gap:10}}>

      {rows.map(r=>(
        <div key={r.id}
        style={{
          border:"1px solid #ddd",
          padding:10,
          borderRadius:8
        }}>

          <b>{r.name}</b>

          <div>{r.city}</div>

          <div style={{marginTop:6}}>

            <button
            onClick={()=>removeSchool(r.id)}
            style={{background:"#b91c1c",color:"white"}}>
              Smazat
            </button>

          </div>

        </div>
      ))}

    </div>

  </div>

  </RequireAuth>
  )
}
