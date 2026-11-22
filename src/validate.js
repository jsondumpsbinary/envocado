export function validateEnv(schema, source = process.env) {
  const config = {};
  const errors = [];
  const warnings = [];

  for (const [key, rules] of Object.entries(schema)) {
    const rawValue = source[key];
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
