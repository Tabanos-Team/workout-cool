import { describe, it, expect } from "vitest";

import { isObject } from "./guards";

describe("isObject", () => {
  it("returns true for plain objects", () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ name: "Richard" })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isObject(null)).toBe(false);
  });

  it("returns false for arrays", () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it("returns false for strings", () => {
    expect(isObject("hello")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isObject(123)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(isObject(true)).toBe(false);
    expect(isObject(false)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isObject(undefined)).toBe(false);
  });
});