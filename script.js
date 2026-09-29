const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

// Step 1: basic math operator functions
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

// Step 3: operate() calls the right function based on the operator
function operate(operator, a, b) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      return null;
  }
}

// Calculator state
let previousValue = null; // first number
let operator = null; // selected operator
let currentInput = "0"; // second number / display buffer (also holds first number while typing)
let shouldResetInput = false; // true when the next digit should start a fresh number
let justPressedOperator = false; // true right after an operator was pressed, before a digit

function updateDisplay() {
  display.textContent = currentInput;
}

// Round long decimals so they don't overflow the display
function formatResult(value) {
  if (!isFinite(value)) return "0";

  const rounded = Math.round(value * 1e9) / 1e9;
  let str = rounded.toString();

  if (str.length > 12) {
    str = rounded.toPrecision(10).replace(/\.?0+$/, "");
  }

  return str;
}

function inputDigit(digit) {
  if (shouldResetInput) {
    currentInput = digit;
    shouldResetInput = false;
  } else {
    currentInput = currentInput === "0" ? digit : currentInput + digit;
  }
  justPressedOperator = false;
  updateDisplay();
}

function inputDecimal() {
  if (shouldResetInput) {
    currentInput = "0.";
    shouldResetInput = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  justPressedOperator = false;
  updateDisplay();
}

function showError(message) {
  display.textContent = message;
  previousValue = null;
  operator = null;
  currentInput = "0";
  shouldResetInput = true;
  justPressedOperator = false;
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(currentInput);

  // Consecutive operator presses: only remember the latest one
  if (operator && justPressedOperator) {
    operator = nextOperator;
    return;
  }

  if (previousValue === null) {
    previousValue = inputValue;
  } else if (operator) {
    if (operator === "/" && inputValue === 0) {
      showError("Nice try, can't divide by 0!");
      return;
    }
    previousValue = operate(operator, previousValue, inputValue);
    currentInput = formatResult(previousValue);
  }

  operator = nextOperator;
  shouldResetInput = true;
  justPressedOperator = true;
  updateDisplay();
}

function handleEquals() {
  // Only evaluate when we have a first number, an operator, and a second number
  if (operator === null || justPressedOperator) {
    return;
  }

  const inputValue = parseFloat(currentInput);

  if (operator === "/" && inputValue === 0) {
    showError("Nice try, can't divide by 0!");
    return;
  }

  const result = operate(operator, previousValue, inputValue);

  currentInput = formatResult(result);
  previousValue = null;
  operator = null;
  shouldResetInput = true;
  justPressedOperator = false;
  updateDisplay();
}

function handleClear() {
  previousValue = null;
  operator = null;
  currentInput = "0";
  shouldResetInput = false;
  justPressedOperator = false;
  updateDisplay();
}

function handleBackspace() {
  if (shouldResetInput) return;

  currentInput =
    currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  updateDisplay();
}

// Wire up button clicks
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const { digit, operator: op, action } = button.dataset;

    if (digit !== undefined) {
      inputDigit(digit);
    } else if (op !== undefined) {
      handleOperator(op);
    } else if (action === "decimal") {
      inputDecimal();
    } else if (action === "equals") {
      handleEquals();
    } else if (action === "clear") {
      handleClear();
    } else if (action === "backspace") {
      handleBackspace();
    }
  });
});

// Extra credit: keyboard support
window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") {
    inputDigit(e.key);
  } else if (e.key === ".") {
    inputDecimal();
  } else if (["+", "-", "*", "/"].includes(e.key)) {
    handleOperator(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    handleEquals();
  } else if (e.key === "Backspace") {
    handleBackspace();
  } else if (e.key === "Escape" || e.key.toLowerCase() === "c") {
    handleClear();
  }
});

updateDisplay();