import { useEffect, useRef, useState } from "react";
import "./styles.css";

function formatNumber(num: string): string {
  if (num === "Error") return num;
  const number = parseFloat(num);
  if (isNaN(number)) return num;
  if (
    Math.abs(number) >= 1000000000 ||
    (Math.abs(number) < 0.000001 && number !== 0)
  ) {
    return number.toExponential(2);
  }
  if (number === Math.floor(number)) {
    return number.toLocaleString("en-US").replace(/,/g, " ");
  } else {
    let formatted = number.toFixed(10);
    formatted = parseFloat(formatted).toString();
    return formatted;
  }
}

function getOperatorSymbol(op: string): string {
  switch (op) {
    case "+":
      return "+";
    case "-":
      return "−";
    case "*":
      return "×";
    case "/":
      return "÷";
    case "%":
      return "%";
    default:
      return op;
  }
}

type Operator = "+" | "-" | "*" | "/" | "%";

interface CalcState {
  currentInput: string;
  operator: Operator | null;
  previousInput: string | null;
  shouldResetDisplay: boolean;
  isError: boolean;
  calculationText: string;
  activeOperator: Operator | null;
}

const initialState: CalcState = {
  currentInput: "0",
  operator: null,
  previousInput: null,
  shouldResetDisplay: false,
  isError: false,
  calculationText: "",
  activeOperator: null,
};

type ArithmeticOperator = "+" | "-" | "*" | "/";

function compute(
  prev: string,
  current: string,
  operator: ArithmeticOperator
): number | "Error" {
  const p = parseFloat(prev);
  const c = parseFloat(current);
  switch (operator) {
    case "+":
      return p + c;
    case "-":
      return p - c;
    case "*":
      return p * c;
    case "/":
      if (c === 0) return "Error";
      return p / c;
  }
}

function resultToString(result: number): string {
  if (Math.abs(result) < 0.000001 && result !== 0) {
    return result.toExponential(2);
  }
  if (Math.abs(result) >= 999999999) {
    return result.toExponential(2);
  }
  if (result === Math.floor(result)) {
    return result.toString();
  }
  return parseFloat(result.toFixed(10)).toString();
}

