import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./contact-form";

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockGetSessionState = vi.fn();
const mockGetEarliestUnansweredStep = vi.fn();
const mockClearTestSession = vi.fn();
const mockIsClientSessionExpired = vi.fn();
vi.mock("@/lib/quiz/storage", () => ({
  getSessionState: (...args: unknown[]) => mockGetSessionState(...args),
  getEarliestUnansweredStep: (...args: unknown[]) => mockGetEarliestUnansweredStep(...args),
  clearTestSession: (...args: unknown[]) => mockClearTestSession(...args),
  isClientSessionExpired: (...args: unknown[]) => mockIsClientSessionExpired(...args),
}));

function validSession() {
  return {
    startToken: "start-token",
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

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSessionState.mockReturnValue(validSession());
    mockGetEarliestUnansweredStep.mockReturnValue(9);
    mockIsClientSessionExpired.mockReturnValue(false);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("초기에는 제출 버튼이 비활성화된다", () => {
    render(<ContactForm />);

    expect(screen.getByRole("button", { name: "결과지 받기" })).toBeDisabled();
  });

  it("유효한 값 입력 후 제출 버튼이 활성화된다", () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText("이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByPlaceholderText("010-XXXX-XXXX"), {
      target: { value: "01012345678" },
    });
    fireEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByDisplayValue("010-1234-5678")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "결과지 받기" })).not.toBeDisabled();
  });

  it("성공 응답이면 submitted 화면으로 이동한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        status: "created",
        resultUrl: "/result?primary=default&cases=default",
        messageSent: false,
      }),
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText("이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByPlaceholderText("010-XXXX-XXXX"), {
      target: { value: "01012345678" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "결과지 받기" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/quiz/submitted?status=created&url=%2Fresult%3Fprimary%3Ddefault%26cases%3Ddefault",
      );
    });
  });

  it("서버 검증 오류는 inline으로 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        errorCode: "INVALID_PHONE",
        message: "휴대폰 번호를 다시 확인해 주세요.",
      }),
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText("이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByPlaceholderText("010-XXXX-XXXX"), {
      target: { value: "01012345678" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "결과지 받기" }));

    expect(await screen.findByText("휴대폰 번호를 다시 확인해 주세요.")).toBeInTheDocument();
  });

  it("토큰 오류면 처음부터 다시 버튼을 표시한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        errorCode: "TOKEN_EXPIRED",
        message: "테스트 정보가 만료되었습니다. 처음부터 다시 진행해 주세요.",
      }),
    });

    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText("이름"), { target: { value: "홍길동" } });
    fireEvent.change(screen.getByPlaceholderText("010-XXXX-XXXX"), {
      target: { value: "01012345678" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "결과지 받기" }));

    const resetButton = await screen.findByRole("button", { name: "처음부터 다시 진행하기" });
    fireEvent.click(resetButton);

    expect(mockClearTestSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("직접 접근이 유효하지 않으면 홈으로 이동한다", () => {
    mockGetEarliestUnansweredStep.mockReturnValue(3);

    render(<ContactForm />);

    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
