import {
  parseString,
  parseNumber,
  parseInt,
  parsePort,
  parseBoolean,
  parseEnum,
  parseUrl,
  parseList,
} from "./parsers.js";

// Common placeholder substrings to detect in warnings
const PLACEHOLDERS = [
  "your_api_key",
  "change_me",
  "todo",
  "insert_here",
  "placeholder",
];

export function validateEnv(schema, source = process.env) {
  const config = {};
  const errors = [];
  const warnings = [];

  for (const [key, rules] of Object.entries(schema)) {
    const rawValue = source[key];
    const isMissing =
      rawValue === undefined ||
      rawValue === null ||
      (typeof rawValue === "string" && rawValue.trim() === "");

    // Check conditional requirements (requiredIf)
    if (rules.requiredIf && isMissing) {
      const conditionValue = source[rules.requiredIf];
      if (conditionValue === rules.requiredValue) {
        errors.push({
          variable: key,
          message: `${key} is required when ${rules.requiredIf} is "${rules.requiredValue}".`,
        });
        continue;
      }
    }

    if (isMissing) {
      if (rules.default !== undefined) {
        config[key] = rules.default;
        continue;
      }

      if (rules.required) {
        errors.push({
          variable: key,
          message: `${key} is required.`,
        });
      }
      continue;
    }

    // Diagnostics / Warnings: detect obvious placeholder secrets or values
    if (typeof rawValue === "string") {
      const lower = rawValue.toLowerCase();
      for (let p = 0; p < PLACEHOLDERS.length; p++) {
        if (lower.includes(PLACEHOLDERS[p])) {
          warnings.push({
            variable: key,
            message: `${key} appears to contain a placeholder value.`,
          });
          break;
        }
      }
    }

    let parsedResult;

    switch (rules.type) {
      case "string":
        parsedResult = parseString(rawValue, rules, key);
        break;

      case "number":
        parsedResult = parseNumber(rawValue, rules, key);
        break;

      case "int":
        parsedResult = parseInt(rawValue, rules, key);
        break;

      case "port":
        parsedResult = parsePort(rawValue, rules, key);
        break;

      case "boolean":
        parsedResult = parseBoolean(rawValue, rules, key);
        break;

      case "enum":
        parsedResult = parseEnum(rawValue, rules, key);
        break;

      case "url":
        parsedResult = parseUrl(rawValue, rules, key);
        break;

      case "list":
        parsedResult = parseList(rawValue, rules, key);
        break;

      default:
        errors.push({
          variable: key,
          message: `Unsupported type: ${rules.type}`,
        });
        continue;
    }

    if (parsedResult.error) {
      errors.push({
        variable: key,
        message: parsedResult.error,
      });
      continue;
    }

    let value = parsedResult.value;

    // Optional custom validator function
    if (typeof rules.validate === "function") {
      const isValid = rules.validate(value);
      if (!isValid) {
        errors.push({
          variable: key,
          message: `${key} failed custom validation.`,
        });
        continue;
      }
    }

    config[key] = value;
  }

  const ok = errors.length === 0;
  return {
    ok,
    config: ok ? config : {},
    errors,
    warnings,
  };
}
