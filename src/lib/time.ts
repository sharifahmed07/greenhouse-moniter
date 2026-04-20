export function formatTime(value: string): string {
  return formatTimestamp(new Date(value).getTime());
}

export function formatTimestamp(value: number): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

export function formatRelativeSeconds(value: string, referenceTime: number): string {
  const seconds = Math.max(0, Math.round((referenceTime - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.round(seconds / 60)}m ago`;
}

export function formatTemperature(value: number): string {
  return `${value.toFixed(1)}\u00b0C`;
}

export function connectionStatus(
  lastSeenAt: string,
  referenceTime: number,
): "online" | "stale" | "offline" {
  const seconds = (referenceTime - new Date(lastSeenAt).getTime()) / 1000;
  if (seconds <= 10) return "online";
  if (seconds <= 30) return "stale";
  return "offline";
}
