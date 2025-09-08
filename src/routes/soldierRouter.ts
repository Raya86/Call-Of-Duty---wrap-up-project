import type { FastifyInstance } from "fastify";
import {
  BadRequestSchema,
  ErrorSchema,
  OutputSoldierSchema,
  SoldierBaseSchema,
  IdSchema,
} from "../types/soldierType.js";
import { StatusCodes } from "http-status-codes";
import {
  createSoldierHandler,
  getSoldierHandler,
} from "../controllers/soldierController.js";

const soldierRouter = async (server: FastifyInstance) => {
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
};

export { soldierRouter };
