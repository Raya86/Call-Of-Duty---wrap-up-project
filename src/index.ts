import { fastify, type FastifyInstance } from "fastify";
import { closeDB, connectDB } from "./db.js";
import { healthRouter } from "./routes/healthRouter.js";

let server: FastifyInstance;
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = "0.0.0.0";

const start = async () => {
  await connectDB();
  server = fastify();
  server.register(healthRouter, { prefix: "health" });

  server.addHook("onClose", async () => {
    await closeDB();
    console.log("MongoDB connection closed");
  });

  server.listen(
    { port: PORT, host: HOST },
    (err: Error | null, address: string) => {
      if (err) {
        console.error(err);
        shutdown(err.name);
      }
      console.log(`Server listening at ${address}`);
    }
  );
};

const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down...`);
  try {
    await server.close();
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", () => shutdown("Uncaught Exception"));
process.on("unhandledRejection", () => shutdown("Unhandled Rejection"));
start();

export { server };
