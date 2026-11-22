// Formats validation errors and warnings into clear, human-readable terminal messages.

export function formatErrors(errors, warnings = []) {
  const lines = [];

  lines.push("\n  Envocado: Configuration validation failed\n");

  for (let i = 0; i < errors.length; i++) {
    const err = errors[i];
    lines.push(`✖ ${err.variable}`);
    lines.push(`  ${err.message}\n`);
  }

  if (warnings.length > 0) {
    for (let i = 0; i < warnings.length; i++) {
      const warn = warnings[i];
      lines.push(`⚠ ${warn.variable}`);
      lines.push(`  ${warn.message}\n`);
    }
  }

  const errCount = errors.length;
  const warnCount = warnings.length;
  let summary = `Found ${errCount} error${errCount === 1 ? "" : "s"}`;
  if (warnCount > 0) {
    summary += `, ${warnCount} warning${warnCount === 1 ? "" : "s"}`;
  }
  summary += ". Application startup blocked.";

  lines.push(summary);

  return lines.join("\n");
}
