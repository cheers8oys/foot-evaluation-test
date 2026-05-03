import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  it("개인정보 처리방침 필수 항목을 렌더한다", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("수집 항목")).toBeInTheDocument();
    expect(screen.getByText("이용 목적")).toBeInTheDocument();
    expect(screen.getByText("보유 기간")).toBeInTheDocument();
    expect(screen.getByText("수신 거부 방법")).toBeInTheDocument();
    expect(screen.getByText("문의처")).toBeInTheDocument();
  });
});
