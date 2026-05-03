import { NextResponse } from "next/server";
import { ERROR_MESSAGES } from "@/lib/constants/copy";
import { SheetsConfigError, createSheetsClient, getSheetsConfig } from "@/lib/sheets/client";
import { createSheetsRepository } from "@/lib/sheets/repository";
import {
  SubmitValidationError,
  buildSubmitSuccessResponse,
  validateSubmitPayload,
} from "@/lib/quiz/submit";
import { SessionTokenConfigError } from "@/lib/quiz/token";

function toKSTISOString(date: Date): string {
  const kstOffset = 9 * 60;
  const kstDate = new Date(date.getTime() + kstOffset * 60 * 1000);
  return kstDate.toISOString().replace("Z", "+09:00");
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "INVALID_ANSWERS",
        message: ERROR_MESSAGES.INVALID_ANSWERS,
      },
      { status: 400 },
    );
  }

  try {
    const submission = await validateSubmitPayload(body);

    const config = getSheetsConfig();
    const sheets = createSheetsClient(config);
    const repo = createSheetsRepository(sheets, config);

    const existing = await repo.findByPhone(submission.normalizedPhone);

    if (existing) {
      const resultUrl = `/result?primary=${existing.resultType}&cases=${existing.resultType}`;
      return NextResponse.json(
        buildSubmitSuccessResponse(submission.result, "duplicate", resultUrl),
      );
    }

    await repo.appendRow({
      createdAt: toKSTISOString(new Date()),
      name: submission.name,
      phone: submission.normalizedPhone,
      resultType: submission.result.primaryCase,
      consentVersion: submission.consentVersion,
    });

    return NextResponse.json(buildSubmitSuccessResponse(submission.result, "created"));
  } catch (error) {
    if (error instanceof SubmitValidationError) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: error.code,
          message: error.message,
        },
        { status: error.status },
      );
    }

    if (error instanceof SessionTokenConfigError || error instanceof SheetsConfigError) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "SUBMIT_FAILED",
          message: ERROR_MESSAGES.SUBMIT_FAILED,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: "SHEET_WRITE_FAILED",
        message: ERROR_MESSAGES.SHEET_WRITE_FAILED,
      },
      { status: 500 },
    );
  }
}
