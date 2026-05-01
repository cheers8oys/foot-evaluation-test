import { describe, it, expect } from "vitest";

import { QUESTIONS, TOTAL_STEPS } from "./questions";

describe("QUESTIONS", () => {
  it("8개 문항이 있다", () => {
    expect(QUESTIONS).toHaveLength(8);
    expect(TOTAL_STEPS).toBe(8);
  });

  it("step이 1~8 순서로 정렬되어 있다", () => {
    QUESTIONS.forEach((q, i) => {
      expect(q.step).toBe(i + 1);
    });
  });

  it("모든 문항에 text, optionA, optionB가 있다", () => {
    QUESTIONS.forEach((q) => {
      expect(q.text.length).toBeGreaterThan(0);
      expect(q.optionA.length).toBeGreaterThan(0);
      expect(q.optionB.length).toBeGreaterThan(0);
    });
  });
});
