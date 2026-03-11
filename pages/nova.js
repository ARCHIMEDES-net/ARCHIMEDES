import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const SchoolsMap = dynamic(
  () => import("../components/SchoolsMap"),
  { ssr: false }
)

function InstagramPost({ id, type }) {

  const src =
    type === "p"
      ? `https://www.instagram.com/p/${id}/embed`
      : `https://www.instagram.com/reel/${id}/embed`

  return (
    <div style={{borderRadius:12,overflow:"hidden"}}>
      <iframe
        src={src}
        width="100%"
        height="420"
        frameBorder="0"
        scrolling="no"
      />
    </div>
  )
}

export default function NovaHomepage(){

  const [posts,setPosts] = useState([])

  useEffect(()=>{

    fetch("/api/instagram")
      .then(r=>r.json())
      .then(setPosts)

  },[])

  return (

<main style={{fontFamily:"Inter, sans-serif"}}>

{/* HERO */}

<section style={{
maxWidth:1200,
margin:"80px auto",
padding:"0 20px"
}}>

<div style={{
display:"grid",
gridTemplateColumns:"1.1fr 1fr",
gap:60,
alignItems:"center"
}}>

<div>

<div style={{
display:"inline-block",
background:"#f3f4f6",
padding:"6px 12px",
borderRadius:20,
fontSize:14,
marginBottom:20
}}>
ARCHIMEDES Live • program + učebna + komunita
</div>

<h1 style={{
fontSize:48,
fontWeight:800,
lineHeight:1.1
}}>
Program, který propojuje
školu a život obce
</h1>

<p style={{
marginTop:20,
fontSize:18,
maxWidth:520
}}>
ARCHIMEDES® propojuje učebnu,
živé hosty a program pro děti,
učitele, seniory i komunitu obce.
</p>

<ul style={{
marginTop:20,
lineHeight:1.8
}}>
<li>hosté z Akademie věd, kultury a praxe</li>
<li>využití pro školu i komunitu obce</li>
<li>síť reálných učeben ARCHIMEDES®</li>
</ul>

</div>


<img
src="/media/ucebnavprirode.jpg"
style={{
width:"100%",
borderRadius:18
}}
/>

</div>

</section>


{/* INSTAGRAM VIDEA */}

<section style={{
maxWidth:1200,
margin:"40px auto",
padding:"0 20px"
}}>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:24
}}>

{posts.map((p,i)=>(
  <InstagramPost
    key={i}
    id={p.id}
    type={p.type}
  />
))}

</div>

</section>


{/* MAPA */}

<section style={{
maxWidth:1200,
margin:"120px auto",
padding:"0 20px"
}}>

<h2 style={{
fontSize:34,
fontWeight:800,
textAlign:"center"
}}>
Síť učeben ARCHIMEDES®
</h2>

<p style={{
textAlign:"center",
maxWidth:600,
margin:"20px auto"
}}>
Učebny propojují školy a komunity
po celé České republice a postupně
vznikají i v dalších zemích.
</p>

<div style={{marginTop:40}}>
<SchoolsMap/>
</div>

</section>


</main>

  )

}
