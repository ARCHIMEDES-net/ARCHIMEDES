import Link from "next/link";

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui", background: "#f6f7fb", minHeight: "100vh" }}>

      {/* HEADER */}

      <div style={{
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center"
        }}>
          
          <div style={{fontWeight:800,fontSize:18}}>
            ARCHIMEDES
            <span style={{
              background:"#ff2d2d",
              color:"white",
              padding:"2px 8px",
              borderRadius:8,
              marginLeft:6
            }}>
              live
            </span>
          </div>

          <div style={{marginLeft:"auto",display:"flex",gap:20}}>

            <Link href="/">Domů</Link>

            <Link href="/program">Program</Link>

            <Link href="/cenik">Ceník</Link>

            <Link href="/portal">Portál</Link>

          </div>

        </div>
      </div>


      {/* HERO */}

      <div style={{
        maxWidth:1100,
        margin:"0 auto",
        padding:"70px 16px"
      }}>
        
        <h1 style={{
          fontSize:44,
          lineHeight:1.2,
          marginBottom:20
        }}>
          Živá vzdělávací platforma  
          pro školy a obce
        </h1>

        <p style={{
          fontSize:18,
          opacity:0.8,
          maxWidth:650,
          marginBottom:32
        }}>
          ARCHIMEDES Live propojuje školy, obce a odborníky.
          Nabízí živé vysílání, komunitní programy a sdílení zkušeností
          mezi školami a městy.
        </p>

        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>

          <Link href="/program"
            style={{
              background:"black",
              color:"white",
              padding:"14px 20px",
              borderRadius:12,
              textDecoration:"none",
              fontWeight:700
            }}
          >
            Program vysílání
          </Link>

          <Link href="/cenik"
            style={{
              border:"1px solid rgba(0,0,0,0.2)",
              padding:"14px 20px",
              borderRadius:12,
              textDecoration:"none"
            }}
          >
            Ceník licencí
          </Link>

          <Link href="/portal"
            style={{
              border:"1px solid rgba(0,0,0,0.2)",
              padding:"14px 20px",
              borderRadius:12,
              textDecoration:"none"
            }}
          >
            Přihlásit se do portálu
          </Link>

        </div>

      </div>


      {/* SEKCE VYSVĚTLENÍ */}

      <div style={{
        maxWidth:1100,
        margin:"0 auto",
        padding:"20px 16px 60px"
      }}>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
          gap:20
        }}>

          <Card
            title="Pro školy"
            text="Živé vstupy odborníků, projektové dny, pracovní listy a inspirace pro výuku."
          />

          <Card
            title="Pro obce"
            text="Komunitní program, propojení generací a vzdělávací aktivity pro obyvatele."
          />

          <Card
            title="Pro seniory"
            text="Online klub, vzdělávání a společné aktivity, které pomáhají předcházet izolaci."
          />

        </div>

      </div>


      {/* CTA */}

      <div style={{
        background:"white",
        borderTop:"1px solid rgba(0,0,0,0.08)"
      }}>
        <div style={{
          maxWidth:1100,
          margin:"0 auto",
          padding:"50px 16px",
          textAlign:"center"
        }}>

          <h2 style={{marginBottom:12}}>
            Podívejte se na nejbližší vysílání
          </h2>

          <Link href="/program"
            style={{
              display:"inline-block",
              marginTop:10,
              background:"black",
              color:"white",
              padding:"14px 20px",
              borderRadius:12,
              textDecoration:"none",
              fontWeight:700
            }}
          >
            Zobrazit program
          </Link>

        </div>
      </div>

    </div>
  );
}



function Card({title,text}) {
  return (
    <div style={{
      background:"white",
      padding:24,
      borderRadius:16,
      border:"1px solid rgba(0,0,0,0.08)"
    }}>
      <h3 style={{marginBottom:10}}>{title}</h3>
      <p style={{opacity:0.8,lineHeight:1.5}}>
        {text}
      </p>
    </div>
  );
}
