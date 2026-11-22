import { validateEnv } from "./validate.js";
import { formatErrors } from "./formatter.js";

/**
 * Validates the environment variables against a schema and returns the configuration object.
 * Throws a readable error if validation fails.
 *
 * @param {Object} schema - The schema describing expected environment variables.
 * @param {Object} [source=process.env] - Optional source object (defaults to process.env).
 * @returns {Object} Immutable configuration object.
 */
export function createEnv(schema, source = process.env) {
  const result = validateEnv(schema, source);

  if (!result.ok) {
    const message = formatErrors(result.errors, result.warnings);
    throw new Error(message);
  }

  // Freeze the configuration so it cannot be accidentally modified
  return Object.freeze(result.config);
}

// Export validateEnv for users who prefer checking ok/errors manually
export { validateEnv };
