import { describe, it, expect, beforeEach } from "vitest";

import {
  isClientSessionExpired,
  getSessionState,
  setAnswer,
  saveSessionStart,
  saveResult,
  clearTestSession,
  getEarliestUnansweredStep,
} from "./storage";
import type { Answers, DiagnosisResult } from "@/lib/types";

beforeEach(() => {
  sessionStorage.clear();
});

describe("isClientSessionExpired()", () => {
  it("방금 시작한 세션은 만료되지 않음", () => {
    const now = new Date().toISOString();
    expect(isClientSessionExpired(now)).toBe(false);
  });

  it("31분 전 시작은 만료", () => {
    const past = new Date(Date.now() - 31 * 60 * 1000).toISOString();
    expect(isClientSessionExpired(past)).toBe(true);
  });

  it("29분 전 시작은 만료되지 않음", () => {
    const recent = new Date(Date.now() - 29 * 60 * 1000).toISOString();
    expect(isClientSessionExpired(recent)).toBe(false);
  });
});

describe("getSessionState()", () => {
  it("빈 상태에서 모두 null 반환", () => {
    const state = getSessionState();
    expect(state.startedAt).toBeNull();
    expect(state.startToken).toBeNull();
    expect(state.answers).toBeNull();
    expect(state.result).toBeNull();
  });

  it("저장된 값을 정확히 반환", () => {
    sessionStorage.setItem("siztank_test_started_at", "2026-05-01T00:00:00.000Z");
    sessionStorage.setItem("siztank_start_token", "tok-123");
    const state = getSessionState();
    expect(state.startedAt).toBe("2026-05-01T00:00:00.000Z");
    expect(state.startToken).toBe("tok-123");
  });
});

describe("setAnswer()", () => {
  it("답변을 저장한다", () => {
    setAnswer(1, "A");
    const state = getSessionState();
    expect(state.answers?.q1).toBe("A");
  });

  it("기존 답변을 덮어쓴다", () => {
    setAnswer(1, "A");
    setAnswer(1, "B");
    const state = getSessionState();
    expect(state.answers?.q1).toBe("B");
  });

  it("다른 답변은 유지된다", () => {
    setAnswer(1, "A");
    setAnswer(2, "B");
    const state = getSessionState();
    expect(state.answers?.q1).toBe("A");
    expect(state.answers?.q2).toBe("B");
  });
});

describe("saveSessionStart()", () => {
  it("startToken과 startedAt을 저장한다", () => {
    saveSessionStart("my-token");
    const state = getSessionState();
    expect(state.startToken).toBe("my-token");
    expect(state.startedAt).not.toBeNull();
  });
});

describe("saveResult()", () => {
  it("결과를 저장한다", () => {
    const result: DiagnosisResult = { primaryCase: "case2", matchedCases: ["case2", "case3"] };
    saveResult(result);
    const state = getSessionState();
    expect(state.result).toEqual(result);
  });
});

describe("clearTestSession()", () => {
  it("모든 키를 제거한다", () => {
    saveSessionStart("tok");
    setAnswer(1, "A");
    clearTestSession();
    const state = getSessionState();
    expect(state.startToken).toBeNull();
    expect(state.answers).toBeNull();
  });
});

describe("getEarliestUnansweredStep()", () => {
  it("answers가 null이면 1 반환", () => {
    expect(getEarliestUnansweredStep(null)).toBe(1);
  });

  it("q1이 없으면 1 반환", () => {
    expect(getEarliestUnansweredStep({ q2: "A" })).toBe(1);
  });

  it("q1~q3만 있으면 4 반환", () => {
    const partial: Partial<Answers> = { q1: "A", q2: "B", q3: "A" };
    expect(getEarliestUnansweredStep(partial)).toBe(4);
  });

  it("8개 모두 있으면 9 반환", () => {
    const full: Answers = {
      q1: "A",
      q2: "B",
      q3: "A",
      q4: "B",
      q5: "A",
      q6: "B",
      q7: "A",
      q8: "B",
    };
    expect(getEarliestUnansweredStep(full)).toBe(9);
  });
});
