import { render } from "@testing-library/react";
import { it } from "vitest";
import { BrowserRouter } from "react-router-dom";
import App from "../../src/App";

it("renders without crashing", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
});
