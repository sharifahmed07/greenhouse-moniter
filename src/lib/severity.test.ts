import { describe, expect, it } from "vitest";
import { getSeverity } from "@/lib/severity";

describe("getSeverity", () => {
  it("keeps normal values normal", () => {
    expect(getSeverity(18, 40)).toBe("normal");
    expect(getSeverity(30, 70)).toBe("normal");
  });

  it("marks boundary-adjacent temperature values as warning", () => {
    expect(getSeverity(16, 55)).toBe("warning");
    expect(getSeverity(17.99, 55)).toBe("warning");
    expect(getSeverity(30.01, 55)).toBe("warning");
    expect(getSeverity(32, 55)).toBe("warning");
  });

  it("marks out-of-range temperature values as critical", () => {
    expect(getSeverity(15.99, 55)).toBe("critical");
    expect(getSeverity(32.01, 55)).toBe("critical");
  });

  it("uses the worst humidity severity", () => {
    expect(getSeverity(22, 30)).toBe("warning");
    expect(getSeverity(22, 80)).toBe("warning");
    expect(getSeverity(22, 29.99)).toBe("critical");
    expect(getSeverity(22, 80.01)).toBe("critical");
  });
});
