import type { Answer, Answers, DiagnosisResult } from "@/lib/types";

const KEYS = {
  startedAt: "siztank_test_started_at",
  startToken: "siztank_start_token",
  answers: "siztank_answers",
  result: "siztank_result",
} as const;

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function isClientSessionExpired(startedAt: string): boolean {
  const started = new Date(startedAt).getTime();
  return Date.now() - started >= SESSION_TIMEOUT_MS;
}

export type SessionState = {
  startedAt: string | null;
  startToken: string | null;
  answers: Partial<Answers> | null;
  result: DiagnosisResult | null;
};

export function getSessionState(): SessionState {
  const startedAt = safeGet(KEYS.startedAt);
  const startToken = safeGet(KEYS.startToken);
  const answersRaw = safeGet(KEYS.answers);
  const resultRaw = safeGet(KEYS.result);

  let answers: Partial<Answers> | null = null;
  try {
    if (answersRaw) answers = JSON.parse(answersRaw) as Partial<Answers>;
  } catch {
    answers = null;
  }

  let result: DiagnosisResult | null = null;
  try {
    if (resultRaw) result = JSON.parse(resultRaw) as DiagnosisResult;
  } catch {
    result = null;
  }

  return { startedAt, startToken, answers, result };
}

export function setAnswer(step: number, answer: Answer): void {
  if (typeof window === "undefined") return;
  const key = `q${step}` as keyof Answers;
  const raw = sessionStorage.getItem(KEYS.answers);
  let current: Partial<Answers> = {};
  try {
    if (raw) current = JSON.parse(raw) as Partial<Answers>;
  } catch {
    current = {};
  }
  sessionStorage.setItem(KEYS.answers, JSON.stringify({ ...current, [key]: answer }));
}

export function saveSessionStart(startToken: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEYS.startedAt, new Date().toISOString());
  sessionStorage.setItem(KEYS.startToken, startToken);
}

export function saveResult(result: DiagnosisResult): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEYS.result, JSON.stringify(result));
}

export function clearTestSession(): void {
  if (typeof window === "undefined") return;
  Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
}

export function getEarliestUnansweredStep(answers: Partial<Answers> | null): number {
  if (!answers) return 1;
  for (let step = 1; step <= 8; step++) {
    if (!answers[`q${step}` as keyof Answers]) return step;
  }
  return 9;
}
