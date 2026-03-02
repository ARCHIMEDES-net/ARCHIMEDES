import { useEffect, useState } from "react";
import RequireAuth from "../../components/RequireAuth";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";


const AUDIENCE_OPTIONS = [
  "1. stupeň",
  "2. stupeň",
  "Deváťáci",
  "Rodiče",
  "Učitelé",
  "Senioři",
  "Komunita"
];


const CATEGORY_OPTIONS = [

  "Vstup expertů – 1. stupeň",
  "Vstup expertů – 2. stupeň",
  "Kariérní poradenství jinak",
  "Smart City klub",
  "Generace Z",
  "13. komnata VIP",
  "English Talk",

  "Senior klub",
  "Čtenářský klub – děti",
  "Čtenářský klub – dospělí",

  "Speciál",
  "Wellbeing",
  "Filmový klub"
];



export default function AdminUdalosti() {

const [events,setEvents] = useState([])

const [title,setTitle] = useState("")
const [startAt,setStartAt] = useState("")
const [description,setDescription] = useState("")
const [streamUrl,setStreamUrl] = useState("")
const [worksheetUrl,setWorksheetUrl] = useState("")
const [category,setCategory] = useState("Speciál")

const [audienceGroups,setAudienceGroups] = useState([])

const [error,setError] = useState("")
const [loading,setLoading] = useState(false)



async function loadEvents(){

const {data,error} = await supabase
.from("events")
.select("*")
.order("start_at",{ascending:true})

if(!error){
setEvents(data)
}

}


useEffect(()=>{

loadEvents()

},[])



function toggleAudience(value){

if(audienceGroups.includes(value)){

setAudienceGroups(
audienceGroups.filter(a=>a!==value)
)

}else{

setAudienceGroups([
...audienceGroups,
value
])

}

}



async function saveEvent(){

setError("")

if(!title){
setError("Chybí název")
return
}

if(!startAt){
setError("Chybí datum")
return
}

if(audienceGroups.length===0){
setError("Vyber alespoň jednu cílovku")
return
}


setLoading(true)


const audienceText =
audienceGroups.join(", ")


const {error} = await supabase
.from("events")
.insert([{

title:title,

start_at:startAt,

full_description:description,

stream_url:streamUrl,

worksheet_url:worksheetUrl,

category:category,

audience_groups:audienceGroups,

audience:audienceText,

is_published:true

}])


setLoading(false)


if(error){

setError(error.message)

}else{

setTitle("")
setStartAt("")
setDescription("")
setStreamUrl("")
setWorksheetUrl("")
setAudienceGroups([])

loadEvents()

}


}



return (

<RequireAuth>

<div style={{padding:"20px"}}>

<h1>Admin – události</h1>

<Link href="/portal">
← Zpět do portálu
</Link>

<br/><br/>


{error &&
<div style={{color:"red"}}>

Chyba: {error}

</div>
}


<h2>Nová událost</h2>


<div>

Název události*

<br/>

<input
value={title}
onChange={(e)=>setTitle(e.target.value)}
style={{width:"400px"}}
/>

</div>


<br/>


<div>

Datum a čas

<br/>

<input
type="datetime-local"
value={startAt}
onChange={(e)=>setStartAt(e.target.value)}
/>

</div>


<br/>


<div>

Rubrika

<br/>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
>

{CATEGORY_OPTIONS.map(c=>(

<option key={c}>

{c}

</option>

))}

</select>

</div>


<br/>


<div>

Cílové skupiny

<br/><br/>

{AUDIENCE_OPTIONS.map(a=>(

<label key={a}
style={{display:"block"}}
>

<input
type="checkbox"
checked={audienceGroups.includes(a)}
onChange={()=>toggleAudience(a)}
/>

{a}

</label>

))}

</div>



<br/>


<div>

Popis

<br/>

<textarea
value={description}
onChange={(e)=>setDescription(e.target.value)}
rows={4}
style={{width:"500px"}}
/>

</div>



<br/>


<div>

Odkaz na vysílání

<br/>

<input
value={streamUrl}
onChange={(e)=>setStreamUrl(e.target.value)}
style={{width:"400px"}}
/>

</div>



<br/>


<div>

Pracovní list

<br/>

<input
value={worksheetUrl}
onChange={(e)=>setWorksheetUrl(e.target.value)}
style={{width:"400px"}}
/>

</div>


<br/>


<button
onClick={saveEvent}
disabled={loading}
>

Uložit událost

</button>



<h2>Seznam událostí</h2>


{events.map(e=>(

<div key={e.id}
style={{
border:"1px solid #ccc",
padding:"10px",
marginBottom:"10px"
}}
>

<b>{e.title}</b>

<br/>

{e.start_at}

<br/>

{e.category}

<br/>

{e.audience}

</div>

))}


</div>

</RequireAuth>

)

}
