// Helper parsers for each supported data type.

// 1. String parser
export function parseString(rawValue, rules, key) {
  const str = String(rawValue);

  if (rules.minLength !== undefined && str.length < rules.minLength) {
    return {
      error: `${key} must be at least ${rules.minLength} characters long.`
    };
  }

  if (rules.maxLength !== undefined && str.length > rules.maxLength) {
    return {
      error: `${key} must be at most ${rules.maxLength} characters long.`
    };
  }

  return { value: str };
}

// 2. Number parser
export function parseNumber(rawValue, rules, key) {
  // Reject booleans, non-number objects, and whitespace-only strings
  if (
    typeof rawValue === "boolean" ||
    (typeof rawValue === "string" && rawValue.trim() === "") ||
    (typeof rawValue !== "string" && typeof rawValue !== "number")
  ) {
    return { error: `${key} must be a valid number.` };
  }

  const num = Number(rawValue);

  if (!Number.isFinite(num)) {
    return {
      error: `${key} must be a valid number. Received: ${rawValue}`
    };
  }

  if (rules.min !== undefined && num < rules.min) {
    return { error: `${key} must be greater than or equal to ${rules.min}.` };
  }

  if (rules.max !== undefined && num > rules.max) {
    return { error: `${key} must be less than or equal to ${rules.max}.` };
  }

  return { value: num };
}

// 3. Integer parser
export function parseInt(rawValue, rules, key) {
  const numResult = parseNumber(rawValue, rules, key);
  if (numResult.error) {
    return numResult;
  }

  const num = numResult.value;

  if (!Number.isInteger(num)) {
    return {
      error: `${key} must be an integer (received decimal: ${rawValue}).`
    };
  }

  return { value: num };
}

// 4. Port parser
export function parsePort(rawValue, rules, key) {
  const intResult = parseInt(rawValue, rules, key);
  if (intResult.error) {
    return intResult;
  }

  const port = intResult.value;

  if (port < 1 || port > 65535) {
    return {
      error: `${key} must be a valid port number between 1 and 65535.`
    };
  }

  return { value: port };
}

// 5. Boolean parser
export function parseBoolean(rawValue, rules, key) {
  if (rawValue === true || rawValue === "true") {
    return { value: true };
  }

  if (rawValue === false || rawValue === "false") {
    return { value: false };
  }

  return {
    error: `${key} must be either "true" or "false".`
  };
}
