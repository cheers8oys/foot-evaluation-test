// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ExpiredStartTokenError,
  SessionTokenConfigError,
  createStartToken,
  verifyStartToken,
} from "./token";

describe("start token", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("토큰을 발급하고 검증한다", async () => {
    vi.stubEnv("SESSION_TOKEN_SECRET", "test-secret");
    const now = new Date("2026-05-01T12:00:00.000Z");

    const created = await createStartToken(now);
    const verified = await verifyStartToken(created.startToken, now);

    expect(verified.startedAt).toBe(created.startedAt);
    expect(verified.expiresAt).toBe(created.expiresAt);
  });

  it("만료된 토큰은 ExpiredStartTokenError", async () => {
    vi.stubEnv("SESSION_TOKEN_SECRET", "test-secret");
    const created = await createStartToken(new Date("2026-05-01T12:00:00.000Z"));

    await expect(
      verifyStartToken(created.startToken, new Date("2026-05-01T12:31:00.000Z")),
    ).rejects.toBeInstanceOf(ExpiredStartTokenError);
  });

  it("비밀키가 없으면 SessionTokenConfigError", async () => {
    vi.stubEnv("SESSION_TOKEN_SECRET", "");

    await expect(createStartToken(new Date("2026-05-01T12:00:00.000Z"))).rejects.toBeInstanceOf(
      SessionTokenConfigError,
    );
  });
});
