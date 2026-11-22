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
      continue;
    }

    config[key] = rawValue;
  }

  const ok = errors.length === 0;
  return {
    ok,
    config: ok ? config : {},
    errors,
    warnings,
  };
}
