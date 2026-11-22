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

    config[key] = parsedResult.value;
  }

  const ok = errors.length === 0;
  return {
    ok,
    config: ok ? config : {},
    errors,
    warnings,
  };
}
