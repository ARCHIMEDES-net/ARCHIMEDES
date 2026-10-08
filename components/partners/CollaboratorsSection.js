const collaborators = [
  { name: "Science ON", logo: "/partners/science-on.png", href: "https://scienceon.cz/", web: "scienceon.cz" },
  { name: "Policejní prezidium ČR", logo: "/partners/policie.svg", href: "https://policie.gov.cz/policejni-prezidium-ceske-republiky", web: "policie.gov.cz" },
  { name: "JINAG", logo: "/partners/jinag.png", href: "https://www.jinag.eu/", web: "jinag.eu" },
  { name: "Zoo Praha", logo: "/partners/zoo-praha.png", href: "https://www.zoopraha.cz/", web: "zoopraha.cz" },
];
export default function CollaboratorsSection() {
  return (
    <section aria-labelledby="collaborators-heading" className="border-y border-slate-100 bg-slate-50 py-12">
      <div className="mx-auto max-w-[1180px] px-5">
        <h2 id="collaborators-heading" className="text-3xl font-[950] tracking-[-0.045em] text-navy-900">Spolupracujeme</h2>
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {collaborators.map(partner => (
            <a key={partner.name} href={partner.href} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} — web organizace (otevře se v nové kartě)`} className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center transition hover:border-blue-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
              <div className="flex h-24 w-full items-center justify-center overflow-hidden">
                <img src={partner.logo} alt="" loading="lazy" style={partner.name === "Science ON" ? { transform: "scale(2.7)" } : undefined} className="max-h-24 w-auto max-w-full object-contain" />
              </div>
              <span className="mt-5 text-sm font-bold text-navy-900">{partner.name}</span>
              <span className="mt-1 text-xs text-slate-500 group-hover:text-blue-700">{partner.web} ↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
