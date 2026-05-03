// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("POST /api/session/start", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("정상 토큰을 발급한다", async () => {
    vi.stubEnv("SESSION_TOKEN_SECRET", "route-secret");

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(typeof payload.startToken).toBe("string");
    expect(typeof payload.expiresAt).toBe("string");
  });

  it("비밀키가 없으면 500", async () => {
    vi.stubEnv("SESSION_TOKEN_SECRET", "");

    const response = await POST();
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.ok).toBe(false);
  });
});
