import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import QuizSubmittedPage from "./page";

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    className,
    children,
  }: {
    href: string;
    className?: string;
    children: ReactNode;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/reset-session-button", () => ({
  ResetSessionButton: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

afterEach(() => {
  cleanup();
});

describe("QuizSubmittedPage", () => {
  it("created 상태면 결과지 이동 CTA를 렌더한다", async () => {
    render(
      await QuizSubmittedPage({
        searchParams: Promise.resolve({
          status: "created",
          url: "/result?primary=case2&cases=case2,case3",
        }),
      }),
    );

    expect(screen.getByText("결과지를 보내드렸어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "결과지 보러 가기" })).toHaveAttribute(
      "href",
      "/result?primary=case2&cases=case2,case3",
    );
  });

  it("duplicate 상태면 기존 결과지 CTA를 렌더한다", async () => {
    render(
      await QuizSubmittedPage({
        searchParams: Promise.resolve({
          status: "duplicate",
          url: "/result?primary=default&cases=default",
        }),
      }),
    );

    expect(screen.getByText("이미 결과지가 발송된 번호예요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기존 결과지 보기" })).toHaveAttribute(
      "href",
      "/result?primary=default&cases=default",
    );
  });

  it("허용되지 않은 status면 404 처리한다", async () => {
    await expect(
      (async () =>
        QuizSubmittedPage({
          searchParams: Promise.resolve({
            status: "pending",
            url: "/result?primary=case2&cases=case2",
          }),
        }))(),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("검증되지 않은 url이면 404 처리한다", async () => {
    await expect(
      (async () =>
        QuizSubmittedPage({
          searchParams: Promise.resolve({
            status: "created",
            url: "/privacy",
          }),
        }))(),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
