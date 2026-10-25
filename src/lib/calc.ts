// Pure calculation core — no React, no eval. Every display-visible number
// passes through roundForDisplay so IEEE-754 artifacts (0.1 + 0.2) never surface.

export type ArithmeticOperator = "+" | "-" | "*" | "/";

/** Round away float dust at 12 significant digits (calculator precision). */
export function roundForDisplay(n: number): number {
  if (!Number.isFinite(n)) return n;
  if (n === 0) return 0;
  return Number(n.toPrecision(12));
}

/** Serialize a result the same way it will be re-used as an operand. */
export function resultToString(result: number): string {
  if (!Number.isFinite(result)) return "Error";
  const r = roundForDisplay(result);
  if (
    Math.abs(r) >= 1e12 ||
    (Math.abs(r) < 1e-9 && r !== 0)
  ) {
    return r.toExponential(6).replace(/\.?0+e/, "e");
  }
  return String(r);
}

export function compute(
  prev: string,
  current: string,
  operator: ArithmeticOperator
): number | "Error" {
  const p = parseFloat(prev);
  const c = parseFloat(current);
  if (isNaN(p) || isNaN(c)) return "Error";
  switch (operator) {
    case "+":
      return roundForDisplay(p + c);
    case "-":
      return roundForDisplay(p - c);
    case "*":
      return roundForDisplay(p * c);
    case "/":
      if (c === 0) return "Error";
      return roundForDisplay(p / c);
  }
}

export type UnaryOp = "sqrt" | "sqr" | "inv";

/** Unary scientific operations applied to the current operand. */
export function applyUnary(
  input: string,
  op: UnaryOp
): number | "Error" {
  const v = parseFloat(input);
  if (isNaN(v)) return "Error";
  switch (op) {
    case "sqrt":
      if (v < 0) return "Error";
      return roundForDisplay(Math.sqrt(v));
    case "sqr":
      return roundForDisplay(v * v);
    case "inv":
      if (v === 0) return "Error";
      return roundForDisplay(1 / v);
  }
}

export const PI = "3.141592653589793";

/** Thousands-separated display formatting, matching the on-screen style. */
export function formatNumber(num: string): string {
  if (num === "Error" || num === "") return num;
  const number = parseFloat(num);
  if (isNaN(number)) return num;
  if (Math.abs(number) >= 1e12 || (Math.abs(number) < 1e-9 && number !== 0)) {
    return number.toExponential(2);
  }
  if (number === Math.floor(number)) {
    return number.toLocaleString("en-US").replace(/,/g, " ");
  }
  const formatted = parseFloat(number.toFixed(10)).toString();
  return formatted;
}
