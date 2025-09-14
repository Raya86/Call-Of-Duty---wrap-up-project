import type { FastifyInstance } from "fastify";
import {
  BadRequestSchema,
  ErrorSchema,
  OutputSoldierSchema,
  SoldierBaseSchema,
  IdSchema,
  GetSoldierSchema,
  SoldierQuerySchema,
  NoContentSchema,
  SoldierUpdateSchema,
} from "../types/soldierType.js";
import { StatusCodes } from "http-status-codes";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createSoldierHandler,
  getSoldierHandler,
  getSoldiersQueryHandler,
  deleteSoldierHandler,
  updateSoldierHandler,
} from "../controllers/soldierController.js";
import z from "zod";

const soldierRouter = async (app: FastifyInstance) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.post(
    "",
    {
      schema: {
        body: SoldierBaseSchema,
        response: {
          [StatusCodes.CREATED]: OutputSoldierSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.CONFLICT]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    createSoldierHandler
  );
  server.get(
    "/:id",
    {
      schema: {
        params: IdSchema,
        response: {
          [StatusCodes.OK]: OutputSoldierSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.NOT_FOUND]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getSoldierHandler
  );
  server.get(
    "",
    {
      schema: {
        querystring: SoldierQuerySchema,
        response: {
          [StatusCodes.OK]: z.array(GetSoldierSchema),
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getSoldiersQueryHandler
  );
  server.delete(
    "/:id",
    {
      schema: {
        params: IdSchema,
        response: {
          [StatusCodes.NO_CONTENT]: NoContentSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.NOT_FOUND]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    deleteSoldierHandler
  );
  server.patch(
    "/:id",
    {
      schema: {
        body: SoldierUpdateSchema,
        response: {
          [StatusCodes.OK]: OutputSoldierSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.NOT_FOUND]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    updateSoldierHandler
  );
};

export { soldierRouter };
