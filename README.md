#   Envocado

### Don't let bad envs ruin your day.

**Envocado** is a lightweight, zero-dependency environment validation toolkit for Node.js that helps developers catch configuration mistakes before their applications start.

Missing environment variables? Invalid ports? Incorrect URLs? Envocado catches them early and provides clear, actionable error messages instead of letting your application crash somewhere unexpected.

## 💡 Why Envocado?

We've all been there.

You start your backend application, only to discover that:
- A required environment variable is missing.
- Your `PORT` contains an invalid value.
- Your `DATABASE_URL` is incorrectly configured.
- A secret is too short or hasn't been configured.

Instead of discovering these problems one by one through runtime errors, Envocado validates your environment at startup and reports all detected issues together.

## ✨ Features

Planned for the initial release:

- **Required variables:** Detect missing environment variables.
- **Type validation:** Validate strings, numbers, booleans and URLs.
- **Default values:** Provide fallback values for optional configuration.
- **Enum validation:** Restrict variables to predefined values.
- **Helpful errors:** Display clear messages explaining what went wrong.
- **Multiple error reporting:** Catch multiple configuration issues in one validation run.
- **Secret protection:** Prevent sensitive values from appearing in error messages.
- **Zero dependencies:** Keep the core lightweight and dependency-free.

## 📦 Installation

```bash
npm install envocado
```

## 🚀 Quick Start

```js
import { createEnv } from "envocado";

const env = createEnv({
  PORT: {
    type: "number",
    default: 3000
  },

  NODE_ENV: {
    type: "enum",
    values: ["development", "production", "test"],
    default: "development"
  },

  DATABASE_URL: {
    type: "url",
    required: true
  },

  JWT_SECRET: {
    type: "string",
    required: true,
    secret: true,
    minLength: 32
  }
});

console.log(env.PORT);
```

## 🛠️ How It Works

1. Define your environment variables and their expected rules.
2. Envocado reads your environment configuration.
3. Each variable is checked against its schema.
4. Errors and warnings are collected.
5. If validation succeeds, you receive a validated configuration object.
6. If validation fails, Envocado reports the issues and prevents unsafe startup.

## 🧪 Example Error Output

```text
  Envocado: Configuration validation failed

✖ DATABASE_URL
  Required environment variable is missing.

✖ PORT
  Expected a number, received an invalid value.

⚠ JWT_SECRET
  Secret does not meet the minimum length requirement.

2 errors, 1 warning.
Application startup blocked.
```

*Illustrative output; exact formatting may change.*

## 🏗️ Tech Stack

- JavaScript (ES Modules)
- Node.js
- Native JavaScript APIs
- Node.js built-in test runner

No external runtime dependencies.

## 🎯 Project Goals

Envocado aims to make environment configuration:

- Easier to validate.
- Safer to handle.
- Easier to debug.
- More predictable across development and production.

## 📄 License

[LICENSE]

---

Made with ☕ and a little avocado energy. 🥑