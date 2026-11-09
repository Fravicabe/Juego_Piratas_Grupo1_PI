import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "../../src/ui/components/Sidebar";

it("renders 6 navigation links", () => {
  render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(6);
});

it("has pirate theme responsive width w-48", () => {
  render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
  const nav = screen.getByRole("navigation");
  expect(nav.className).toContain("w-48");
});
