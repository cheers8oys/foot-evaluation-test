import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QuizStep } from "./quiz-step";
import { QUESTIONS } from "@/lib/constants/questions";

vi.mock("next/image", () => ({
  default: ({ src, alt, sizes }: { src: string; alt: string; sizes?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} sizes={sizes} />
  ),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockGetSessionState = vi.fn();
const mockSetAnswer = vi.fn();
const mockSaveResult = vi.fn();
const mockClearTestSession = vi.fn();
const mockIsClientSessionExpired = vi.fn();
vi.mock("@/lib/quiz/storage", () => ({
  getSessionState: (...args: unknown[]) => mockGetSessionState(...args),
  setAnswer: (...args: unknown[]) => mockSetAnswer(...args),
  saveResult: (...args: unknown[]) => mockSaveResult(...args),
  clearTestSession: (...args: unknown[]) => mockClearTestSession(...args),
  isClientSessionExpired: (...args: unknown[]) => mockIsClientSessionExpired(...args),
}));

const mockDiagnose = vi.fn();
vi.mock("@/lib/quiz/diagnose", () => ({
  diagnose: (...args: unknown[]) => mockDiagnose(...args),
}));

const q1 = QUESTIONS[0];
const q4 = QUESTIONS[3];
const q8 = QUESTIONS[7];

function validSession(answerOverrides: Record<string, string> = {}) {
  return {
    startToken: "test-token",
    startedAt: new Date().toISOString(),
    answers: answerOverrides,
    result: null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSessionState.mockReturnValue(validSession());
  mockIsClientSessionExpired.mockReturnValue(false);
  mockDiagnose.mockReturnValue({ primaryCase: "default", matchedCases: ["default"] });
});

afterEach(() => {
  cleanup();
});

describe("QuizStep 렌더링", () => {
  it("질문 area와 question text가 렌더링된다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(screen.getByText(q1.area)).toBeInTheDocument();
    expect(screen.getByText(q1.text)).toBeInTheDocument();
  });

  it("A, B 이미지가 각각 렌더링된다 (alt 텍스트로 접근성 제공)", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(screen.getByAltText(q1.optionA)).toBeInTheDocument();
    expect(screen.getByAltText(q1.optionB)).toBeInTheDocument();
  });

  it("이미지는 기존 quiz 폴더 경로를 사용한다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(screen.getByAltText(q1.optionA)).toHaveAttribute("src", "/images/quiz/q1-a.jpg");
    expect(screen.getByAltText(q1.optionB)).toHaveAttribute("src", "/images/quiz/q1-b.jpg");
  });

  it("PC에서는 더 큰 이미지 리소스를 요청할 수 있도록 sizes를 넓게 설정한다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);

    expect(screen.getByAltText(q1.optionA)).toHaveAttribute(
      "sizes",
      "(max-width: 767px) 50vw, (max-width: 1023px) 220px, 470px",
    );
    expect(screen.getByAltText(q1.optionB)).toHaveAttribute(
      "sizes",
      "(max-width: 767px) 50vw, (max-width: 1023px) 220px, 470px",
    );
  });

  it("이미지와 하단 버튼 사이 빈 공간용 spacer를 렌더링하지 않는다", () => {
    const { container } = render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);

    expect(container.querySelector(".quiz-page__spacer")).not.toBeInTheDocument();
  });

  it("진행 표시에 stepNumber / totalSteps가 표시된다", () => {
    render(<QuizStep question={q4} stepNumber={4} totalSteps={8} />);
    expect(screen.getByText("4 / 8")).toBeInTheDocument();
  });
});

describe("QuizStep 선택 인터랙션", () => {
  it("선택 전 다음 버튼이 비활성 상태다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });

  it("카드 A(이미지) 클릭 시 choice-card--selected 클래스가 붙는다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    const cardA = screen.getByAltText(q1.optionA).closest("button")!;
    fireEvent.click(cardA);
    expect(cardA).toHaveClass("choice-card--selected");
  });

  it("카드 A 클릭 후 다음 버튼이 활성 상태가 된다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    fireEvent.click(screen.getByAltText(q1.optionA).closest("button")!);
    expect(screen.getByRole("button", { name: "다음" })).not.toBeDisabled();
  });

  it("카드 선택 시 setAnswer(stepNumber, answer)가 호출된다", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    fireEvent.click(screen.getByAltText(q1.optionB).closest("button")!);
    expect(mockSetAnswer).toHaveBeenCalledWith(1, "B");
  });

  it("mount 시 이전에 저장된 답변이 복원된다", () => {
    mockGetSessionState.mockReturnValue(validSession({ q1: "B" }));
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    const cardB = screen.getByAltText(q1.optionB).closest("button")!;
    expect(cardB).toHaveClass("choice-card--selected");
  });
});

describe("QuizStep 이전/다음 이동", () => {
  it("step 1에서 이전 클릭 시 /로 이동", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    fireEvent.click(screen.getByRole("button", { name: "←" }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("step 4에서 이전 클릭 시 /quiz/3으로 이동", () => {
    render(<QuizStep question={q4} stepNumber={4} totalSteps={8} />);
    fireEvent.click(screen.getByRole("button", { name: "←" }));
    expect(mockPush).toHaveBeenCalledWith("/quiz/3");
  });

  it("step 1 선택 후 다음 클릭 시 /quiz/2로 이동", () => {
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    fireEvent.click(screen.getByAltText(q1.optionA).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(mockPush).toHaveBeenCalledWith("/quiz/2");
  });

  it("step 8에서 결과 보기 버튼이 렌더링된다", () => {
    render(<QuizStep question={q8} stepNumber={8} totalSteps={8} />);
    expect(screen.getByRole("button", { name: "결과 보기" })).toBeInTheDocument();
  });

  it("step 8에서 선택 후 결과 보기 클릭 시 diagnose + saveResult + /quiz/analyzing 이동", () => {
    mockGetSessionState.mockReturnValue(
      validSession({ q1: "A", q2: "A", q3: "A", q4: "A", q5: "A", q6: "A", q7: "A" }),
    );
    render(<QuizStep question={q8} stepNumber={8} totalSteps={8} />);
    fireEvent.click(screen.getByAltText(q8.optionB).closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    expect(mockDiagnose).toHaveBeenCalled();
    expect(mockSaveResult).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/quiz/analyzing");
  });
});

describe("QuizStep 세션 유효성 검사", () => {
  it("startToken 없으면 / 로 replace 이동", () => {
    mockGetSessionState.mockReturnValue({ ...validSession(), startToken: null });
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("세션 만료 시 clearTestSession 호출 후 / 로 replace 이동", () => {
    mockIsClientSessionExpired.mockReturnValue(true);
    render(<QuizStep question={q1} stepNumber={1} totalSteps={8} />);
    expect(mockClearTestSession).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
