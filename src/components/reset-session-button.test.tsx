import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ResetSessionButton } from "./reset-session-button";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockClearTestSession = vi.fn();
vi.mock("@/lib/quiz/storage", () => ({
  clearTestSession: (...args: unknown[]) => mockClearTestSession(...args),
}));

describe("ResetSessionButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("클릭 시 세션을 초기화하고 홈으로 이동한다", () => {
    render(<ResetSessionButton label="처음부터 다시 하기" />);

    fireEvent.click(screen.getByRole("button", { name: "처음부터 다시 하기" }));

    expect(mockClearTestSession).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
