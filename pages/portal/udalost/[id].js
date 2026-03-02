import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

const AUDIENCE_GROUPS = ["1. stupeň","2. stupeň","Dospělí","Senioři","Komunita"];

function formatCz(dt){

const d = new Date(dt);

return d.toLocaleString("cs-CZ");

}

export default function EventDetail(){

const router = useRouter();
const {id} = router.query;

const [event,setEvent] = useState(null);

useEffect(()=>{

if(!id) return;

supabase
.from("events")
.select("*")
.eq("id",id)
.single()
.then(({data})=>{

setEvent(data)

})

},[id])

if(!event) return <div style={{padding:"30px"}}>Načítám...</div>

const groups =
Array.isArray(event.audience_groups)
? event.audience_groups
: [];

const category =
event.category
? event.category
: "Speciál";

return(

<div style={{maxWidth:"900px",margin:"0 auto",padding:"30px"}}>

<div style={{marginBottom:"20px"}}>

<Link href="/portal/kalendar">

<a style={{
padding:"10px 14px",
border:"1px solid #ddd",
borderRadius:"10px",
textDecoration:"none"
}}>

← Zpět na program

</a>

</Link>

</div>

<h1 style={{
fontSize:"26px",
marginBottom:"10px"
}}>

{event.title}

</h1>

<div style={{
marginBottom:"10px",
color:"#666"
}}>

{formatCz(event.starts_at)}

</div>


<div style={{
display:"flex",
gap:"8px",
flexWrap:"wrap",
marginBottom:"20px"
}}>

<span style={{
padding:"5px 10px",
border:"1px solid #ddd",
borderRadius:"20px",
fontWeight:"600"
}}>

{category}

</span>


{groups.map(g=>(
<span key={g} style={{
padding:"5px 10px",
border:"1px solid #ddd",
borderRadius:"20px"
}}>
{g}
</span>
))}

</div>


<div style={{
lineHeight:"1.6",
marginBottom:"30px"
}}>

{event.full_description}

</div>


<div style={{
display:"flex",
gap:"10px",
flexWrap:"wrap"
}}>


{event.stream_url && (

<a
href={event.stream_url}
target="_blank"
style={{
padding:"12px 16px",
border:"1px solid #ddd",
borderRadius:"10px",
textDecoration:"none",
fontWeight:"600"
}}
>

▶ Vysílání

</a>

)}


{event.worksheet_url && (

<a
href={event.worksheet_url}
target="_blank"
style={{
padding:"12px 16px",
border:"1px solid #ddd",
borderRadius:"10px",
textDecoration:"none",
fontWeight:"600"
}}
>

📄 Pracovní list

</a>

)}


</div>

</div>

)

}
