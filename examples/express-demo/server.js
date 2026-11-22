// In a published package, you would import: import { createEnv } from "envocado";
// For this local demo, we import directly from our src directory:
import { createEnv } from "../../src/index.js";

// 1. Define the schema required for this application
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
  API_SECRET: {
    type: "string",
    required: true,
    secret: true,
    minLength: 16,
  },
};

// 2. Validate environment before doing anything else
let env;
try {
  env = createEnv(schema, process.env);
  console.log("🥑 Envocado: Environment configuration is valid!");
} catch (error) {
  console.error(error.message);
  console.error("Application startup aborted due to invalid environment variables.");
  process.exit(1);
}

// 3. Start Express server (or fallback to built-in http if express not installed)
async function startServer() {
  try {
    const express = (await import("express")).default;
    const app = express();

    app.get("/", (req, res) => {
      res.json({
        message: "Envocado Express Demo is running!",
        environment: env.NODE_ENV,
        port: env.PORT,
      });
    });

    app.listen(env.PORT, () => {
      console.log(`🚀 Express server running at http://localhost:${env.PORT}`);
    });
  } catch (err) {
    // If express module is not installed yet, provide helpful message
    console.log(`\nNote: 'express' package is not installed yet in this demo folder.`);
    console.log(`Run 'npm install' inside examples/express-demo to run with Express.`);
    console.log(`Validated Config: PORT=${env.PORT}, NODE_ENV=${env.NODE_ENV}, DATABASE_URL=${env.DATABASE_URL}`);
  }
}

startServer();
