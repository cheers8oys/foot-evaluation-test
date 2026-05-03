import { CONSENT_VERSION } from "@/lib/constants/consent";
import { ERROR_MESSAGES } from "@/lib/constants/copy";
import type { Answer, Answers, DiagnosisResult, SubmitStatus } from "@/lib/types";

import { buildResultUrl, diagnose } from "./diagnose";
import {
  ExpiredStartTokenError,
  InvalidStartTokenError,
  MINIMUM_SUBMIT_DELAY_MS,
  verifyStartToken,
} from "./token";
import { normalizePhone, validateName, validatePhone } from "./validation";

export type SubmitErrorCode =
  | "INVALID_NAME"
  | "INVALID_PHONE"
  | "CONSENT_REQUIRED"
  | "INVALID_ANSWERS"
  | "TOKEN_REQUIRED"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "TOO_FAST";

export type SubmitRequestBody = {
  name: string;
  phone: string;
  consentChecked: boolean;
  consentVersion: string;
  startToken: string;
  answers: Partial<Answers>;
  primaryCase: string;
  matchedCases: string[];
};

export type SubmitSuccessResponse = {
  ok: true;
  status: SubmitStatus;
  resultUrl: string;
  messageSent: boolean;
  message?: string;
};

export type SubmitErrorResponse = {
  ok: false;
  errorCode: SubmitErrorCode | "SUBMIT_FAILED";
  message: string;
};

export type ValidatedSubmission = {
  name: string;
  normalizedPhone: string;
  consentVersion: string;
  answers: Answers;
  result: DiagnosisResult;
  tokenStartedAt: string;
};

export class SubmitValidationError extends Error {
  code: SubmitErrorCode;
  status: number;

  constructor(code: SubmitErrorCode, message: string, status: number = 400) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "SubmitValidationError";
  }
}

const ANSWER_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAnswer(value: unknown): value is Answer {
  return value === "A" || value === "B";
}

export function parseAnswers(answers: unknown): Answers {
  if (!isRecord(answers)) {
    throw new SubmitValidationError("INVALID_ANSWERS", ERROR_MESSAGES.INVALID_ANSWERS);
  }

  const parsed = {} as Answers;

  for (const key of ANSWER_KEYS) {
    const value = answers[key];

    if (!isAnswer(value)) {
      throw new SubmitValidationError("INVALID_ANSWERS", ERROR_MESSAGES.INVALID_ANSWERS);
    }

    parsed[key] = value;
  }

  return parsed;
}

export async function validateSubmitPayload(
  body: unknown,
  now: Date = new Date(),
): Promise<ValidatedSubmission> {
  if (!isRecord(body)) {
    throw new SubmitValidationError("INVALID_NAME", ERROR_MESSAGES.INVALID_NAME);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!validateName(name)) {
    throw new SubmitValidationError("INVALID_NAME", ERROR_MESSAGES.INVALID_NAME);
  }

  const normalizedPhone = normalizePhone(typeof body.phone === "string" ? body.phone : "");
  if (!validatePhone(normalizedPhone)) {
    throw new SubmitValidationError("INVALID_PHONE", ERROR_MESSAGES.INVALID_PHONE);
  }

  if (body.consentChecked !== true) {
    throw new SubmitValidationError("CONSENT_REQUIRED", ERROR_MESSAGES.CONSENT_REQUIRED);
  }

  const startToken = typeof body.startToken === "string" ? body.startToken : "";
  if (!startToken) {
    throw new SubmitValidationError("TOKEN_REQUIRED", ERROR_MESSAGES.TOKEN_REQUIRED);
  }

  let verifiedToken;
  try {
    verifiedToken = await verifyStartToken(startToken, now);
  } catch (error) {
    if (error instanceof ExpiredStartTokenError) {
      throw new SubmitValidationError("TOKEN_EXPIRED", ERROR_MESSAGES.TOKEN_EXPIRED, 429);
    }
    if (error instanceof InvalidStartTokenError) {
      throw new SubmitValidationError("INVALID_TOKEN", ERROR_MESSAGES.INVALID_TOKEN, 429);
    }
    throw error;
  }

  if (now.getTime() - new Date(verifiedToken.startedAt).getTime() < MINIMUM_SUBMIT_DELAY_MS) {
    throw new SubmitValidationError("TOO_FAST", ERROR_MESSAGES.TOO_FAST, 429);
  }

  const answers = parseAnswers(body.answers);
  const result = diagnose(answers);

  return {
    name,
    normalizedPhone,
    consentVersion:
      typeof body.consentVersion === "string" && body.consentVersion.trim().length > 0
        ? body.consentVersion
        : CONSENT_VERSION,
    answers,
    result,
    tokenStartedAt: verifiedToken.startedAt,
  };
}

export function buildSubmitSuccessResponse(result: DiagnosisResult): SubmitSuccessResponse {
  return {
    ok: true,
    status: "created",
    resultUrl: buildResultUrl(result),
    messageSent: false,
  };
}
