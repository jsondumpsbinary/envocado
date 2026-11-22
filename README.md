# Envocado

> **Don't let bad envs ruin your day.**

**Envocado** is a lightweight, zero-runtime-dependency environment validation toolkit for Node.js. It helps developers catch configuration mistakes before an application boots, preventing runtime crashes and silent bugs.

---

## 💡 Why Envocado?

In Node.js applications, configuration usually comes from `process.env`. But environment variables are always strings, easily missed, or mistyped:
- A `PORT` might be set to an invalid string or out of range.
- A required `DATABASE_URL` might be missing entirely.
- A boolean flag might be set to `"false"`, which `Boolean("false")` mistakenly evaluates to `true`.
- Secrets might be accidentally printed in error logs.

Envocado provides a simple, schema-based validator that:
1. Validates all environment variables before your app boots.
2. Converts raw strings to true JavaScript types (numbers, booleans, arrays).
3. Redacts secrets from error messages.
4. Returns an immutable configuration object.

---

## ✨ Features

- **Zero Runtime Dependencies**: Built entirely with standard JavaScript and Node.js APIs.
- **Required & Optional Variables**: Catches missing or whitespace-only variables.
- **Type Conversion**: Converts values into `string`, `number`, `int`, `port`, `boolean`, `enum`, `url`, and `list`.
- **Sensible Defaults**: Applied only when a variable is missing, never masking an invalid value.
- **String & Number Bounds**: Supports `minLength`, `maxLength`, `min`, and `max`.
- **Secret Redaction**: Protects sensitive variables marked with `secret: true` from ever leaking into error messages.
- **URL & Port Validation**: Uses standard `URL` checks and validates ports between 1 and 65535.
- **Immutable Configuration**: `createEnv()` returns an `Object.freeze()` config object to prevent accidental mutation.
- **Multiple Error Reporting**: Collects all validation errors at once so you can fix everything in one pass.
- **Non-Fatal Warnings**: Detects common placeholder secrets (e.g., `"your_api_key"`).

---

## 📦 Installation

```bash
npm install envocado
```

*(Note: Envocado is currently being prepared for its initial npm release. You can test it locally by linking or importing from source!)*

---

## 🚀 Quick Start

Here is a typical setup in a backend application:

```javascript
import { createEnv } from "envocado";

const env = createEnv({
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

  DEBUG: {
    type: "boolean",
    default: false,
  },

  API_KEY: {
    type: "string",
    required: true,
    secret: true,
    minLength: 16,
  },
});

// Use your validated, typed config safely:
console.log(`Server starting in ${env.NODE_ENV} mode on port ${env.PORT}...`);
```

If any variable fails validation, `createEnv()` halts startup and prints a formatted report:

```text
  Envocado: Configuration validation failed

✖ DATABASE_URL
  DATABASE_URL is required.

✖ API_KEY
  API_KEY must be at least 16 characters long.

Found 2 errors. Application startup blocked.
```

---

## 📖 Schema Reference

Every property in your schema defines rules for that environment variable.

| Rule | Type | Description |
|---|---|---|
| `type` | `string` | The expected data type (`"string"`, `"number"`, `"int"`, `"port"`, `"boolean"`, `"enum"`, `"url"`, `"list"`). |
| `required` | `boolean` | If `true`, validation fails if the variable is missing or whitespace-only. (Default: `false`) |
| `default` | `any` | Fallback value used when the variable is missing. |
| `secret` | `boolean` | If `true`, hides the raw value from error messages and formatting. |
| `values` | `Array` | Allowed values when `type: "enum"`. |
| `min` / `max` | `number` | Minimum and maximum values for `"number"` and `"int"`. |
| `minLength` / `maxLength` | `number` | Minimum and maximum character count for `"string"`. |
| `protocols` | `Array` | Allowed protocols for `"url"` (e.g. `["http:", "https:"]`). |
| `separator` | `string` | Delimiter for `"list"` (Default: `","`). |
| `requiredIf` | `string` | Makes a variable required only when another variable matches `requiredValue`. |
| `validate` | `function` | Optional custom validator function returning `true` or `false`. |

---

## 🛠️ Core API

Envocado provides two main functions:

### 1. `createEnv(schema, source)`
Recommended for application entry points.
- Validates the environment.
- If valid, returns an immutable (frozen) configuration object.
- If invalid, throws an `Error` with all collected errors formatted for the console.

### 2. `validateEnv(schema, source)`
Recommended when you want to inspect results manually without throwing an error (e.g., during tests or CLI checks).
- Returns a result object:
  ```javascript
  {
    ok: true,        // boolean: true if no errors
    config: { ... }, // validated values (empty object if ok is false)
    errors: [ ... ], // array of { variable, message }
    warnings: [ ... ]// array of non-fatal warnings
  }
  ```

---

## 🔒 Secret Redaction

When an environment variable contains sensitive information (such as an API key or password), set `secret: true`.

When `secret: true` is enabled, Envocado guarantees that the secret's raw value is **never** echoed in terminal logs or error messages:

```javascript
// Unsafe error message (Without secret: true):
// API_KEY must be a valid number. Received: sk_live_9999999999

// Safe error message (With secret: true):
// API_KEY must be a valid number.
```

---

## 🧪 Testing

Envocado includes a comprehensive test suite using Node.js's built-in native test runner (`node:test`).

To run the tests:

```bash
npm test
```

---

## 📁 Examples & Companion Demo

- **Basic Example**: See `examples/basic-example.js`.
- **Express Demo**: See `examples/express-demo/` for a realistic example showing how Envocado guards an Express application startup.

---

## 🚧 Limitations & Roadmap

### Current Limitations
- Nested schema objects are not supported (environment variables are flat key-value pairs).
- Does not automatically read `.env` files from disk (you can pair Envocado with Node 20+ `--env-file` or `dotenv`).

### Roadmap
- [ ] Simple CLI command: `envocado check`
- [ ] Automatic `.env.example` file generator from schema

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome! Please open an issue or pull request on GitHub.

---

## 📄 License

MIT
