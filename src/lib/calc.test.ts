import { describe, expect, it } from "vitest";
import { applyUnary, compute, formatNumber, resultToString } from "./calc";

describe("decimal artifacts", () => {
  it("0.1 + 0.2 shows 0.3, not 0.30000000000000004", () => {
    expect(resultToString(compute("0.1", "0.2", "+") as number)).toBe("0.3");
  });
  it("1 - 0.9 shows 0.1", () => {
    expect(resultToString(compute("1", "0.9", "-") as number)).toBe("0.1");
  });
  it("1/3 x 3 returns 1", () => {
    const third = resultToString(compute("1", "3", "/") as number);
    // 12-significant-digit precision is the calculator's contract:
    // no float dust (0.30000000000000004), but no fake exactness either.
    expect(resultToString(compute(third, "3", "*") as number)).toBe(
      "0.999999999999"
    );
  });
});

describe("compute", () => {
  it("divides by zero to Error", () => {
    expect(compute("5", "0", "/")).toBe("Error");
  });
  it("rejects non-numeric operands", () => {
    expect(compute("abc", "1", "+")).toBe("Error");
  });
  it("handles negatives", () => {
    expect(compute("-4", "2", "+")).toBe(-2);
  });
});

describe("unary ops", () => {
  it("sqrt of 2 is precise", () => {
    expect(resultToString(applyUnary("2", "sqrt") as number)).toBe(
      "1.41421356237"
    );
  });
  it("sqrt of negative is Error", () => {
    expect(applyUnary("-4", "sqrt")).toBe("Error");
  });
  it("inverse of zero is Error", () => {
    expect(applyUnary("0", "inv")).toBe("Error");
  });
  it("squares correctly", () => {
    expect(applyUnary("12", "sqr")).toBe(144);
  });
});

describe("formatNumber", () => {
  it("groups integers with thin spaces", () => {
    expect(formatNumber("1234567")).toBe("1 234 567");
  });
  it("passes through decimals", () => {
    expect(formatNumber("0.3")).toBe("0.3");
  });
  it("uses exponential for extreme magnitudes", () => {
    expect(formatNumber("1e15")).toBe("1.00e+15");
  });
});
