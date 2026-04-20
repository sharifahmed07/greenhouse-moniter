export function Metric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "normal" | "warning" | "critical";
}) {
  const tones = {
    neutral: "text-stone-900",
    normal: "text-emerald-700",
    warning: "text-amber-700",
    critical: "text-red-700",
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 transition-colors">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold transition-colors ${tones[tone]}`}>{value}</p>
    </div>
  );
}
