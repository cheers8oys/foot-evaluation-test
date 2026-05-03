import { NextResponse } from "next/server";
import { ERROR_MESSAGES } from "@/lib/constants/copy";
import {
  SubmitValidationError,
  buildSubmitSuccessResponse,
  validateSubmitPayload,
} from "@/lib/quiz/submit";
import { SessionTokenConfigError } from "@/lib/quiz/token";

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
    return NextResponse.json(buildSubmitSuccessResponse(submission.result));
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

    if (error instanceof SessionTokenConfigError) {
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
        errorCode: "SUBMIT_FAILED",
        message: ERROR_MESSAGES.SUBMIT_FAILED,
      },
      { status: 500 },
    );
  }
}
