import type { HistoryData, Reading } from "@/types/dashboard";

export const HISTORY_READING_LIMIT = 5000;

export function newestTimestamp(current: Date | null | undefined, incoming: Date): Date {
  if (!current || incoming > current) return incoming;
  return current;
}

export function groupHistoryReadings(readings: Reading[]): HistoryData {
  const sensors = new Map<string, HistoryData["sensors"][number]>();

  for (const reading of readings) {
    const existing = sensors.get(reading.deviceId);
    const entry =
      existing ??
      ({
        deviceId: reading.deviceId,
        location: reading.location,
        readings: [],
      } satisfies HistoryData["sensors"][number]);

    entry.location = reading.location;
    entry.readings.push({
      recordedAt: reading.recordedAt,
      temperature: reading.temperature,
      humidity: reading.humidity,
      severity: reading.severity,
    });

    sensors.set(reading.deviceId, entry);
  }

  return { sensors: Array.from(sensors.values()) };
}

export type ChartRow = {
  timestamp: number;
  label: string;
} & Record<string, number | string>;

export function normalizeHistoryTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Math.floor(timestamp / 2000) * 2000;
}

export function buildChartRows(
  history: HistoryData,
  metric: "temperature" | "humidity",
  formatLabel: (timestamp: number) => string,
): ChartRow[] {
  const rows = new Map<number, ChartRow>();

  for (const sensor of history.sensors) {
    for (const reading of sensor.readings) {
      const timestamp = normalizeHistoryTimestamp(reading.recordedAt);
      const row = rows.get(timestamp) ?? {
        timestamp,
        label: formatLabel(timestamp),
      };

      row[sensor.deviceId] = reading[metric];
      rows.set(timestamp, row);
    }
  }

  return Array.from(rows.values()).sort((a, b) => a.timestamp - b.timestamp);
}