export default function App() {
  const [state, setState] = useState<CalcState>(initialState);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);

  const pushHistory = (entry: string) =>
    setHistory((h) => [entry, ...h].slice(0, 3));

  const stateRef = useRef(state);
  stateRef.current = state;

  const clearDisplay = () => {
    setState({ ...initialState });
    setHistory([]);
  };

  const showError = () => {
    setState((s) => ({ ...s, currentInput: "Error", isError: true }));
    window.setTimeout(clearDisplay, 2000);
  };

  const calculate = () => {
    const s = stateRef.current;
    if (s.operator === null || s.shouldResetDisplay || s.operator === "%") return;
    const result = compute(s.previousInput!, s.currentInput, s.operator);
    if (result === "Error") {
      // Mirrors the original: operator/previousInput are left untouched and the
      // pending 2s timer resets the whole calculator.
      showError();
      return;
    }
    pushHistory(`${formatNumber(s.previousInput!)} ${getOperatorSymbol(s.operator)} ${formatNumber(s.currentInput)} = ${formatNumber(resultToString(result))}`);
    setState({
      ...initialState,
      currentInput: resultToString(result),
      shouldResetDisplay: true,
    });
  };

  const inputNumber = (num: string) => {
    setState((s) => {
      let currentInput = s.currentInput;
      let shouldResetDisplay = s.shouldResetDisplay;
      let isError = s.isError;
      if (currentInput === "Error") {
        // Original calls clearDisplay() first, then keeps going with a clean slate.
        currentInput = "0";
        shouldResetDisplay = false;
        isError = false;
      }
      if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
      } else {
        if (num === "." && currentInput.includes(".")) {
          return { ...s, currentInput, shouldResetDisplay, isError };
        }
        if (currentInput.length >= 9 && num !== ".") {
          return { ...s, currentInput, shouldResetDisplay, isError };
        }
        currentInput =
          currentInput === "0" && num !== "." ? num : currentInput + num;
      }
      // The original only clears the highlighted operator button; the pending
      // operator itself stays set so chained operations keep working.
      return { ...s, currentInput, shouldResetDisplay, isError, activeOperator: null };
    });
  };

  const inputOperator = (op: Operator) => {
    // Additive history bookkeeping — reads only, never alters the state machine.
    const pre = stateRef.current;
    if (op === "%") {
      pushHistory(`${formatNumber(pre.currentInput)} %`);
    } else if (!(pre.operator !== null && !pre.shouldResetDisplay && pre.operator !== "%")) {
      pushHistory(`${formatNumber(pre.currentInput)} ${getOperatorSymbol(op)}`);
    }
    setState((s) => {
      if (op === "%") {
        const current = parseFloat(s.currentInput);
        if (isNaN(current)) return s;
        return { ...s, currentInput: (current / 100).toString() };
      }
      let currentInput = s.currentInput;
      let isError = s.isError;
      if (s.operator !== null && !s.shouldResetDisplay && s.operator !== "%") {
        const result = compute(s.previousInput!, s.currentInput, s.operator);
        if (result === "Error") {
          currentInput = "Error";
          isError = true;
          window.setTimeout(clearDisplay, 2000);
        } else {
          currentInput = resultToString(result);
        }
      }      return {
        ...s,
        currentInput,
        isError,
        previousInput: currentInput,
        operator: op,
        shouldResetDisplay: true,
        activeOperator: op,
        calculationText: `${formatNumber(currentInput)} ${getOperatorSymbol(op)}`,
      };
    });
  };

  const toggleSign = () => {
    setState((s) => {
      if (s.currentInput === "0" || s.currentInput === "Error") return s;
      const currentInput = s.currentInput.startsWith("-")
        ? s.currentInput.slice(1)
        : "-" + s.currentInput;
      return { ...s, currentInput };
    });
  };

  const backspace = () => {
    setState((s) => {
      if (s.currentInput === "Error") return { ...initialState };
      const currentInput =
        s.currentInput.length > 1 ? s.currentInput.slice(0, -1) : "0";
      return { ...s, currentInput };
    });
  };

  const refreshCalculator = () => {
    clearDisplay();
    const btn = refreshBtnRef.current;
    if (btn) {
      btn.style.transform = "rotate(360deg)";
      window.setTimeout(() => {
        btn.style.transform = "";
      }, 300);
    }
  };

  const toggleTheme = () => setIsDarkMode((d) => !d);

  // Keyboard bindings — identical to the original, including the button flash.
  useEffect(() => {
    const flashTimer = { id: 0 };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (key >= "0" && key <= "9") {
        inputNumber(key);
      } else if (key === ".") {
        inputNumber(".");
      } else if (
        key === "+" ||
        key === "-" ||
        key === "*" ||
        key === "/" ||
        key === "%"
      ) {
        inputOperator(key as Operator);
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
      } else if (key === "Escape" || key === "c" || key === "C") {
        clearDisplay();
      } else if (key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (key === "r" || key === "R") {
        refreshCalculator();
      }
      const dataKey = key === "Enter" ? "Enter" : key;
      if (["0","1","2","3","4","5","6","7","8","9",".","+","-","*","/","%","Enter"].includes(dataKey)) {
        setFlashKey(dataKey);
        window.clearTimeout(flashTimer.id);
        flashTimer.id = window.setTimeout(() => setFlashKey(null), 100);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(flashTimer.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayText = formatNumber(state.currentInput);
  const displayLength = displayText.length;
  const fontSize = displayLength > 9 ? "2.2rem" : displayLength > 6 ? "2.6rem" : "3rem";

  const btnDataKey: Record<string, string> = {
    "C": "c", "+/−": "", "%": "%", "÷": "/", "7": "7", "8": "8", "9": "9",
    "×": "*", "4": "4", "5": "5", "6": "6", "−": "-", "1": "1", "2": "2",
    "3": "3", "+": "+", "0": "0", ".": ".", "=": "Enter",
  };

  const btn = (label: string, className: string, onClick: () => void, ariaLabel?: string) => (
    <button
      className={`${className}${flashKey !== null && btnDataKey[label] === flashKey ? " flash" : ""}`}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
    >
      {label}
    </button>
  );

  return (
    <div className={isDarkMode ? "theme-dark" : "theme-light"}>
      <div className="calculator">
        <div className="header">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}>
            <div className={`toggle-circle${isDarkMode ? " is-dark" : " is-light"}`} />
            <span>{isDarkMode ? "Switch to Light" : "Switch to Dark"}</span>
          </button>
          <button
            className="refresh-btn"
            onClick={refreshCalculator}
            ref={refreshBtnRef}
            title="Reset Calculator"
            aria-label="Reset Calculator"
          >
            ⟲
          </button>
        </div>

        <div className="display">
          <div className="history" aria-live="polite" aria-label="Calculation history">
            {history.map((entry, i) => (
              <div className="history-row" key={`${i}-${entry}`}>{entry}</div>
            ))}
          </div>
          <div className="calculation">{state.calculationText}</div>
          <div
            className={`display-text${state.isError ? " error" : ""}`}
            style={{ fontSize }}
            key={displayText}
            role="status"
            aria-live="polite"
          >
            {displayText}
          </div>
        </div>

        <div className="buttons">
          {btn("C", "btn btn-function", clearDisplay, "All clear")}
          {btn("+/−", "btn btn-function", toggleSign, "Toggle sign")}
          {btn("%", "btn btn-function", () => inputOperator("%"), "Percent")}
          {btn("÷", `btn btn-operator${state.activeOperator === "/" ? " active" : ""}`, () => inputOperator("/"), "Divide")}

          {btn("7", "btn", () => inputNumber("7"))}
          {btn("8", "btn", () => inputNumber("8"))}
          {btn("9", "btn", () => inputNumber("9"))}
          {btn("×", `btn btn-operator${state.activeOperator === "*" ? " active" : ""}`, () => inputOperator("*"), "Multiply")}

          {btn("4", "btn", () => inputNumber("4"))}
          {btn("5", "btn", () => inputNumber("5"))}
          {btn("6", "btn", () => inputNumber("6"))}
          {btn("−", `btn btn-operator${state.activeOperator === "-" ? " active" : ""}`, () => inputOperator("-"), "Subtract")}

          {btn("1", "btn", () => inputNumber("1"))}
          {btn("2", "btn", () => inputNumber("2"))}
          {btn("3", "btn", () => inputNumber("3"))}
          {btn("+", `btn btn-operator${state.activeOperator === "+" ? " active" : ""}`, () => inputOperator("+"), "Add")}

          {btn("0", "btn btn-zero", () => inputNumber("0"))}
          {btn(".", "btn", () => inputNumber("."), "Decimal point")}
          {btn("=", "btn btn-operator", calculate, "Equals")}
        </div>
      </div>
    </div>
  );
}
