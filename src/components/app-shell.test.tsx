import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@/components/app-shell";

describe("AppShell", () => {
  it("renders shared title, description, and content", () => {
    render(
      <AppShell title="Shared Screen" description="Shared description">
        <div>Inner content</div>
      </AppShell>,
    );

    expect(screen.getByRole("heading", { name: "Shared Screen" })).toBeInTheDocument();
    expect(screen.getByText("Shared description")).toBeInTheDocument();
    expect(screen.getByText("Inner content")).toBeInTheDocument();
  });
});
