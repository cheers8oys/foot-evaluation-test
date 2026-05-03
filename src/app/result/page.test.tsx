import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ResultPage from "./page";

const mockNotFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

describe("ResultPage", () => {
  it("유효한 결과 파라미터면 대표 결과와 추가 패턴을 렌더한다", async () => {
    render(
      await ResultPage({
        searchParams: Promise.resolve({
          primary: "case2",
          cases: "case2,case3",
        }),
      }),
    );

    expect(screen.getByText("대표 발 유형")).toBeInTheDocument();
    expect(screen.getByText("발 기능 붕괴형")).toBeInTheDocument();
    expect(screen.getByText("호흡-코어 붕괴형")).toBeInTheDocument();
    expect(screen.getByText("맞춤 운동 영상은 준비 중입니다.")).toBeInTheDocument();
  });

  it("default 단독이면 추가 패턴 없음 문구를 보여준다", async () => {
    render(
      await ResultPage({
        searchParams: Promise.resolve({
          primary: "default",
          cases: "default",
        }),
      }),
    );

    expect(screen.getByText("함께 강하게 나타난 추가 패턴은 없습니다.")).toBeInTheDocument();
  });

  it("유효하지 않은 결과 파라미터면 404 처리한다", async () => {
    await expect(
      (async () =>
        ResultPage({
          searchParams: Promise.resolve({
            primary: "default",
            cases: "default,case1",
          }),
        }))(),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
