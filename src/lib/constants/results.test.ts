import { describe, it, expect } from "vitest";

import { RESULTS, CASE_PRIORITY } from "./results";

const ALL_CASE_IDS = ["case1", "case2", "case3", "case4", "default"] as const;

describe("RESULTS", () => {
  it("5개 케이스가 모두 정의되어 있다", () => {
    ALL_CASE_IDS.forEach((id) => {
      expect(RESULTS[id]).toBeDefined();
    });
  });

  it("각 케이스에 필수 필드가 있다", () => {
    ALL_CASE_IDS.forEach((id) => {
      const r = RESULTS[id];
      expect(r.name.length).toBeGreaterThan(0);
      expect(r.headline.length).toBeGreaterThan(0);
      expect(r.bodySignals.length).toBeGreaterThan(0);
    });
  });

  it("CASE_PRIORITY는 5개 항목을 포함한다", () => {
    expect(CASE_PRIORITY).toHaveLength(5);
    ALL_CASE_IDS.forEach((id) => {
      expect(CASE_PRIORITY).toContain(id);
    });
  });

  it("exerciseUrl, productUrl은 null 또는 string이다", () => {
    ALL_CASE_IDS.forEach((id) => {
      const r = RESULTS[id];
      expect(r.exerciseUrl === null || typeof r.exerciseUrl === "string").toBe(true);
      expect(r.productUrl === null || typeof r.productUrl === "string").toBe(true);
    });
  });
});
