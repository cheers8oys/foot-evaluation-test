import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QuizAnalyzing, ANALYZING_DELAY_MS } from "./quiz-analyzing";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockDiagnose = vi.fn();
vi.mock("@/lib/quiz/diagnose", () => ({
  diagnose: (...args: unknown[]) => mockDiagnose(...args),
}));

const mockGetSessionState = vi.fn();
const mockGetEarliestUnansweredStep = vi.fn();
const mockSaveResult = vi.fn();
const mockClearTestSession = vi.fn();
const mockIsClientSessionExpired = vi.fn();
vi.mock("@/lib/quiz/storage", () => ({
  getSessionState: (...args: unknown[]) => mockGetSessionState(...args),
  getEarliestUnansweredStep: (...args: unknown[]) => mockGetEarliestUnansweredStep(...args),
  saveResult: (...args: unknown[]) => mockSaveResult(...args),
  clearTestSession: (...args: unknown[]) => mockClearTestSession(...args),
  isClientSessionExpired: (...args: unknown[]) => mockIsClientSessionExpired(...args),
}));

function fullSession() {
  return {
    startToken: "token",
    startedAt: new Date().toISOString(),
    answers: {
      q1: "A",
      q2: "A",
      q3: "A",
      q4: "A",
      q5: "A",
      q6: "A",
      q7: "A",
      q8: "A",
    },
    result: { primaryCase: "default", matchedCases: ["default"] },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockGetSessionState.mockReturnValue(fullSession());
  mockGetEarliestUnansweredStep.mockReturnValue(9);
  mockIsClientSessionExpired.mockReturnValue(false);
  mockDiagnose.mockReturnValue({ primaryCase: "default", matchedCases: ["default"] });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("QuizAnalyzing", () => {
  it("분석 문구와 spinner를 렌더링한다", () => {
    render(<QuizAnalyzing />);

    expect(screen.getByText("발 사용 패턴을 확인하고 있어요")).toBeInTheDocument();
    expect(screen.getByText(/대표 유형과 함께 나타난 패턴/)).toBeInTheDocument();
  });

  it("결과가 없으면 답변으로 재계산해 저장한다", () => {
    mockGetSessionState.mockReturnValue({ ...fullSession(), result: null });

    render(<QuizAnalyzing />);

    expect(mockDiagnose).toHaveBeenCalled();
    expect(mockSaveResult).toHaveBeenCalled();
  });

  it("지연 후 연락처 화면으로 이동한다", () => {
    render(<QuizAnalyzing />);

    vi.advanceTimersByTime(ANALYZING_DELAY_MS);

    expect(mockPush).toHaveBeenCalledWith("/quiz/contact");
  });

  it("답변이 부족하면 홈으로 돌려보낸다", () => {
    mockGetEarliestUnansweredStep.mockReturnValue(4);

    render(<QuizAnalyzing />);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("세션 만료 시 초기화 후 홈으로 이동한다", () => {
    mockIsClientSessionExpired.mockReturnValue(true);

    render(<QuizAnalyzing />);

    expect(mockClearTestSession).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
