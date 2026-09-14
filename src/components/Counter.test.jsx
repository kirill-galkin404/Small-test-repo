import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

describe("Counter", () => {
  it("renders the initial title with 0 clicks and value 0", () => {
    render(<Counter />);
    expect(screen.getByText("Counter (0 clicks)")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("updates the click-count title text across multiple dispatches", () => {
    const { container } = render(<Counter />);

    fireEvent.click(container.querySelector('[data-action="INCREMENT"]'));
    expect(screen.getByText("Counter (1 clicks)")).toBeInTheDocument();
    expect(document.title).toBe("Counter (1 clicks)");

    fireEvent.click(container.querySelector('[data-action="DOUBLE"]'));
    expect(screen.getByText("Counter (2 clicks)")).toBeInTheDocument();
    expect(document.title).toBe("Counter (2 clicks)");

    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]'));
    expect(screen.getByText("Counter (3 clicks)")).toBeInTheDocument();
    expect(document.title).toBe("Counter (3 clicks)");

    fireEvent.click(container.querySelector('[data-action="DECREMENT"]'));
    expect(screen.getByText("Counter (4 clicks)")).toBeInTheDocument();
    expect(document.title).toBe("Counter (4 clicks)");

    fireEvent.click(container.querySelector('[data-action="RESET"]'));
    expect(screen.getByText("Counter (5 clicks)")).toBeInTheDocument();
    expect(document.title).toBe("Counter (5 clicks)");
  });

  it("updates the displayed value for INCREMENT, DOUBLE, ADD_FOUR, DECREMENT, RESET", () => {
    const { container } = render(<Counter />);

    fireEvent.click(container.querySelector('[data-action="INCREMENT"]'));
    expect(screen.getByText("1")).toBeInTheDocument();

    fireEvent.click(container.querySelector('[data-action="DOUBLE"]'));
    expect(screen.getByText("2")).toBeInTheDocument();

    fireEvent.click(container.querySelector('[data-action="ADD_FOUR"]'));
    expect(screen.getByText("6")).toBeInTheDocument();

    fireEvent.click(container.querySelector('[data-action="DECREMENT"]'));
    expect(screen.getByText("5")).toBeInTheDocument();

    fireEvent.click(container.querySelector('[data-action="RESET"]'));
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("applies the high color token once the value exceeds 10", () => {
    const { container } = render(<Counter />);
    const valueEl = container.querySelector("#d");

    for (let i = 0; i < 11; i += 1) {
      fireEvent.click(container.querySelector('[data-action="INCREMENT"]'));
    }

    expect(screen.getByText("11")).toBeInTheDocument();
    expect(valueEl.style.color).toBe("var(--color-value-high)");
  });

  it("applies the low color token once the value drops below 0", () => {
    const { container } = render(<Counter />);
    const valueEl = container.querySelector("#d");

    fireEvent.click(container.querySelector('[data-action="DECREMENT"]'));

    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(valueEl.style.color).toBe("var(--color-value-low)");
  });
});
