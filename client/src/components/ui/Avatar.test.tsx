import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar, getInitials, isRealPhoto } from "./Avatar";

// vitest.config.ts doesn't set `globals: true`, so Testing Library never
// registers its own afterEach — without this, renders pile up in one document
// and the multi-render cases below match elements from earlier tests.
afterEach(cleanup);

describe("isRealPhoto", () => {
  it("treats an uploaded Cloudinary URL as a real photo", () => {
    expect(isRealPhoto("https://res.cloudinary.com/demo/image/upload/a.jpg")).toBe(true);
  });

  it("treats the legacy ui-avatars.com placeholder as no photo", () => {
    expect(isRealPhoto("https://ui-avatars.com/api/?name=Ada+Obi")).toBe(false);
  });

  it("treats empty, null and undefined as no photo", () => {
    expect(isRealPhoto("")).toBe(false);
    expect(isRealPhoto(null)).toBe(false);
    expect(isRealPhoto(undefined)).toBe(false);
  });
});

describe("getInitials", () => {
  it("uppercases the first letter of each name", () => {
    expect(getInitials("ada", "obi")).toBe("AO");
  });

  it("ignores surrounding whitespace", () => {
    expect(getInitials("  ada  ", "  obi ")).toBe("AO");
  });

  it("copes with only one name present", () => {
    expect(getInitials("Ada", "")).toBe("A");
    expect(getInitials(undefined, "Obi")).toBe("O");
  });

  it("falls back to ? when there is no name at all", () => {
    expect(getInitials("", "")).toBe("?");
    expect(getInitials(null, null)).toBe("?");
  });
});

describe("Avatar", () => {
  it("renders the photo when the realtor has a real one", () => {
    render(
      <Avatar
        firstName="Ada"
        lastName="Obi"
        avatar="https://res.cloudinary.com/demo/image/upload/ada.jpg"
      />,
    );

    const img = screen.getByAltText("Ada Obi's avatar");
    expect(img).toBeInTheDocument();
    // next/image rewrites src through the optimizer, so assert on the
    // underlying URL rather than an exact src match.
    expect(img.getAttribute("src")).toContain("res.cloudinary.com");
    expect(screen.queryByText("AO")).not.toBeInTheDocument();
  });

  it("renders gradient initials when there is no photo", () => {
    render(<Avatar firstName="Ada" lastName="Obi" />);

    const initials = screen.getByText("AO");
    expect(initials).toBeInTheDocument();
    expect(initials).toHaveClass("text-white");
    expect(initials.style.background).toContain("linear-gradient(135deg");
    expect(screen.queryByRole("img", { name: /avatar$/ })).not.toBeInTheDocument();
  });

  it("renders initials rather than fetching a ui-avatars.com placeholder", () => {
    render(
      <Avatar firstName="Ada" lastName="Obi" avatar="https://ui-avatars.com/api/?name=Ada+Obi" />,
    );

    expect(screen.getByText("AO")).toBeInTheDocument();
  });

  it("applies the requested size to both the box and the glyph", () => {
    render(<Avatar firstName="Ada" lastName="Obi" size={128} />);

    const initials = screen.getByText("AO");
    expect(initials.style.width).toBe("128px");
    expect(initials.style.height).toBe("128px");
    expect(initials.style.fontSize).toBe("49px");
  });
});
