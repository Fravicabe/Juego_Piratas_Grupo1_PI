import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../../src/ui/components/Sidebar";

function renderSidebar() {
  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );
}

describe("Sidebar", () => {
  afterEach(() => {
    cleanup();
  });

  it("links to every page, including Settings", () => {
    renderSidebar();

    expect(screen.getAllByRole("link")).toHaveLength(7);
    expect(screen.getByRole("link", { name: /Ajustes/ }).getAttribute("href")).toBe("/settings");
  });

  it("marks the active route", () => {
    render(
      <MemoryRouter initialEntries={["/map"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Mapa/ }).className).toContain("bg-gold");
  });

  it("keeps the pirate theme width", () => {
    renderSidebar();

    expect(screen.getByRole("navigation").className).toContain("w-48");
  });
});
