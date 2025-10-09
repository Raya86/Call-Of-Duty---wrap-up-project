import type { FastifyInstance } from "fastify";
import { DutyDbInputSchema } from "../types/dutyType.js";
import { BadRequestSchema, ErrorSchema } from "../types/errorType.js";
import { StatusCodes } from "http-status-codes";
import { createDutyHandler } from "../controllers/dutyController.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

const dutyRouter = async (app: FastifyInstance) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.post(
    "",
    {
      schema: {
        body: DutyDbInputSchema,
        response: {
          [StatusCodes.CREATED]: DutyDbInputSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.CONFLICT]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    createDutyHandler
  );
};

export { dutyRouter };
