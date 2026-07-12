export default function StatCard({ value, label }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-[950] tracking-tight text-navy-900">{value}</span>
      <span className="text-sm font-semibold text-slate-500">{label}</span>
    </div>
  );
}
