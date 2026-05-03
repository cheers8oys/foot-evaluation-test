// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION } from "@/lib/constants/consent";

import { createStartToken } from "./token";
import { SubmitValidationError, parseAnswers, validateSubmitPayload } from "./submit";

describe("submit validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function validBody() {
    vi.stubEnv("SESSION_TOKEN_SECRET", "submit-secret");
    const tokenNow = new Date("2026-05-01T12:00:00.000Z");
    const created = await createStartToken(tokenNow);

    return {
      body: {
        name: "  홍길동  ",
        phone: "010-1234-5678",
        consentChecked: true,
        consentVersion: CONSENT_VERSION,
        startToken: created.startToken,
        answers: {
          q1: "A",
          q2: "B",
          q3: "B",
          q4: "A",
          q5: "B",
          q6: "B",
          q7: "B",
          q8: "A",
        },
        primaryCase: "default",
        matchedCases: ["default"],
      },
      now: new Date("2026-05-01T12:00:20.000Z"),
    };
  }

  it("유효한 요청은 trim, 정규화, 서버 재계산을 적용한다", async () => {
    const { body, now } = await validBody();

    const validated = await validateSubmitPayload(body, now);

    expect(validated.name).toBe("홍길동");
    expect(validated.normalizedPhone).toBe("01012345678");
    expect(validated.result.primaryCase).toBe("case2");
    expect(validated.result.matchedCases).toEqual(["case2", "case3"]);
  });

  it("이름이 비어 있으면 INVALID_NAME", async () => {
    const { body, now } = await validBody();
    body.name = "   ";

    await expect(validateSubmitPayload(body, now)).rejects.toMatchObject({
      code: "INVALID_NAME",
    });
  });

  it("전화번호가 잘못되면 INVALID_PHONE", async () => {
    const { body, now } = await validBody();
    body.phone = "011-1234-5678";

    await expect(validateSubmitPayload(body, now)).rejects.toMatchObject({
      code: "INVALID_PHONE",
    });
  });

  it("동의하지 않으면 CONSENT_REQUIRED", async () => {
    const { body, now } = await validBody();
    body.consentChecked = false;

    await expect(validateSubmitPayload(body, now)).rejects.toMatchObject({
      code: "CONSENT_REQUIRED",
    });
  });

  it("토큰이 없으면 TOKEN_REQUIRED", async () => {
    const { body, now } = await validBody();
    body.startToken = "";

    await expect(validateSubmitPayload(body, now)).rejects.toMatchObject({
      code: "TOKEN_REQUIRED",
    });
  });

  it("만료된 토큰은 TOKEN_EXPIRED", async () => {
    const { body } = await validBody();

    await expect(
      validateSubmitPayload(body, new Date("2026-05-01T12:31:00.000Z")),
    ).rejects.toMatchObject({
      code: "TOKEN_EXPIRED",
    });
  });

  it("15초 미만 제출은 TOO_FAST", async () => {
    const { body } = await validBody();

    await expect(
      validateSubmitPayload(body, new Date("2026-05-01T12:00:14.000Z")),
    ).rejects.toMatchObject({
      code: "TOO_FAST",
    });
  });

  it("불완전한 답변은 INVALID_ANSWERS", async () => {
    const { body, now } = await validBody();
    const invalidBody = { ...body, answers: { q1: "A" } };

    await expect(validateSubmitPayload(invalidBody, now)).rejects.toMatchObject({
      code: "INVALID_ANSWERS",
    });
  });
});

describe("parseAnswers()", () => {
  it("8개 답변이 모두 있어야 한다", () => {
    expect(() => parseAnswers({ q1: "A" })).toThrowError(SubmitValidationError);
  });
});
