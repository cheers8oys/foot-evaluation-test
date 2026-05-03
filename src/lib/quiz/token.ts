import { SignJWT, errors, jwtVerify } from "jose";

export const SESSION_TOKEN_TTL_MS = 30 * 60 * 1000;
export const MINIMUM_SUBMIT_DELAY_MS = 15 * 1000;

export class SessionTokenConfigError extends Error {
  constructor() {
    super("SESSION_TOKEN_SECRET is not configured.");
    this.name = "SessionTokenConfigError";
  }
}

export class InvalidStartTokenError extends Error {
  constructor() {
    super("Invalid start token.");
    this.name = "InvalidStartTokenError";
  }
}

export class ExpiredStartTokenError extends Error {
  constructor() {
    super("Expired start token.");
    this.name = "ExpiredStartTokenError";
  }
}

type VerifiedStartToken = {
  startedAt: string;
  expiresAt: string;
};

function getSessionTokenSecret(): Uint8Array {
  const secret = process.env.SESSION_TOKEN_SECRET;

  if (!secret) {
    throw new SessionTokenConfigError();
  }

  return new TextEncoder().encode(secret);
}

export async function createStartToken(now: Date = new Date()): Promise<{
  startToken: string;
  startedAt: string;
  expiresAt: string;
}> {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const expiresAtUnix = issuedAt + SESSION_TOKEN_TTL_MS / 1000;
  const startedAt = now.toISOString();

  const startToken = await new SignJWT({ startedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expiresAtUnix)
    .sign(getSessionTokenSecret());

  return {
    startToken,
    startedAt,
    expiresAt: new Date(expiresAtUnix * 1000).toISOString(),
  };
}

export async function verifyStartToken(
  token: string,
  now: Date = new Date(),
): Promise<VerifiedStartToken> {
  try {
    const { payload } = await jwtVerify(token, getSessionTokenSecret(), {
      algorithms: ["HS256"],
      currentDate: now,
    });

    if (typeof payload.startedAt !== "string" || typeof payload.exp !== "number") {
      throw new InvalidStartTokenError();
    }

    return {
      startedAt: payload.startedAt,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    };
  } catch (error) {
    if (error instanceof ExpiredStartTokenError || error instanceof InvalidStartTokenError) {
      throw error;
    }
    if (error instanceof errors.JWTExpired) {
      throw new ExpiredStartTokenError();
    }
    if (error instanceof SessionTokenConfigError) {
      throw error;
    }

    throw new InvalidStartTokenError();
  }
}
