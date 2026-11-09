import { it } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "../../src/App";
import { it } from "vitest";

it("renders without crashing", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
