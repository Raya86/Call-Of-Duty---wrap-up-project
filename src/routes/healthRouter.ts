import type { FastifyInstance } from "fastify";
import {
  dbHealthHandler,
  healthHandler,
} from "../controllers/healthController.js";

const healthRouter = async (server: FastifyInstance) => {
  server.get("", healthHandler);
  server.get("/db", dbHealthHandler);
};

export { healthRouter };
