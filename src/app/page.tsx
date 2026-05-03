"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTRO_COPY } from "@/lib/constants/copy";
import { clearTestSession, saveSessionStart } from "@/lib/quiz/storage";

type StartSessionResponse =
  | {
      ok: true;
      startToken: string;
      expiresAt: string;
    }
  | {
      ok: false;
      errorCode: string;
      message: string;
    };

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleStart() {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/session/start", { method: "POST" });
      const payload = (await res.json()) as StartSessionResponse;

      if (!res.ok || !payload.ok) {
        throw new Error(
          payload.ok === false
            ? payload.message
            : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }

      const { startToken } = payload;
      clearTestSession();
      saveSessionStart(startToken);
      router.push("/quiz/1");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }

  return (
    <main className="app-shell">
      <div className="app-shell__frame">
        <header className="app-shell__header">
          <p className="app-shell__eyebrow">{INTRO_COPY.brandName}</p>
          <h1 className="app-shell__title">{INTRO_COPY.title}</h1>
          <p className="app-shell__description">{INTRO_COPY.subtitle}</p>
          <p className="intro-page__time-estimate">{INTRO_COPY.estimatedTime}</p>
        </header>
        <section className="app-shell__content">
          <div className="intro-page__cta-area">
            <button
              type="button"
              className="btn btn--primary"
              disabled={status === "loading"}
              onClick={handleStart}
            >
              {status === "loading" ? "시작하는 중…" : INTRO_COPY.ctaLabel}
            </button>
            {status === "error" && (
              <p className="intro-page__error">{errorMessage ?? INTRO_COPY.genericError}</p>
            )}
          </div>
          <a href="/privacy" className="intro-page__privacy-link">
            개인정보 처리방침
          </a>
        </section>
      </div>
    </main>
  );
}
