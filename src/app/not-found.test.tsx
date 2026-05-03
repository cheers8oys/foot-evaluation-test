import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound", () => {
  it("오류 안내와 홈 이동 CTA를 렌더한다", () => {
    render(<NotFound />);

    expect(screen.getByText("페이지를 찾을 수 없어요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "홈으로 이동" })).toHaveAttribute("href", "/");
  });
});
