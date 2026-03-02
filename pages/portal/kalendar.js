import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Program() {

const [events,setEvents] = useState([]);

useEffect(()=>{
load();
},[]);

async function load(){

const { data } = await supabase
.from("events")
.select("*")
.eq("is_published",true)
.order("starts_at",{ascending:true});

setEvents(data || []);

}


const upcoming = events.filter(e =>
new Date(e.starts_at) >= new Date()
);

const archive = events.filter(e =>
new Date(e.starts_at) < new Date()
);


return (

<div style={styles.page}>


<h1 style={styles.title}>
Program vysílání
</h1>

<p style={styles.subtitle}>
Přehled živých vysílání ARCHIMEDES Live
</p>


<div style={styles.buttons}>

<Link href="/portal">

<button style={styles.button}>
← Zpět do portálu
</button>

</Link>

<Link href="/portal/admin/udalosti">

<button style={styles.buttonSecondary}>
Admin – události
</button>

</Link>

</div>



<h2 style={styles.section}>
Nadcházející vysílání
</h2>



{upcoming.map(e=>(
<EventCard key={e.id} e={e}/>
))}


{upcoming.length==0 && (
<p>Žádné vysílání není naplánováno.</p>
)}




<h2 style={styles.section}>
Archiv vysílání
</h2>



{archive.map(e=>(
<EventCard key={e.id} e={e}/>
))}


{archive.length==0 && (
<p>Archiv je zatím prázdný.</p>
)}



</div>

);
}



function EventCard({e}){

return(

<div style={styles.card}>


<div style={styles.posterWrap}>

{e.poster_url ?

<img
src={e.poster_url}
style={styles.poster}
/>

:

<div style={styles.noPoster}>
bez plakátu
</div>

}

</div>



<div style={styles.content}>

<h3 style={styles.eventTitle}>
{e.title}
</h3>


<div style={styles.meta}>

{e.category &&
<span style={styles.badge}>
{e.category}
</span>
}

{e.audience_groups?.map(g=>(
<span key={g} style={styles.badgeLight}>
{g}
</span>
))}

</div>


<div style={styles.date}>

{new Date(e.starts_at).toLocaleString("cs-CZ")}

</div>



<div style={styles.actions}>

<Link href={"/portal/udalost/"+e.id}>

<button style={styles.buttonDetail}>
Detail
</button>

</Link>


{e.stream_url &&

<a href={e.stream_url} target="_blank">

<button style={styles.buttonLive}>
▶ Vysílání
</button>

</a>

}


{e.worksheet_url &&

<a href={e.worksheet_url} target="_blank">

<button style={styles.buttonDoc}>
Pracovní list
</button>

</a>

}


</div>


</div>

</div>

);

}



const styles={

page:{

maxWidth:1000,
margin:"auto",
padding:40,
fontFamily:"Segoe UI"

},


title:{

fontSize:36,
fontWeight:700,
marginBottom:5

},


subtitle:{

color:"#666",
marginBottom:30

},



section:{

marginTop:40,
marginBottom:20,
fontSize:22

},



card:{

display:"flex",
gap:20,
padding:20,
borderRadius:16,
boxShadow:"0 4px 20px rgba(0,0,0,0.08)",
marginBottom:20,
background:"#fff"

},



posterWrap:{

width:160

},



poster:{

width:"100%",
borderRadius:12

},



noPoster:{

width:140,
height:200,
borderRadius:12,
background:"#eee",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#888",
fontSize:14

},



content:{

flex:1

},


eventTitle:{

fontSize:22,
fontWeight:600,
marginBottom:10

},



meta:{

marginBottom:10

},


badge:{

background:"#e53935",
color:"white",
padding:"4px 10px",
borderRadius:10,
marginRight:8,
fontSize:14

},


badgeLight:{

background:"#eee",
padding:"4px 10px",
borderRadius:10,
marginRight:8,
fontSize:14

},



date:{

color:"#666",
marginBottom:15

},


actions:{

display:"flex",
gap:10

},


buttons:{

display:"flex",
gap:10,
marginBottom:30

},


button:{

padding:"10px 16px",
borderRadius:10,
border:"none",
background:"#eee",
cursor:"pointer"

},


buttonSecondary:{

padding:"10px 16px",
borderRadius:10,
border:"none",
background:"#333",
color:"white",
cursor:"pointer"

},


buttonDetail:{

padding:"10px 16px",
borderRadius:10,
border:"none",
background:"#ddd",
cursor:"pointer"

},


buttonLive:{

padding:"10px 16px",
borderRadius:10,
border:"none",
background:"#e53935",
color:"white",
cursor:"pointer",
fontWeight:600

},


buttonDoc:{

padding:"10px 16px",
borderRadius:10,
border:"none",
background:"#1976d2",
color:"white",
cursor:"pointer"

}

};
