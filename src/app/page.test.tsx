import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockClearTestSession = vi.fn();
const mockSaveSessionStart = vi.fn();
vi.mock("@/lib/quiz/storage", () => ({
  clearTestSession: (...args: unknown[]) => mockClearTestSession(...args),
  saveSessionStart: (...args: unknown[]) => mockSaveSessionStart(...args),
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("시작 API 성공 시 첫 문항으로 이동한다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        startToken: "start-token",
        expiresAt: "2026-05-01T12:30:00.000Z",
      }),
    });

    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "테스트 시작하기" }));

    await waitFor(() => {
      expect(mockClearTestSession).toHaveBeenCalled();
      expect(mockSaveSessionStart).toHaveBeenCalledWith("start-token");
      expect(mockPush).toHaveBeenCalledWith("/quiz/1");
    });
  });

  it("시작 API 실패 시 서버 메시지를 보여준다", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        errorCode: "SUBMIT_FAILED",
        message: "서버 설정이 올바르지 않습니다.",
      }),
    });

    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "테스트 시작하기" }));

    expect(await screen.findByText("서버 설정이 올바르지 않습니다.")).toBeInTheDocument();
  });
});
