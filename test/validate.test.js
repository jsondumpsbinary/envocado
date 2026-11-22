import test from "node:test";
import assert from "node:assert";
import { validateEnv } from "../src/index.js";

test("Required variables - reports error when missing or whitespace", () => {
  const schema = {
    DB_NAME: { type: "string", required: true },
  };

  const res1 = validateEnv(schema, {});
  assert.strictEqual(res1.ok, false);
  assert.strictEqual(res1.errors.length, 1);
  assert.strictEqual(res1.errors[0].variable, "DB_NAME");

  const res2 = validateEnv(schema, { DB_NAME: "   " });
  assert.strictEqual(res2.ok, false);
  assert.strictEqual(res2.errors.length, 1);

  const res3 = validateEnv(schema, { DB_NAME: "mydb" });
  assert.strictEqual(res3.ok, true);
  assert.strictEqual(res3.config.DB_NAME, "mydb");
});

test("Defaults - applied only when missing, never replaces invalid values", () => {
  const schema = {
    TIMEOUT: { type: "number", default: 5000 },
  };

  const resMissing = validateEnv(schema, {});
  assert.strictEqual(resMissing.ok, true);
  assert.strictEqual(resMissing.config.TIMEOUT, 5000);

  const resInvalid = validateEnv(schema, { TIMEOUT: "not-number" });
  assert.strictEqual(resInvalid.ok, false);
  assert.strictEqual(resInvalid.config.TIMEOUT, undefined);
});

test("Error collection - gathers all errors in one pass", () => {
  const schema = {
    PORT: { type: "port", required: true },
    ENV: { type: "enum", values: ["dev", "prod"], required: true },
    API_URL: { type: "url", required: true },
  };

  const res = validateEnv(schema, {
    PORT: "invalid",
    ENV: "invalid",
    API_URL: "invalid",
  });

  assert.strictEqual(res.ok, false);
  assert.strictEqual(res.errors.length, 3);
  assert.deepStrictEqual(res.config, {});
});
