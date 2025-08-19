import fastify from "fastify";
import { healthRouter } from "./routes/healthRouter.js";

const buildApp = async () => {
  const app = fastify();
  app.register(healthRouter, { prefix: "health" });

  return app;
};

export { buildApp };
