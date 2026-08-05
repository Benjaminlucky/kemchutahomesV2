import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SafeImage } from "./SafeImage";

// vitest.config.ts doesn't set `globals: true`, so Testing Library never
// registers its own afterEach — see the same note in Avatar.test.tsx.
afterEach(cleanup);

const GOOD = "https://res.cloudinary.com/demo/image/upload/estate.jpg";
const OTHER = "https://res.cloudinary.com/demo/image/upload/other.jpg";

describe("SafeImage", () => {
  it("renders the image while the src loads fine", () => {
    render(<SafeImage src={GOOD} alt="Palm Estate" width={100} height={100} />);

    const img = screen.getByAltText("Palm Estate");
    // next/image rewrites src through the optimizer, so assert on the
    // underlying URL rather than an exact match.
    expect(img.getAttribute("src")).toContain("res.cloudinary.com");
  });

  it("renders the placeholder instead of an <img> when src is empty", () => {
    render(<SafeImage src="" alt="Palm Estate" width={100} height={100} />);

    expect(screen.queryByAltText("Palm Estate")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Palm Estate" })).toBeInTheDocument();
  });

  it("swaps in the placeholder once the image fails to load", () => {
    render(<SafeImage src={GOOD} alt="Palm Estate" width={100} height={100} />);

    fireEvent.error(screen.getByAltText("Palm Estate"));

    expect(screen.queryByAltText("Palm Estate")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Palm Estate" })).toBeInTheDocument();
  });

  it("forwards onError so a caller can clear its own loading skeleton", () => {
    const onError = vi.fn();
    render(<SafeImage src={GOOD} alt="Palm Estate" width={100} height={100} onError={onError} />);

    fireEvent.error(screen.getByAltText("Palm Estate"));

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("recovers when the src changes after a failure", () => {
    // The lightbox keeps one instance and pages through images; a boolean
    // `failed` flag would latch on and hide every later photo.
    const { rerender } = render(<SafeImage src={GOOD} alt="Palm Estate" width={100} height={100} />);

    fireEvent.error(screen.getByAltText("Palm Estate"));
    expect(screen.queryByAltText("Palm Estate")).not.toBeInTheDocument();

    rerender(<SafeImage src={OTHER} alt="Palm Estate" width={100} height={100} />);

    expect(screen.getByAltText("Palm Estate")).toBeInTheDocument();
  });

  it("hides the decorative placeholder from screen readers", () => {
    render(<SafeImage src="" alt="" width={100} height={100} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("stretches the placeholder over the parent box for fill images", () => {
    render(<SafeImage src="" alt="Palm Estate" fill />);

    expect(screen.getByRole("img", { name: "Palm Estate" })).toHaveClass("absolute", "inset-0");
  });
});
