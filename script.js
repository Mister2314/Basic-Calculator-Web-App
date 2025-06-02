let currentInput = "0";
let operator = null;
let previousInput = null;
let shouldResetDisplay = false;
let isDarkMode = true;
let activeOperator = null;
let lastOperator = null;
let lastOperand = null;

const display = document.getElementById("display");
const calculation = document.getElementById("calculation");
const body = document.body;
const themeText = document.getElementById("theme-text");

function updateDisplay() {
  display.textContent = formatNumber(currentInput);
  if (display.textContent.length > 9) {
    display.style.fontSize = "2.2rem";
  } else if (display.textContent.length > 6) {
    display.style.fontSize = "2.6rem";
  } else {
    display.style.fontSize = "3rem";
  }
}
function formatNumber(num) {
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

function updateCalculation() {
  if (previousInput && operator) {
    calculation.textContent = `${formatNumber(
      previousInput
    )} ${getOperatorSymbol(operator)}`;
  } else {
    calculation.textContent = "";
  }
}
function getOperatorSymbol(op) {
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

function inputNumber(num) {
  if (currentInput === "Error") {
    clearDisplay();
  }

  if (shouldResetDisplay) {
    currentInput = num;
    shouldResetDisplay = false;
  } else {
    if (num === "." && currentInput.includes(".")) {
      return;
    }

    if (currentInput.length >= 9 && num !== ".") {
      return;
    }

    currentInput =
      currentInput === "0" && num !== "." ? num : currentInput + num;
  }
  clearActiveOperator();
  updateDisplay();
}
function inputOperator(op) {
  if (op === "%") {
    const current = parseFloat(currentInput);
    currentInput = (current / 100).toString();
    updateDisplay();
    return;
  }
  if (operator !== null && !shouldResetDisplay) {
    calculate();
  }
  previousInput = currentInput;
  operator = op;
  shouldResetDisplay = true;
  setActiveOperator(op);
  updateCalculation();
}
function calculate() {
  if (operator === null || shouldResetDisplay) return;
  clearActiveOperator();
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  let result;

  switch (operator) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "*":
      result = prev * current;
      break;
    case "/":
      if (current === 0) {
        showError();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  if (Math.abs(result) < 0.000001 && result !== 0) {
    currentInput = result.toExponential(2);
  } else if (Math.abs(result) >= 999999999) {
    currentInput = result.toExponential(2);
  } else {
    if (result === Math.floor(result)) {
      currentInput = result.toString();
    } else {
      currentInput = parseFloat(result.toFixed(10)).toString();
    }
  }
  operator = null;
  previousInput = null;
  shouldResetDisplay = true;
  calculation.textContent = "";
  updateDisplay();
}
function clearDisplay() {
  currentInput = "0";
  operator = null;
  previousInput = null;
  shouldResetDisplay = false;
  display.classList.remove("error");
  calculation.textContent = "";
  clearActiveOperator();
  updateDisplay();
}

function refreshCalculator() {
  clearDisplay();
  const refreshBtn = document.querySelector(".refresh-btn");
  refreshBtn.style.transform = "rotate(360deg)";
  setTimeout(() => {
    refreshBtn.style.transform = "";
  }, 300);
}

function allClear() {
  clearDisplay();
}
function clearEntry() {
  currentInput = "0";
  updateDisplay();
}

function toggleSign() {
  if (currentInput !== "0") {
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }
}

function showError() {
  currentInput = "Error";
  display.classList.add("error");
  updateDisplay();
  setTimeout(() => {
    clearDisplay();
  }, 2000);
}

function setActiveOperator(op) {
  clearActiveOperator();
  const operatorBtn = document.querySelector(`[data-key="${op}"]`);
  if (operatorBtn) {
    operatorBtn.classList.add("active");
    activeOperator = operatorBtn;
  }
}
function clearActiveOperator() {
  if (activeOperator) {
    activeOperator.classList.remove("active");
    activeOperator = null;
  }
}
function toggleTheme() {
  isDarkMode = !isDarkMode;
  body.className = isDarkMode ? "theme-dark" : "theme-light";
  themeText.textContent = isDarkMode ? "Switch to Light" : "Switch to Dark";
}

document.addEventListener("keydown", (event) => {
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
    inputOperator(key);
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
  const button =
    document.querySelector(`[data-key="${key}"]`) ||
    (key === "Enter" ? document.querySelector('[data-key="Enter"]') : null);
  if (button) {
    button.style.opacity = "0.7";
    setTimeout(() => {
      button.style.opacity = "";
    }, 100);
  }
});
function backspace() {
  if (currentInput === "Error") {
    clearDisplay();
    return;
  }
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
  updateDisplay();
}
updateDisplay();
