import { describe, it, expect } from "vitest";

import { normalizePhone, validatePhone, validateName } from "./validation";

describe("normalizePhone()", () => {
  it("하이픈 제거", () => {
    expect(normalizePhone("010-1234-5678")).toBe("01012345678");
  });

  it("숫자만 있으면 그대로", () => {
    expect(normalizePhone("01012345678")).toBe("01012345678");
  });

  it("공백 제거", () => {
    expect(normalizePhone("010 1234 5678")).toBe("01012345678");
  });
});

describe("validatePhone()", () => {
  it("유효한 번호", () => {
    expect(validatePhone("01012345678")).toBe(true);
  });

  it("010이 아닌 번호 거부", () => {
    expect(validatePhone("01112345678")).toBe(false);
  });

  it("자릿수 부족 거부", () => {
    expect(validatePhone("0101234567")).toBe(false);
  });

  it("자릿수 초과 거부", () => {
    expect(validatePhone("010123456789")).toBe(false);
  });

  it("빈 문자열 거부", () => {
    expect(validatePhone("")).toBe(false);
  });
});

describe("validateName()", () => {
  it("유효한 이름", () => {
    expect(validateName("홍길동")).toBe(true);
  });

  it("앞뒤 공백 trim 후 검증", () => {
    expect(validateName("  홍길동  ")).toBe(true);
  });

  it("빈 문자열 거부", () => {
    expect(validateName("")).toBe(false);
  });

  it("공백만 있으면 거부", () => {
    expect(validateName("   ")).toBe(false);
  });

  it("30자 이름 허용", () => {
    expect(validateName("가".repeat(30))).toBe(true);
  });

  it("31자 이름 거부", () => {
    expect(validateName("가".repeat(31))).toBe(false);
  });
});
