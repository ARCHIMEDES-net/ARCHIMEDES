import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function EventDetail() {

const router = useRouter();
const { id } = router.query;

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

if(!event) return <div>Načítám...</div>

return(

<div style={{padding:"30px"}}>

<Link href="/portal/kalendar">
← zpět
</Link>

<h1>{event.title}</h1>

<p>

{new Date(event.starts_at).toLocaleString("cs-CZ")}

</p>

<p>

{event.full_description}

</p>

<br/>

<a href={event.stream_url} target="_blank">

▶ Vysílání

</a>

<br/><br/>

<a href={event.worksheet_url} target="_blank">

📄 Pracovní list

</a>

</div>

)

}
