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
