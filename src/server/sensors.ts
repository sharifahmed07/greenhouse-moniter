import type { Severity as PrismaSeverity } from "@prisma/client";
import { getSeverity } from "@/lib/severity";
import { groupHistoryReadings, HISTORY_READING_LIMIT, newestTimestamp } from "@/lib/readings";
import { connectionStatus } from "@/lib/time";
import { prisma } from "@/server/db";
import type { IngestPayload } from "@/server/validation";
import type { DashboardData, HistoryData, Reading } from "@/types/dashboard";

export async function ingestReading(payload: IngestPayload) {
  const recordedAt = new Date(payload.timestamp);
  const severity = getSeverity(payload.temperature, payload.humidity);

  await prisma.$transaction(async (tx) => {
    const sensor = await tx.sensor.upsert({
      where: { deviceId: payload.deviceId },
      create: {
        deviceId: payload.deviceId,
        location: payload.location,
        lastSeenAt: recordedAt,
      },
      update: {
        location: payload.location,
      },
      select: { id: true, lastSeenAt: true },
    });

    const nextLastSeenAt = newestTimestamp(sensor.lastSeenAt, recordedAt);

    if (nextLastSeenAt.getTime() !== sensor.lastSeenAt.getTime()) {
      await tx.sensor.update({
        where: { id: sensor.id },
        data: { lastSeenAt: nextLastSeenAt },
      });
    }

    await tx.sensorReading.create({
      data: {
        sensorId: sensor.id,
        temperature: payload.temperature,
        humidity: payload.humidity,
        recordedAt,
        severity,
      },
    });
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const generatedAt = Date.now();
  const sensors = await prisma.sensor.findMany({
    orderBy: { deviceId: "asc" },
    select: {
      id: true,
      deviceId: true,
      location: true,
      lastSeenAt: true,
    },
  });

  const latestBySensor = await getLatestReadingsBySensor(sensors.map((sensor) => sensor.id));

  const sensorsWithLatest = sensors.map((sensor) => ({
    id: sensor.id,
    deviceId: sensor.deviceId,
    location: sensor.location,
    lastSeenAt: sensor.lastSeenAt.toISOString(),
    connectionStatus: connectionStatus(sensor.lastSeenAt.toISOString(), generatedAt),
    latestReading: serializeLatestReading(
      latestBySensor.get(sensor.id),
      sensor.deviceId,
      sensor.location,
    ),
  }));

  const counts = sensorsWithLatest.reduce(
    (acc, sensor) => {
      acc.total += 1;
      if (sensor.latestReading) {
        acc[sensor.latestReading.severity] += 1;
      }
      return acc;
    },
    { total: 0, normal: 0, warning: 0, critical: 0 },
  );

  const [recentAlerts, recentReadings] = await Promise.all([
    prisma.sensorReading.findMany({
      where: { severity: { in: ["warning", "critical"] } },
      orderBy: { recordedAt: "desc" },
      take: 10,
      include: { sensor: true },
    }),
    prisma.sensorReading.findMany({
      orderBy: { recordedAt: "desc" },
      take: 20,
      include: { sensor: true },
    }),
  ]);

  return {
    generatedAt,
    sensors: sensorsWithLatest,
    counts,
    recentAlerts: recentAlerts.map((reading) =>
      serializeReading(reading, reading.sensor.deviceId, reading.sensor.location),
    ),
    recentReadings: recentReadings.map((reading) =>
      serializeReading(reading, reading.sensor.deviceId, reading.sensor.location),
    ),
  };
}

async function getFlatHistoryData(): Promise<Reading[]> {
  const since = new Date(Date.now() - 30 * 60 * 1000);

  const readings = await prisma.sensorReading.findMany({
    where: { recordedAt: { gte: since } },
    orderBy: { recordedAt: "desc" },
    take: HISTORY_READING_LIMIT,
    include: { sensor: true },
  });

  return readings
    .map((reading) => serializeReading(reading, reading.sensor.deviceId, reading.sensor.location))
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
}

export async function getGroupedHistoryData(): Promise<HistoryData> {
  return groupHistoryReadings(await getFlatHistoryData());
}

async function getLatestReadingsBySensor(sensorIds: string[]) {
  if (sensorIds.length === 0) return new Map<string, LatestReading>();

  const readings = await prisma.sensorReading.findMany({
    where: { sensorId: { in: sensorIds } },
    distinct: ["sensorId"],
    orderBy: [{ sensorId: "asc" }, { recordedAt: "desc" }],
    select: {
      id: true,
      sensorId: true,
      temperature: true,
      humidity: true,
      recordedAt: true,
      severity: true,
    },
  });

  return new Map(readings.map((reading) => [reading.sensorId, reading]));
}

type LatestReading = {
  id: string;
  sensorId: string;
  temperature: number;
  humidity: number;
  recordedAt: Date;
  severity: PrismaSeverity;
};

function serializeLatestReading(
  reading: LatestReading | undefined,
  deviceId: string,
  location: string,
) {
  return reading ? serializeReading(reading, deviceId, location) : null;
}

function serializeReading(
  reading: {
    id: string;
    temperature: number;
    humidity: number;
    recordedAt: Date;
    severity: PrismaSeverity;
  },
  deviceId: string,
  location: string,
): Reading {
  return {
    id: reading.id,
    deviceId,
    location,
    temperature: reading.temperature,
    humidity: reading.humidity,
    recordedAt: reading.recordedAt.toISOString(),
    severity: reading.severity,
  };
}
