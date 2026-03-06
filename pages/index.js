import Link from "next/link";

export default function Home() {
  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh" }}>
      <main>

{/* HERO */}
<section style={{
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 16px"
}}>

<div style={{
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: 22,
  background: "linear-gradient(135deg,#0f172a,#1f2937)",
  borderRadius: 28,
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
}}>

{/* TEXT */}
<div style={{
  padding: 36,
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
}}>

<div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
<span style={{
padding:"8px 14px",
borderRadius:999,
background:"rgba(16,185,129,0.2)",
border:"1px solid rgba(16,185,129,0.3)",
fontSize:14
}}>
Živý vzdělávací program
</span>

<span style={{
padding:"8px 14px",
borderRadius:999,
background:"rgba(255,255,255,0.12)",
border:"1px solid rgba(255,255,255,0.18)",
fontSize:14
}}>
Školy + obce + komunita
</span>
</div>

<h1 style={{
fontSize:52,
lineHeight:1.05,
margin:"0 0 18px"
}}>
Každý měsíc nový program pro školu i komunitu obce
</h1>

<p style={{
fontSize:19,
lineHeight:1.7,
opacity:0.9,
marginBottom:26
}}>
Živé vstupy s hosty, pracovní listy pro žáky a program pro komunitu obce.
<br/>
Každý měsíc nový obsah, který může škola i obec hned využít.
</p>

{/* CTA */}
<div style={{
display:"flex",
gap:14,
flexWrap:"wrap"
}}>

<Link href="/ukazka"
style={{
display:"inline-flex",
alignItems:"center",
justifyContent:"center",
padding:"14px 24px",
borderRadius:14,
fontSize:16,
fontWeight:700,
textDecoration:"none",
color:"#fff",
background:"linear-gradient(135deg,#10b981,#059669)",
boxShadow:"0 12px 26px rgba(16,185,129,0.35)",
border:"1px solid rgba(16,185,129,0.9)"
}}>
Domluvit ukázku programu
</Link>

<Link href="/program"
style={{
display:"inline-flex",
alignItems:"center",
justifyContent:"center",
padding:"14px 24px",
borderRadius:14,
fontSize:16,
fontWeight:600,
textDecoration:"none",
color:"#fff",
background:"rgba(255,255,255,0.12)",
border:"1px solid rgba(255,255,255,0.25)",
backdropFilter:"blur(6px)"
}}>
Prohlédnout program
</Link>

<Link href="/cenik"
style={{
display:"inline-flex",
alignItems:"center",
justifyContent:"center",
padding:"14px 24px",
borderRadius:14,
fontSize:16,
fontWeight:600,
textDecoration:"none",
color:"#fff",
background:"rgba(255,255,255,0.12)",
border:"1px solid rgba(255,255,255,0.25)",
backdropFilter:"blur(6px)"
}}>
Ceník a financování
</Link>

</div>

<div style={{
display:"flex",
gap:18,
flexWrap:"wrap",
marginTop:24,
fontSize:14,
opacity:0.8
}}>
<span>20+ učeben</span>
<span>1 000+ žáků v síti</span>
<span>Vítěz soutěže Obec 2030</span>
</div>

</div>

{/* HERO IMAGE */}
<div style={{
padding:22,
display:"flex",
flexDirection:"column",
gap:16
}}>

<div style={{
height:320,
borderRadius:22,
backgroundImage:"url(/media/hero-classroom.jpg)",
backgroundSize:"cover",
backgroundPosition:"center"
}}/>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:16
}}>

<div style={{
height:160,
borderRadius:18,
backgroundImage:"url(/media/lesson-closeup.webp)",
backgroundSize:"cover",
backgroundPosition:"center"
}}/>

<div style={{
height:160,
borderRadius:18,
backgroundImage:"url(/media/community-seniors.jpg)",
backgroundSize:"cover",
backgroundPosition:"center"
}}/>

</div>

</div>

</div>

</section>

{/* TRUST */}
<section style={{
background:"#eef1f7",
padding:"80px 0"
}}>

<div style={{
maxWidth:1100,
margin:"0 auto",
padding:"0 16px"
}}>

<h2 style={{
fontSize:38,
marginBottom:24
}}>
ARCHIMEDES Live už funguje v řadě škol a obcí
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:18
}}>

{[
["20+","učeben ARCHIMEDES"],
["1 000+","zapojených žáků"],
["2×","měsíčně Senior klub"],
["Obec 2030","vítěz soutěže"]
].map((item,i)=>(
<div key={i}
style={{
background:"white",
borderRadius:20,
padding:22,
border:"1px solid rgba(0,0,0,0.06)"
}}>
<div style={{fontSize:38,fontWeight:700}}>
{item[0]}
</div>
<div style={{opacity:0.7}}>
{item[1]}
</div>
</div>
))}

</div>

</div>

</section>

{/* FINAL CTA */}
<section style={{
maxWidth:1100,
margin:"0 auto",
padding:"80px 16px"
}}>

<div style={{
background:"linear-gradient(135deg,#0f172a,#1f2937)",
borderRadius:28,
padding:40,
display:"grid",
gridTemplateColumns:"1fr auto",
alignItems:"center",
gap:20,
color:"white"
}}>

<div>

<h2 style={{
fontSize:36,
marginBottom:12
}}>
Chcete ukázku programu?
</h2>

<p style={{
opacity:0.85
}}>
Během krátké online schůzky vám ukážeme jednu hodinu programu,
pracovní listy i prostředí portálu.
</p>

</div>

<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>

<Link href="/ukazka"
style={{
padding:"14px 22px",
borderRadius:14,
background:"#fff",
color:"#111",
fontWeight:700,
textDecoration:"none"
}}>
Domluvit ukázku
</Link>

<Link href="/program"
style={{
padding:"14px 22px",
borderRadius:14,
border:"1px solid rgba(255,255,255,0.3)",
color:"#fff",
textDecoration:"none"
}}>
Program
</Link>

</div>

</div>

</section>

</main>
</div>
  );
}
