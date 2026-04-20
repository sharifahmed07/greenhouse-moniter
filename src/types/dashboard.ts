import type { Severity } from "@/lib/severity";

export type ConnectionStatus = "online" | "stale" | "offline";

export type HistoryReading = {
  temperature: number;
  humidity: number;
  recordedAt: string;
  severity: Severity;
};

export type Reading = HistoryReading & {
  id: string;
  deviceId: string;
  location: string;
};

export type SensorHistory = {
  deviceId: string;
  location: string;
  readings: HistoryReading[];
};

export type HistoryData = {
  sensors: SensorHistory[];
};

export type SensorSummary = {
  id: string;
  deviceId: string;
  location: string;
  lastSeenAt: string;
  connectionStatus: ConnectionStatus;
  latestReading: Reading | null;
};

export type DashboardData = {
  generatedAt: number;
  sensors: SensorSummary[];
  counts: {
    total: number;
    normal: number;
    warning: number;
    critical: number;
  };
  recentAlerts: Reading[];
  recentReadings: Reading[];
};
