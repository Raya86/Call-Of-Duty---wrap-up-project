import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { getDb } from "../db.js";

const healthHandler = async (_req: FastifyRequest, res: FastifyReply) => {
  return res.status(StatusCodes.OK).send({ status: "ok" });
};

const dbHealthHandler = async (_req: FastifyRequest, res: FastifyReply) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);

  try {
    await getDb().command({ ping: 1 }, { signal: controller.signal });

    return res.status(StatusCodes.OK).send({ status: "connected" });
  } catch {
    return res
      .status(StatusCodes.SERVICE_UNAVAILABLE)
      .send({ status: "not connected" });
  } finally {
    clearTimeout(timeout);
  }
};

export { healthHandler, dbHealthHandler };
