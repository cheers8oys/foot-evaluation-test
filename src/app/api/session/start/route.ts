import { NextResponse } from "next/server";
import { createStartToken, SessionTokenConfigError } from "@/lib/quiz/token";

export async function POST() {
  try {
    const { startToken, expiresAt } = await createStartToken();

    return NextResponse.json({
      ok: true,
      startToken,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof SessionTokenConfigError) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "SUBMIT_FAILED",
          message: "서버 설정이 올바르지 않습니다.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        errorCode: "SUBMIT_FAILED",
        message: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
