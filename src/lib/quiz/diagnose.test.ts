import { describe, it, expect } from "vitest";

import { diagnose, buildResultUrl, validateResultParams, validateResultUrl } from "./diagnose";
import type { Answers } from "@/lib/types";

const allA: Answers = {
  q1: "A",
  q2: "A",
  q3: "A",
  q4: "A",
  q5: "A",
  q6: "A",
  q7: "A",
  q8: "A",
};

function make(overrides: Partial<Answers>): Answers {
  return { ...allA, ...overrides };
}

describe("diagnose()", () => {
  it("모두 A이면 default", () => {
    const r = diagnose(allA);
    expect(r.primaryCase).toBe("default");
    expect(r.matchedCases).toEqual(["default"]);
  });

  it("case1 조건: q1=B, q4=B, q5=B", () => {
    const r = diagnose(make({ q1: "B", q4: "B", q5: "B" }));
    expect(r.matchedCases).toContain("case1");
  });

  it("case2 조건: q2=B, q3=B, q7=B", () => {
    const r = diagnose(make({ q2: "B", q3: "B", q7: "B" }));
    expect(r.matchedCases).toContain("case2");
  });

  it("case3 조건: q5=B, q6=B", () => {
    const r = diagnose(make({ q5: "B", q6: "B" }));
    expect(r.matchedCases).toContain("case3");
  });

  it("case4 조건: q1=B, q2=B, q8=B", () => {
    const r = diagnose(make({ q1: "B", q2: "B", q8: "B" }));
    expect(r.matchedCases).toContain("case4");
  });

  it("복수 매칭 시 CASE_PRIORITY 기준으로 primaryCase 선택 (case4 > case2)", () => {
    // case4: q1=B, q2=B, q8=B / case2: q2=B, q3=B, q7=B
    const r = diagnose(make({ q1: "B", q2: "B", q3: "B", q7: "B", q8: "B" }));
    expect(r.primaryCase).toBe("case4");
    expect(r.matchedCases).toContain("case2");
    expect(r.matchedCases).toContain("case4");
  });

  it("case1과 case3 동시 매칭 시 case1이 우선", () => {
    // case1: q1=B, q4=B, q5=B / case3: q5=B, q6=B
    const r = diagnose(make({ q1: "B", q4: "B", q5: "B", q6: "B" }));
    expect(r.primaryCase).toBe("case1");
    expect(r.matchedCases).toContain("case3");
  });
});

describe("buildResultUrl()", () => {
  it("단일 케이스 URL 생성", () => {
    expect(buildResultUrl({ primaryCase: "case2", matchedCases: ["case2"] })).toBe(
      "/result?primary=case2&cases=case2",
    );
  });

  it("복수 케이스 URL 생성", () => {
    expect(buildResultUrl({ primaryCase: "case2", matchedCases: ["case2", "case3"] })).toBe(
      "/result?primary=case2&cases=case2,case3",
    );
  });

  it("default 단독 URL 생성", () => {
    expect(buildResultUrl({ primaryCase: "default", matchedCases: ["default"] })).toBe(
      "/result?primary=default&cases=default",
    );
  });
});

describe("validateResultParams()", () => {
  it("유효한 파라미터 파싱", () => {
    const r = validateResultParams("case2", "case2,case3");
    expect(r?.primaryCase).toBe("case2");
    expect(r?.matchedCases).toEqual(["case2", "case3"]);
  });

  it("primary 없으면 null", () => {
    expect(validateResultParams(null, "case2")).toBeNull();
  });

  it("cases 없으면 null", () => {
    expect(validateResultParams("case2", null)).toBeNull();
  });

  it("허용되지 않은 caseId이면 null", () => {
    expect(validateResultParams("invalid", "invalid")).toBeNull();
  });

  it("cases에 primary가 없으면 null", () => {
    expect(validateResultParams("case1", "case2,case3")).toBeNull();
  });

  it("default와 다른 케이스가 함께 있으면 null", () => {
    expect(validateResultParams("default", "default,case1")).toBeNull();
  });

  it("default 단독은 유효", () => {
    const r = validateResultParams("default", "default");
    expect(r?.primaryCase).toBe("default");
  });

  it("cases 중복이면 null", () => {
    expect(validateResultParams("case2", "case2,case2")).toBeNull();
  });
});

describe("validateResultUrl()", () => {
  it("내부 결과 URL이면 canonical 결과 URL을 반환한다", () => {
    expect(validateResultUrl("/result?primary=case2&cases=case2,case3")).toBe(
      "/result?primary=case2&cases=case2,case3",
    );
  });

  it("외부 URL이면 null", () => {
    expect(validateResultUrl("https://example.com/result?primary=case2&cases=case2")).toBeNull();
  });

  it("result가 아닌 경로면 null", () => {
    expect(validateResultUrl("/privacy?primary=case2&cases=case2")).toBeNull();
  });

  it("예상하지 않은 추가 query가 있으면 null", () => {
    expect(validateResultUrl("/result?primary=case2&cases=case2&utm_source=kakao")).toBeNull();
  });
});
