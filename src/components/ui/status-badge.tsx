import type { Severity } from "@/lib/severity";
import type { ConnectionStatus } from "@/types/dashboard";

export function StatusBadge({
  value,
}: {
  value: Severity | ConnectionStatus | "unknown";
}) {
  const styles = {
    normal: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    critical: "border-red-200 bg-red-50 text-red-700",
    online: "border-emerald-200 bg-emerald-50 text-emerald-700",
    stale: "border-amber-200 bg-amber-50 text-amber-800",
    offline: "border-stone-300 bg-stone-100 text-stone-600",
    unknown: "border-stone-300 bg-stone-100 text-stone-600",
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styles[value]}`}>
      {value.toUpperCase()}
    </span>
  );
}
