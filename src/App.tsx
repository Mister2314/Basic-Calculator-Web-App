import { useCallback, useEffect, useRef, useState } from "react";
import {
  PI,
  applyUnary,
  compute,
  formatNumber,
  resultToString,
  type UnaryOp,
} from "./lib/calc";
import "./styles.css";

type Operator = "+" | "-" | "*" | "/" | "%";

type ThemeMode = "system" | "light" | "dark";

type HistoryEntry = {
  id: number;
  expr: string;
  result: string;
};

const HISTORY_KEY = "bc-history";
const MEMORY_KEY = "bc-memory";
const THEME_KEY = "bc-theme";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
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

/** Initial theme reflects the pre-paint decision made in index.html. */
function initialThemeMode(): ThemeMode {
  const stored = (() => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  })();
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export default function App() {
  const [state, setState] = useState<CalcState>(initialState);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialThemeMode);
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadJSON<HistoryEntry[]>(HISTORY_KEY, [])
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [memory, setMemory] = useState<number>(() =>
    loadJSON<number>(MEMORY_KEY, 0)
  );
  const [memoryActive, setMemoryActive] = useState<boolean>(
    () => loadJSON<number>(MEMORY_KEY, 0) !== 0
  );
  const [scientific, setScientific] = useState(false);
  const [copied, setCopied] = useState(false);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);

  const stateRef = useRef(state);
  stateRef.current = state;
  const memoryRef = useRef(memory);
  memoryRef.current = memory;

  // ── Persistence ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    } catch {
      /* private mode — history simply does not persist */
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
    } catch {
      /* ignore */
    }
  }, [memory]);

  // ── Theme: system default + persisted toggle, crossfade without flash ──
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark =
        themeMode === "dark" ||
        (themeMode === "system" && mq.matches);
      document.documentElement.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch {
      /* ignore */
    }
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [themeMode]);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const cycleTheme = () =>
    setThemeMode((m) => (m === "system" ? "dark" : m === "dark" ? "light" : "system"));

  const themeLabel =
    themeMode === "system"
      ? isDark
        ? "System (dark)"
        : "System (light)"
      : themeMode === "dark"
        ? "Dark"
        : "Light";

  // ── History helpers ────────────────────────────────────────────────────
  const pushHistory = useCallback((expr: string, result: string) => {
    setHistory((h) =>
      [{ id: nextId.current++, expr, result }, ...h].slice(0, 30)
    );
  }, []);

  const clearDisplay = () => {
    setState({ ...initialState });
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
      showError();
      return;
    }
    const resultStr = resultToString(result);
    pushHistory(
      `${formatNumber(s.previousInput!)} ${getOperatorSymbol(s.operator)} ${formatNumber(s.currentInput)}`,
      formatNumber(resultStr)
    );
    setState({
      ...initialState,
      currentInput: resultStr,
      shouldResetDisplay: true,
    });
  };

  const inputNumber = (num: string) => {
    setState((s) => {
      let currentInput = s.currentInput;
      let shouldResetDisplay = s.shouldResetDisplay;
      let isError = s.isError;
      if (currentInput === "Error") {
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
        if (currentInput.length >= 12 && num !== ".") {
          return { ...s, currentInput, shouldResetDisplay, isError };
        }
        currentInput =
          currentInput === "0" && num !== "." ? num : currentInput + num;
      }
      return {
        ...s,
        currentInput,
        shouldResetDisplay,
        isError,
        activeOperator: null,
      };
    });
  };

  const inputOperator = (op: Operator) => {
    setState((s) => {
      if (op === "%") {
        const current = parseFloat(s.currentInput);
        if (isNaN(current)) return s;
        return { ...s, currentInput: resultToString(current / 100) };
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
      }
      return {
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

  // ── Unary scientific ops ───────────────────────────────────────────────
  const inputUnary = (op: UnaryOp) => {
    const pre = stateRef.current;
    if (pre.currentInput === "Error") return;
    const result = applyUnary(pre.currentInput, op);
    if (result === "Error") {
      showError();
      return;
    }
    const label = op === "sqrt" ? "√" : op === "sqr" ? "sqr" : "1/";
    pushHistory(
      `${label}(${formatNumber(pre.currentInput)})`,
      formatNumber(resultToString(result))
    );
    setState((s) => ({
      ...s,
      currentInput: resultToString(result),
      shouldResetDisplay: true,
    }));
  };

  const inputPi = () => {
    setState((s) => ({
      ...s,
      currentInput: PI,
      shouldResetDisplay: false,
      isError: false,
      activeOperator: null,
    }));
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

  // ── Memory keys ────────────────────────────────────────────────────────
  const memoryClear = () => {
    setMemory(0);
    setMemoryActive(false);
  };

  const memoryRecall = () => {
    const m = memoryRef.current;
    if (m === 0 && !memoryActive) return;
    setState((s) => ({
      ...s,
      currentInput: resultToString(m),
      shouldResetDisplay: true,
      isError: false,
    }));
  };

  const memoryAdd = (sign: 1 | -1) => {
    const s = stateRef.current;
    const v = parseFloat(s.currentInput);
    if (isNaN(v) || s.isError) return;
    const next = memoryRef.current + sign * v;
    setMemory(next);
    setMemoryActive(true);
    setState((cur) => ({ ...cur, shouldResetDisplay: true }));
  };

  // ── Copy / paste ───────────────────────────────────────────────────────
  const copyResult = async () => {
    const s = stateRef.current;
    if (s.currentInput === "Error") return;
    try {
      await navigator.clipboard.writeText(s.currentInput);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable (non-secure context) */
    }
  };

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData("text")?.trim();
      if (!text) return;
      const cleaned = text.replace(/,/g, "").replace(/\s/g, "");
      if (!/^-?\d*\.?\d+$/.test(cleaned)) return;
      event.preventDefault();
      setState((s) => ({
        ...s,
        currentInput: cleaned === "" ? "0" : cleaned,
        shouldResetDisplay: true,
        isError: false,
        activeOperator: null,
      }));
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const refreshCalculator = () => {
    clearDisplay();
    setPanelOpen(false);
    const btn = refreshBtnRef.current;
    if (btn) {
      btn.style.transform = "rotate(360deg)";
      window.setTimeout(() => {
        btn.style.transform = "";
      }, 300);
    }
  };

  const reuseResult = (entry: HistoryEntry) => {
    const value = entry.result.replace(/\s/g, "");
    if (!/^-?[\d.]+(e[+-]?\d+)?$/i.test(value)) return;
    setState((s) => ({
      ...s,
      currentInput: value,
      shouldResetDisplay: true,
      isError: false,
      activeOperator: null,
    }));
  };

  // ── Keyboard bindings ──────────────────────────────────────────────────
  useEffect(() => {
    const flashTimer = { id: 0 };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      if (key >= "0" && key <= "9") {
        inputNumber(key);
      } else if (key === "." || key === ",") {
        inputNumber(".");
      } else if (["+", "-", "*", "/"].includes(key)) {
        inputOperator(key as Operator);
      } else if (key === "%") {
        inputOperator("%");
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
      } else if (key === "Escape") {
        clearDisplay();
      } else if (key === "Backspace" || key === "Delete") {
        event.preventDefault();
        backspace();
      } else if (key === "r" || key === "R") {
        refreshCalculator();
      } else if (key === "h" || key === "H") {
        setPanelOpen((p) => !p);
      } else if (key === "s" || key === "S") {
        setScientific((p) => !p);
      } else {
        return;
      }
      const echoKey =
        key === "Enter" ? "Enter" : key === "," ? "." : key === "Escape" ? "c" : key;
      const echoSet = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".",
        "+", "-", "*", "/", "%", "Enter", "c",
      ];
      if (echoSet.includes(echoKey)) {
        setFlashKey(echoKey);
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
  const fontSize =
    displayLength > 11 ? "1.7rem" : displayLength > 9 ? "2.2rem" : displayLength > 6 ? "2.6rem" : "3rem";

  const btnDataKey: Record<string, string> = {
    "AC": "c", "+/−": "", "%": "%", "÷": "/", "7": "7", "8": "8", "9": "9",
    "×": "*", "4": "4", "5": "5", "6": "6", "−": "-", "1": "1", "2": "2",
    "3": "3", "+": "+", "0": "0", ".": ".", "=": "Enter",
  };

  const btn = (
    label: string,
    className: string,
    onClick: () => void,
    ariaLabel?: string
  ) => (
    <button
      className={`${className}${flashKey !== null && btnDataKey[label] === flashKey ? " flash" : ""}`}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      type="button"
    >
      {label}
    </button>
  );

  const historyCount = history.length;

  return (
    <div className="app">
      <div className="calculator">
        <div className="header">
          <button
            className="theme-toggle"
            onClick={cycleTheme}
            aria-label={`Theme: ${themeLabel}. Click to change`}
            type="button"
          >
            <div
              className={`toggle-circle theme-${themeMode}`}
              aria-hidden="true"
            />
            <span>{themeLabel}</span>
          </button>
          <div className="header-actions">
            <button
              className={`icon-btn${scientific ? " active" : ""}`}
              onClick={() => setScientific((p) => !p)}
              aria-pressed={scientific}
              aria-label="Toggle scientific keys"
              title="Scientific keys (S)"
              type="button"
            >
              <span aria-hidden="true">ƒ𝑥</span>
            </button>
            <button
              className={`icon-btn${panelOpen ? " active" : ""}`}
              onClick={() => setPanelOpen((p) => !p)}
              aria-pressed={panelOpen}
              aria-expanded={panelOpen}
              aria-label="Toggle calculation history"
              title="History (H)"
              type="button"
            >
              <span aria-hidden="true">⧉</span>
              {historyCount > 0 && (
                <span className="badge" aria-hidden="true">
                  {historyCount > 9 ? "9+" : historyCount}
                </span>
              )}
            </button>
            <button
              className="refresh-btn"
              onClick={refreshCalculator}
              ref={refreshBtnRef}
              title="Reset Calculator (R)"
              aria-label="Reset Calculator"
              type="button"
            >
              ⟲
            </button>
          </div>
        </div>

        <div className="display">
          <div className="calculation">{state.calculationText}</div>
          <div className="display-row">
            <button
              className="copy-btn"
              onClick={copyResult}
              aria-label={copied ? "Copied" : "Copy result"}
              title="Copy result"
              type="button"
            >
              {copied ? "✓" : "⧉"}
            </button>
            <div
              className={`display-text${state.isError ? " error" : ""}`}
              style={{ fontSize }}
              key={displayText}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {displayText}
            </div>
          </div>
        </div>

        {panelOpen && (
          <div className="history-panel" aria-label="Calculation history">
            {historyCount === 0 ? (
              <p className="history-empty">No calculations yet — results land here as you work.</p>
            ) : (
              <>
                <ul className="history-list">
                  {history.map((entry) => (
                    <li key={entry.id}>
                      <button
                        className="history-item"
                        onClick={() => reuseResult(entry)}
                        title="Use this result"
                        type="button"
                      >
                        <span className="history-expr">{entry.expr}</span>
                        <span className="history-result">= {entry.result}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  className="history-clear"
                  onClick={() => setHistory([])}
                  type="button"
                >
                  Clear history
                </button>
              </>
            )}
          </div>
        )}

        {scientific && (
          <div className="sci-row" aria-label="Scientific keys">
            {btn("√", "btn btn-sci", () => inputUnary("sqrt"), "Square root")}
            {btn("x²", "btn btn-sci", () => inputUnary("sqr"), "Square")}
            {btn("1/x", "btn btn-sci", () => inputUnary("inv"), "Reciprocal")}
            {btn("π", "btn btn-sci", inputPi, "Pi")}
          </div>
        )}

        <div className="memory-row" aria-label="Memory keys">
          {btn("MC", "btn btn-mem", memoryClear, "Memory clear", )}
          {btn("MR", "btn btn-mem", memoryRecall, "Memory recall")}
          {btn("M+", "btn btn-mem", () => memoryAdd(1), "Memory add")}
          {btn("M−", "btn btn-mem", () => memoryAdd(-1), "Memory subtract")}
          <span
            className={`memory-indicator${memoryActive ? " on" : ""}`}
            aria-label={memoryActive ? `Memory holds ${formatNumber(resultToString(memory))}` : "Memory empty"}
          >
            M
          </span>
        </div>

        <div className="buttons">
          {btn("AC", "btn btn-function", clearDisplay, "All clear")}
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
