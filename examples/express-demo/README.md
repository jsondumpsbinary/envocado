# Envocado Express Demo

This companion project shows how **Envocado** guards application startup by validating environment variables *before* the Express server listens for traffic.

## How it works

1. The application defines an Envocado schema in `server.js`.
2. Before booting Express, `createEnv(schema)` checks the configuration.
3. **If invalid**: Envocado displays clear error messages and the process exits before exposing the server to runtime crashes.
4. **If valid**: Express starts cleanly with typed and frozen configuration.

## Running the demo

### 1. Test invalid environment (startup blocked)

```bash
node server.js
```

Because `DATABASE_URL` and `API_SECRET` are missing, Envocado blocks startup with clear error messages.

### 2. Test valid environment (startup succeeds)

```bash
DATABASE_URL=https://db.example.com API_SECRET=my_long_secret_key_12345 node server.js
```
