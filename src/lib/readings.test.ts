import { describe, expect, it } from "vitest";
import { buildChartRows, groupHistoryReadings, newestTimestamp } from "@/lib/readings";
import type { Reading } from "@/types/dashboard";

const readings: Reading[] = [
  {
    id: "1",
    deviceId: "sensor-01",
    location: "north-wing",
    recordedAt: "2026-04-20T12:00:00.100Z",
    temperature: 22,
    humidity: 55,
    severity: "normal",
  },
  {
    id: "2",
    deviceId: "sensor-02",
    location: "south-wing",
    recordedAt: "2026-04-20T12:00:01.800Z",
    temperature: 24,
    humidity: 60,
    severity: "normal",
  },
];

describe("reading utilities", () => {
  it("groups history readings by sensor", () => {
    expect(groupHistoryReadings(readings)).toEqual({
      sensors: [
        {
          deviceId: "sensor-01",
          location: "north-wing",
          readings: [
            {
              recordedAt: "2026-04-20T12:00:00.100Z",
              temperature: 22,
              humidity: 55,
              severity: "normal",
            },
          ],
        },
        {
          deviceId: "sensor-02",
          location: "south-wing",
          readings: [
            {
              recordedAt: "2026-04-20T12:00:01.800Z",
              temperature: 24,
              humidity: 60,
              severity: "normal",
            },
          ],
        },
      ],
    });
  });

  it("builds chart rows with multiple sensors on a normalized timestamp", () => {
    const history = groupHistoryReadings(readings);
    expect(buildChartRows(history, "temperature", () => "12:00:00 UTC")).toEqual([
      {
        timestamp: Date.parse("2026-04-20T12:00:00.000Z"),
        label: "12:00:00 UTC",
        "sensor-01": 22,
        "sensor-02": 24,
      },
    ]);
  });

  it("preserves the newest timestamp", () => {
    const current = new Date("2026-04-20T12:00:10.000Z");
    const older = new Date("2026-04-20T12:00:00.000Z");
    const newer = new Date("2026-04-20T12:00:20.000Z");

    expect(newestTimestamp(current, older)).toBe(current);
    expect(newestTimestamp(current, newer)).toBe(newer);
  });
});
