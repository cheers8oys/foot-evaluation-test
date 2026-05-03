// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION } from "@/lib/constants/consent";
import { createStartToken } from "@/lib/quiz/token";

import { POST } from "./route";

describe("POST /api/submit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function makeValidRequest() {
    vi.stubEnv("SESSION_TOKEN_SECRET", "submit-route-secret");
    const created = await createStartToken(new Date("2026-05-01T12:00:00.000Z"));

    return new Request("http://localhost/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "홍길동",
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
      }),
    });
  }

  it("정상 요청은 created 응답을 반환한다", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T12:00:20.000Z"));

    const response = await POST(await makeValidRequest());
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.status).toBe("created");
    expect(payload.resultUrl).toBe("/result?primary=case2&cases=case2,case3");

    vi.useRealTimers();
  });

  it("잘못된 이름은 INVALID_NAME", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T12:00:20.000Z"));

    const request = await makeValidRequest();
    const body = await request.json();
    body.name = "";

    const response = await POST(
      new Request("http://localhost/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.errorCode).toBe("INVALID_NAME");

    vi.useRealTimers();
  });

  it("15초 미만 제출은 TOO_FAST", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T12:00:10.000Z"));

    const response = await POST(await makeValidRequest());
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.errorCode).toBe("TOO_FAST");

    vi.useRealTimers();
  });

  it("만료된 토큰은 TOKEN_EXPIRED", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T12:31:00.000Z"));

    const response = await POST(await makeValidRequest());
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload.errorCode).toBe("TOKEN_EXPIRED");

    vi.useRealTimers();
  });
});
