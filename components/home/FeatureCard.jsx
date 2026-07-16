import { Card, CardContent } from "../ui/card";

export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card className="transition-colors hover:border-slate-300">
      <CardContent>
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-eyebrow">
          {Icon ? <Icon className="h-5 w-5 text-brand" aria-hidden="true" /> : null}
        </div>
        <h3 className="mt-4 text-base font-bold tracking-tight text-navy-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}
