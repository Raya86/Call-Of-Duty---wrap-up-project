import { type FastifyInstance } from "fastify";
import { buildApp } from "./app.js";

let server: FastifyInstance;
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = "0.0.0.0";

const start = async () => {
  server = await buildApp();

  server.listen({ port: PORT, host: HOST }, (err: Error | null) => {
    if (err) {
      server.log.error({ err }, "Error starting Fastify server");
      shutdown(err.name);
    }
  });
};

const shutdown = async (signal: string) => {
  server.log.info({ signal }, "shutting down...");
  let exitCode = 0;
  try {
    await server.close();
  } catch (err) {
    exitCode = 1;
    server.log.error({ err }, "failed to close fastify");
  }

  process.exit(exitCode);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", () => shutdown("Uncaught Exception"));
process.on("unhandledRejection", () => shutdown("Unhandled Rejection"));
start();
