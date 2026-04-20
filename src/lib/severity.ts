export type Severity = "normal" | "warning" | "critical";

const rank: Record<Severity, number> = {
  normal: 0,
  warning: 1,
  critical: 2,
};

function temperatureSeverity(value: number): Severity {
  if (value < 16 || value > 32) return "critical";
  if (value < 18 || value > 30) return "warning";
  return "normal";
}

function humiditySeverity(value: number): Severity {
  if (value < 30 || value > 80) return "critical";
  if (value < 40 || value > 70) return "warning";
  return "normal";
}

export function getSeverity(temperature: number, humidity: number): Severity {
  const temperatureStatus = temperatureSeverity(temperature);
  const humidityStatus = humiditySeverity(humidity);

  return rank[temperatureStatus] >= rank[humidityStatus]
    ? temperatureStatus
    : humidityStatus;
}
