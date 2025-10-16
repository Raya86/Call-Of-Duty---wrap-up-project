import type { FastifyInstance } from "fastify";
import {
  DutyDbInputSchema,
  DutyIdSchema,
  DutyQuerySchema,
} from "../types/dutyType.js";
import { BadRequestSchema, ErrorSchema } from "../types/errorType.js";
import { StatusCodes } from "http-status-codes";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createDutyHandler,
  getDutiesQueryHandler,
  getDutyByIdHandler,
} from "../controllers/dutyController.js";
import z from "zod";

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
  server.get(
    "",
    {
      schema: {
        querystring: DutyQuerySchema,
        response: {
          [StatusCodes.OK]: z.array(DutyDbInputSchema),
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getDutiesQueryHandler
  );
    server.get(
    "/:id",
    {
      schema: {
        params: DutyIdSchema,
        response: {
          [StatusCodes.OK]: DutyDbInputSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.NOT_FOUND]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getDutyByIdHandler
  );
};

export { dutyRouter };
