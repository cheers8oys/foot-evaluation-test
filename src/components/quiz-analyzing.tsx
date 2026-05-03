"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ANALYZING_COPY } from "@/lib/constants/copy";
import { diagnose } from "@/lib/quiz/diagnose";
import {
  clearTestSession,
  getEarliestUnansweredStep,
  getSessionState,
  isClientSessionExpired,
  saveResult,
} from "@/lib/quiz/storage";
import type { Answers } from "@/lib/types";

export const ANALYZING_DELAY_MS = 1500;

export function QuizAnalyzing() {
  const router = useRouter();

  useEffect(() => {
    const { startToken, startedAt, answers, result } = getSessionState();

    if (!startToken) {
      router.replace("/");
      return;
    }

    if (startedAt && isClientSessionExpired(startedAt)) {
      clearTestSession();
      router.replace("/");
      return;
    }

    if (getEarliestUnansweredStep(answers) !== 9) {
      router.replace("/");
      return;
    }

    if (!result) {
      saveResult(diagnose(answers as Answers));
    }

    const timer = window.setTimeout(() => {
      router.push("/quiz/contact");
    }, ANALYZING_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <AppShell title={ANALYZING_COPY.title} description={ANALYZING_COPY.description}>
      <div className="analyzing">
        <div className="analyzing__spinner" aria-hidden="true" />
      </div>
    </AppShell>
  );
}
