import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Button from "../../src/ui/components/Button";
import Card from "../../src/ui/components/Card";
import Modal from "../../src/ui/components/Modal";
import ProgressBar from "../../src/ui/components/ProgressBar";
import ResourceBar from "../../src/ui/components/ResourceBar";

afterEach(() => {
  cleanup();
  document.body.style.overflow = "unset";
});

describe("Button", () => {
  it("renders its label and fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Zarpar</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Zarpar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Zarpar
      </Button>,
    );

    const button = screen.getByRole("button", {
      name: "Zarpar",
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes an accessible label", () => {
    render(<Button ariaLabel="Cerrar diálogo">✕</Button>);

    expect(screen.getByRole("button", { name: "Cerrar diálogo" })).toBeTruthy();
  });
});

describe("Card", () => {
  it("renders the title and its children", () => {
    render(
      <Card title="Inventario">
        <p>Madera</p>
      </Card>,
    );

    expect(screen.getByText("Inventario")).toBeTruthy();
    expect(screen.getByText("Madera")).toBeTruthy();
  });

  it("works without a title", () => {
    render(
      <Card>
        <p>Contenido</p>
      </Card>,
    );

    expect(screen.getByText("Contenido")).toBeTruthy();
  });
});

describe("ProgressBar", () => {
  it("exposes its value through ARIA and shows the default label", () => {
    render(<ProgressBar current={25} max={100} />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("25");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(screen.getByText("25 / 100")).toBeTruthy();
  });

  it("clamps values above the maximum and honours a custom label", () => {
    render(<ProgressBar current={150} max={100} label="100 / 100 XP" />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(screen.getByText("100 / 100 XP")).toBeTruthy();
  });
});

describe("ResourceBar", () => {
  it("renders the icon, the floored amount and the label", () => {
    render(<ResourceBar id="wood" amount={12.9} label="Madera" />);

    expect(screen.getByText("🪵")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("Madera")).toBeTruthy();
  });

  it("falls back to a generic icon for unknown resources", () => {
    render(<ResourceBar id="obsidian" amount={1} label="Obsidiana" />);

    expect(screen.getByText("📦")).toBeTruthy();
  });
});

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Aviso">
        Contenido
      </Modal>,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders an accessible dialog with the title and children", () => {
    render(
      <Modal isOpen onClose={() => {}} title="Aviso">
        Contenido
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Aviso" })).toBeTruthy();
    expect(screen.getByText("Contenido")).toBeTruthy();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes from the close button and the Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Aviso">
        Contenido
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("closes when the overlay is clicked but not the dialog itself", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Aviso">
        Contenido
      </Modal>,
    );

    fireEvent.click(screen.getByText("Contenido"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("dialog", { name: "Aviso" }).parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
