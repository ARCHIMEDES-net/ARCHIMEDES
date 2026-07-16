import PhotoWithFallback from "../PhotoWithFallback";
import { Card } from "../ui/card";

export default function ReferenceCard({ reference }) {
  const r = reference;

  return (
    <Card className="group overflow-hidden p-0">
      <div className="relative aspect-[4/3] bg-eyebrow">
        <PhotoWithFallback
          src={r.photo}
          alt={r.photoAlt || `Obec ${r.name}`}
          fallbackLabel={r.name}
          style={{ width: "100%", height: "100%" }}
          imgStyle={
            r.photoFit === "contain"
              ? { objectFit: "contain", padding: 24 }
              : { objectFit: "cover", transition: "transform .35s ease" }
          }
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/18 to-transparent" />

        {r.crest ? (
          <div className="absolute -bottom-5 left-3 rounded-full border-4 border-white shadow-md">
            <PhotoWithFallback
              src={r.crest}
              alt={r.crestAlt || `Znak obce ${r.name}`}
              fallbackLabel={r.name}
              style={{ width: 40, height: 40 }}
              rounded
            />
          </div>
        ) : null}

        <div className="absolute right-2.5 top-2.5 max-w-[145px] rounded-lg bg-white/92 px-2.5 py-1.5 text-center text-[10.5px] font-bold leading-tight text-navy-900 shadow-sm backdrop-blur">
          {r.badge}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <span className="block text-xs font-semibold text-white/70">{r.region}</span>
          <strong className="mt-1 block text-xl font-black">{r.name}</strong>
        </div>
      </div>
    </Card>
  );
}
