
import { validateEnv } from "./src/validate.js";

console.log("Envocado test started!")
const schema = {
  PORT: {
    type: "number",
    required: true,
  },
  NODE_ENV: {
  type: "enum",
  values: ["development", "production", "test"],
  default: "development",
},
  DEBUG: {
    type: "boolean",
    default: false,
  },
};

const result = validateEnv(schema, {
  PORT: "Infinity",
  NODE_ENV : "staging",
  DEBUG: "true",
});

console.log(result);
