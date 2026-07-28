import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, TONES } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Allocated</Badge>);
    expect(screen.getByText("Allocated")).toBeInTheDocument();
  });

  it("defaults to the gray tone when none is given", () => {
    render(<Badge>Default</Badge>);
    for (const cls of TONES.gray.split(" ")) {
      expect(screen.getByText("Default")).toHaveClass(cls);
    }
  });

  it("applies the requested tone's classes", () => {
    render(<Badge tone="red">Rejected</Badge>);
    for (const cls of TONES.red.split(" ")) {
      expect(screen.getByText("Rejected")).toHaveClass(cls);
    }
  });
});
