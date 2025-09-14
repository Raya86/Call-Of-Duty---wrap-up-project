import fastify from "fastify";
import { healthRouter } from "./routes/healthRouter.js";
import { closeDB, connectDB } from "./db.js";

const buildApp = async () => {
  const app = fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  app.addHook("onReady", async () => {
    await connectDB();
    app.log.info("MongoDB connected");
  });

  app.addHook("onClose", async () => {
    await closeDB();
    app.log.info("MongoDB connection closed");
  });

  app.register(healthRouter, { prefix: "health" });

  return app;
};

export { buildApp };
