import { describe, expect, it } from "vitest";
import { ingestSchema } from "@/server/validation";

const payload = {
  deviceId: "sensor-01",
  location: "north-wing",
  temperature: 22,
  humidity: 55,
  timestamp: "2026-04-20T12:00:00.000Z",
};

describe("ingestSchema", () => {
  it("accepts simulator-compatible payloads", () => {
    expect(ingestSchema.safeParse(payload).success).toBe(true);
  });

  it("rejects impossible humidity values", () => {
    expect(ingestSchema.safeParse({ ...payload, humidity: -1 }).success).toBe(false);
    expect(ingestSchema.safeParse({ ...payload, humidity: 101 }).success).toBe(false);
  });

  it("rejects unrealistic temperature values", () => {
    expect(ingestSchema.safeParse({ ...payload, temperature: -41 }).success).toBe(false);
    expect(ingestSchema.safeParse({ ...payload, temperature: 81 }).success).toBe(false);
  });

  it("requires strict ISO timestamps", () => {
    expect(ingestSchema.safeParse({ ...payload, timestamp: "not-a-date" }).success).toBe(false);
  });
});
