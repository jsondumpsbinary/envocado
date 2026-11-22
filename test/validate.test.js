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

test("Strings - minLength and maxLength validation", () => {
  const schema = {
    API_KEY: { type: "string", required: true, minLength: 5, maxLength: 10 },
  };

  const resShort = validateEnv(schema, { API_KEY: "abc" });
  assert.strictEqual(resShort.ok, false);
  assert.match(resShort.errors[0].message, /at least 5 characters/);

  const resLong = validateEnv(schema, { API_KEY: "1234567890123" });
  assert.strictEqual(resLong.ok, false);
  assert.match(resLong.errors[0].message, /at most 10 characters/);

  const resValid = validateEnv(schema, { API_KEY: "secret1" });
  assert.strictEqual(resValid.ok, true);
  assert.strictEqual(resValid.config.API_KEY, "secret1");
});

test("Numbers - handles valid conversion, NaN, Infinity, min, and max", () => {
  const schema = {
    COUNT: { type: "number", min: 1, max: 100 },
  };

  const resValid = validateEnv(schema, { COUNT: "42" });
  assert.strictEqual(resValid.ok, true);
  assert.strictEqual(resValid.config.COUNT, 42);

  const resNan = validateEnv(schema, { COUNT: "not-a-number" });
  assert.strictEqual(resNan.ok, false);

  const resSpace = validateEnv(schema, { COUNT: "   " });
  assert.strictEqual(resSpace.ok, true);

  const resInf = validateEnv(schema, { COUNT: "Infinity" });
  assert.strictEqual(resInf.ok, false);

  const resMin = validateEnv(schema, { COUNT: "0" });
  assert.strictEqual(resMin.ok, false);
  assert.match(resMin.errors[0].message, /greater than or equal to 1/);

  const resMax = validateEnv(schema, { COUNT: "150" });
  assert.strictEqual(resMax.ok, false);
  assert.match(resMax.errors[0].message, /less than or equal to 100/);
});

test("Integers - accepts whole numbers and rejects decimals", () => {
  const schema = {
    RETRIES: { type: "int", min: 0 },
  };

  const resInt = validateEnv(schema, { RETRIES: "5" });
  assert.strictEqual(resInt.ok, true);
  assert.strictEqual(resInt.config.RETRIES, 5);

  const resDec = validateEnv(schema, { RETRIES: "5.5" });
  assert.strictEqual(resDec.ok, false);
  assert.match(resDec.errors[0].message, /must be an integer/);
});

test("Ports - validates numbers strictly between 1 and 65535", () => {
  const schema = {
    APP_PORT: { type: "port", default: 3000 },
  };

  const resDef = validateEnv(schema, {});
  assert.strictEqual(resDef.ok, true);
  assert.strictEqual(resDef.config.APP_PORT, 3000);

  const resPort = validateEnv(schema, { APP_PORT: "8080" });
  assert.strictEqual(resPort.ok, true);
  assert.strictEqual(resPort.config.APP_PORT, 8080);

  const resZero = validateEnv(schema, { APP_PORT: "0" });
  assert.strictEqual(resZero.ok, false);

  const resNeg = validateEnv(schema, { APP_PORT: "-10" });
  assert.strictEqual(resNeg.ok, false);

  const resHigh = validateEnv(schema, { APP_PORT: "70000" });
  assert.strictEqual(resHigh.ok, false);
});

test("Booleans - accepts true/false strings and boolean literals, rejects others", () => {
  const schema = {
    FEATURE_A: { type: "boolean" },
    FEATURE_B: { type: "boolean" },
  };

  const resValid = validateEnv(schema, {
    FEATURE_A: "true",
    FEATURE_B: false,
  });
  assert.strictEqual(resValid.ok, true);
  assert.strictEqual(resValid.config.FEATURE_A, true);
  assert.strictEqual(resValid.config.FEATURE_B, false);

  const resInvalid = validateEnv(schema, {
    FEATURE_A: "yes",
  });
  assert.strictEqual(resInvalid.ok, false);
  assert.match(resInvalid.errors[0].message, /must be either "true" or "false"/);
});

test("Enums - validates against allowed values and lists them on error", () => {
  const schema = {
    ENV: {
      type: "enum",
      values: ["development", "staging", "production"],
      default: "development",
    },
  };

  const resValid = validateEnv(schema, { ENV: "production" });
  assert.strictEqual(resValid.ok, true);
  assert.strictEqual(resValid.config.ENV, "production");

  const resBad = validateEnv(schema, { ENV: "local" });
  assert.strictEqual(resBad.ok, false);
  assert.match(resBad.errors[0].message, /development, staging, production/);
});

test("URLs - validates standard URLs and protocol restrictions", () => {
  const schema = {
    SITE_URL: { type: "url", required: true, protocols: ["http:", "https:"] },
  };

  const resValid = validateEnv(schema, { SITE_URL: "https://example.com/api" });
  assert.strictEqual(resValid.ok, true);

  const resInvalid = validateEnv(schema, { SITE_URL: "not-a-valid-url" });
  assert.strictEqual(resInvalid.ok, false);

  const resProto = validateEnv(schema, { SITE_URL: "ftp://files.example.com" });
  assert.strictEqual(resProto.ok, false);
  assert.match(resProto.errors[0].message, /must use one of the following protocols/);
});

test("Lists - parses delimited strings and trims whitespace", () => {
  const schema = {
    ALLOWED_ORIGINS: { type: "list", separator: "," },
  };

  const res = validateEnv(schema, {
    ALLOWED_ORIGINS: "http://localhost:3000, https://app.example.com , https://admin.example.com",
  });
  assert.strictEqual(res.ok, true);
  assert.deepStrictEqual(res.config.ALLOWED_ORIGINS, [
    "http://localhost:3000",
    "https://app.example.com",
    "https://admin.example.com",
  ]);
});

test("Secret protection - never exposes secret values in error messages", () => {
  const secretValue = "super_secret_token_12345";
  const schema = {
    SECRET_KEY: {
      type: "number",
      required: true,
      secret: true,
    },
  };

  const res = validateEnv(schema, {
    SECRET_KEY: secretValue,
  });

  assert.strictEqual(res.ok, false);
  const errorMsg = res.errors[0].message;
  assert.strictEqual(errorMsg.includes(secretValue), false);
});
