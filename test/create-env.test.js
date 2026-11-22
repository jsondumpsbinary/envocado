import test from "node:test";
import assert from "node:assert";
import { createEnv } from "../src/index.js";

test("createEnv - returns frozen config when validation succeeds", () => {
  const schema = {
    PORT: { type: "port", default: 3000 },
    NODE_ENV: { type: "enum", values: ["development", "production"], default: "development" },
  };

  const config = createEnv(schema, {});
  assert.strictEqual(config.PORT, 3000);
  assert.strictEqual(config.NODE_ENV, "development");

  // Config should be frozen
  assert.strictEqual(Object.isFrozen(config), true);
  assert.throws(() => {
    config.PORT = 8080;
  }, TypeError);
});

test("createEnv - throws an error listing all failures when invalid", () => {
  const schema = {
    PORT: { type: "port", required: true },
    API_URL: { type: "url", required: true },
  };

  assert.throws(
    () => {
      createEnv(schema, {
        PORT: "not-a-port",
        API_URL: "not-a-url",
      });
    },
    (err) => {
      assert.match(err.message, /Configuration validation failed/);
      assert.match(err.message, /PORT/);
      assert.match(err.message, /API_URL/);
      return true;
    }
  );
});

test("createEnv - does not modify process.env", () => {
  const originalEnvValue = process.env.TEST_ENVOCADO_KEY;
  const schema = {
    TEST_ENVOCADO_KEY: { type: "string", default: "default_value" },
  };

  const config = createEnv(schema, {});
  assert.strictEqual(config.TEST_ENVOCADO_KEY, "default_value");
  // process.env should be untouched
  assert.strictEqual(process.env.TEST_ENVOCADO_KEY, originalEnvValue);
});
