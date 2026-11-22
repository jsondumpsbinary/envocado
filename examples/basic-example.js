import { validateEnv, createEnv } from "../src/index.js";

console.log("=== 1. Using validateEnv() ===");
// validateEnv returns an object with ok, config, errors, warnings
// without throwing an error.

const schema = {
  PORT: {
    type: "port",
    default: 3000,
  },
  NODE_ENV: {
    type: "enum",
    values: ["development", "production", "test"],
    default: "development",
  },
  DATABASE_URL: {
    type: "url",
    required: true,
  },
  API_KEY: {
    type: "string",
    required: true,
    secret: true,
    minLength: 8,
  },
};

// Test with valid source data
const validSource = {
  DATABASE_URL: "https://db.example.com",
  API_KEY: "super_secret_token",
};

const result = validateEnv(schema, validSource);
console.log("Validation Result:", result);

console.log("\n=== 2. Using createEnv() ===");
// createEnv returns the frozen config directly, or throws if invalid.

try {
  const config = createEnv(schema, validSource);
  console.log("Config loaded successfully! Port is:", config.PORT);
  console.log("Environment is:", config.NODE_ENV);
} catch (err) {
  console.error("Failed to load environment:", err.message);
}

console.log("\n=== 3. What happens when environment is invalid? ===");
try {
  createEnv(schema, {
    PORT: "not-a-port",
    DATABASE_URL: "invalid-url",
    API_KEY: "123", // too short, and secret
  });
} catch (err) {
  console.log("Caught expected error:");
  console.log(err.message);
}
