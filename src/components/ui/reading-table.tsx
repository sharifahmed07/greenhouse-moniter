import { formatTemperature, formatTime } from "@/lib/time";
import type { Reading } from "@/types/dashboard";
import { StatusBadge } from "@/components/ui/status-badge";

export function ReadingTable({ readings }: { readings: Reading[] }) {
  if (readings.length === 0) {
    return <p className="text-sm text-stone-500">No readings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="py-3 pr-4 font-medium">Time</th>
            <th className="py-3 pr-4 font-medium">Sensor</th>
            <th className="py-3 pr-4 font-medium">Location</th>
            <th className="py-3 pr-4 font-medium">Temp</th>
            <th className="py-3 pr-4 font-medium">Humidity</th>
            <th className="py-3 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {readings.map((reading) => (
            <tr key={reading.id}>
              <td className="py-3 pr-4 text-stone-600">{formatTime(reading.recordedAt)}</td>
              <td className="py-3 pr-4 font-medium text-stone-900">{reading.deviceId}</td>
              <td className="py-3 pr-4 text-stone-600">{reading.location}</td>
              <td className="py-3 pr-4 text-stone-700">
                {formatTemperature(reading.temperature)}
              </td>
              <td className="py-3 pr-4 text-stone-700">{reading.humidity.toFixed(1)}%</td>
              <td className="py-3">
                <StatusBadge value={reading.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
